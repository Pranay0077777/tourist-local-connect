import { useState, useEffect } from "react";
import { api } from "@/lib/api";
import { Button } from "./ui/button";
import { ChevronLeft, ChevronRight, CheckCircle2, XCircle, Slash } from "lucide-react";
import { toast } from "sonner";
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";

interface GuideCalendarProps {
    guideId: string;
    isEditable?: boolean;
    className?: string;
}

type AvailabilityStatus = 'available' | 'busy' | 'off';

export function GuideCalendar({ guideId, isEditable = false, className = "" }: GuideCalendarProps) {
    const [availability, setAvailability] = useState<Record<string, AvailabilityStatus>>({});
    const [loading, setLoading] = useState(true);
    const [currentDate, setCurrentDate] = useState(new Date());

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const minMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    const maxMonth = new Date(today.getFullYear(), today.getMonth() + 1, 1);

    useEffect(() => {
        const fetchAvailability = async () => {
            setLoading(true);
            try {
                const data = await api.getAvailability(guideId);
                setAvailability(data);
            } catch (error) {
                console.error("Failed to load availability:", error);
                if (isEditable) toast.error("Failed to load availability");
            } finally {
                setLoading(false);
            }
        };
        fetchAvailability();
    }, [guideId, isEditable]);

    const getDaysInMonth = (date: Date) => {
        const year = date.getFullYear();
        const month = date.getMonth();
        const daysInMonth = new Date(year, month + 1, 0).getDate();
        const firstDayOfMonth = new Date(year, month, 1).getDay();
        return { daysInMonth, firstDayOfMonth };
    };

    const { daysInMonth, firstDayOfMonth } = getDaysInMonth(currentDate);

    const isAtMinMonth = currentDate.getFullYear() === minMonth.getFullYear() && currentDate.getMonth() === minMonth.getMonth();
    const isAtMaxMonth = currentDate.getFullYear() === maxMonth.getFullYear() && currentDate.getMonth() === maxMonth.getMonth();

    const handleMonthChange = (offset: number) => {
        if (offset < 0 && isAtMinMonth) return;
        if (offset > 0 && isAtMaxMonth) return;
        const newDate = new Date(currentDate);
        newDate.setMonth(newDate.getMonth() + offset);
        setCurrentDate(newDate);
    };

    const toggleStatus = async (day: number) => {
        if (!isEditable) return;

        const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
        // Don't allow editing past dates
        if (date < today) return;

        const dateString = date.toISOString().split('T')[0];

        const currentStatus = availability[dateString] || 'available';
        const nextStatus: AvailabilityStatus =
            currentStatus === 'available' ? 'busy' :
                currentStatus === 'busy' ? 'off' : 'available';

        // Optimistic update
        setAvailability(prev => ({
            ...prev,
            [dateString]: nextStatus
        }));

        try {
            await api.updateAvailability(guideId, dateString, nextStatus);
        } catch (error) {
            toast.error("Failed to update status");
            // Revert on error
            setAvailability(prev => ({
                ...prev,
                [dateString]: currentStatus
            }));
        }
    };

    const StatusIcon = ({ status }: { status: AvailabilityStatus }) => {
        switch (status) {
            case 'available': return <CheckCircle2 className="w-4 h-4 text-green-500" />;
            case 'busy': return <XCircle className="w-4 h-4 text-red-500" />;
            case 'off': return <Slash className="w-4 h-4 text-gray-400" />;
            default: return null;
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center p-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
        );
    }

    return (
        <Card className={`border-none shadow-sm ${className}`}>
            <CardHeader className="flex flex-row items-center justify-between pb-4 px-4 sm:px-6">
                <CardTitle className="text-lg font-bold">
                    {currentDate.toLocaleString('default', { month: 'long', year: 'numeric' })}
                </CardTitle>
                <div className="flex gap-1">
                    <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => handleMonthChange(-1)} disabled={isAtMinMonth}>
                        <ChevronLeft className={`w-4 h-4 ${isAtMinMonth ? 'opacity-30' : ''}`} />
                    </Button>
                    <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => handleMonthChange(1)} disabled={isAtMaxMonth}>
                        <ChevronRight className={`w-4 h-4 ${isAtMaxMonth ? 'opacity-30' : ''}`} />
                    </Button>
                </div>
            </CardHeader>
            <CardContent className="px-4 sm:px-6">
                <div className="grid grid-cols-7 mb-2 text-center text-xs font-semibold text-gray-400">
                    {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, idx) => (
                        <div key={`${day}-${idx}`} className="py-1">{day}</div>
                    ))}
                </div>

                <div className="grid grid-cols-7 gap-1.5">
                    {Array.from({ length: firstDayOfMonth }).map((_, i) => (
                        <div key={`empty-${i}`} className="aspect-square bg-gray-50/50 rounded-lg"></div>
                    ))}

                    {Array.from({ length: daysInMonth }).map((_, i) => {
                        const day = i + 1;
                        const dateDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
                        const dateString = dateDate.toISOString().split('T')[0];
                        const status = availability[dateString] || 'available';
                        const isToday = new Date().toDateString() === dateDate.toDateString();
                        const isPast = dateDate < today;

                        return (
                            <button
                                key={day}
                                disabled={!isEditable || isPast}
                                onClick={() => toggleStatus(day)}
                                className={`aspect-square rounded-lg border flex flex-col items-center justify-center gap-0.5 transition-all relative group
                                ${isPast ? 'border-gray-100 bg-gray-100/50 opacity-40 cursor-not-allowed' :
                                    status === 'available' ? 'border-green-100 bg-green-50/30' :
                                        status === 'busy' ? 'border-red-100 bg-red-50/30' :
                                            'border-gray-100 bg-gray-50'}
                                ${isEditable && !isPast ? 'hover:scale-105 active:scale-95 cursor-pointer' : isPast ? 'cursor-not-allowed' : 'cursor-default'}
                                ${isToday ? 'ring-1 ring-primary ring-offset-1' : ''}
                            `}
                            >
                                <span className={`text-xs font-bold ${isPast ? 'text-gray-300' : status === 'off' ? 'text-gray-400' : 'text-gray-900'}`}>{day}</span>
                                {!isPast && <StatusIcon status={status} />}
                                {isEditable && !isPast && <div className="absolute inset-0 bg-black/0 hover:bg-black/5 rounded-lg transition-colors" />}
                            </button>
                        );
                    })}
                </div>

                {isEditable && (
                    <div className="mt-4 pt-4 border-t flex flex-wrap gap-3 text-[10px] text-gray-500 justify-center">
                        <div className="flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3 text-green-500" /> Available
                        </div>
                        <div className="flex items-center gap-1">
                            <XCircle className="w-3 h-3 text-red-500" /> Busy
                        </div>
                        <div className="flex items-center gap-1">
                            <Slash className="w-3 h-3 text-gray-400" /> Off
                        </div>
                    </div>
                 )}
            </CardContent>
        </Card>
    );
}
