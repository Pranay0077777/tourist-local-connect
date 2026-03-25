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

    useEffect(() => {
        const fetchAvailability = async () => {
            setLoading(true);
            try {
                const data = await api.getAvailability(guideId);
                setAvailability(data);
            } catch (error) {
                console.error("Failed to load availability:", error);
                // Don't toast on every profile load if read-only
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

    const handleMonthChange = (offset: number) => {
        const newDate = new Date(currentDate);
        newDate.setMonth(newDate.getMonth() + offset);
        setCurrentDate(newDate);
    };

    const toggleStatus = async (day: number) => {
        if (!isEditable) return;

        const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
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
                    <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => handleMonthChange(-1)}>
                        <ChevronLeft className="w-4 h-4" />
                    </Button>
                    <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => handleMonthChange(1)}>
                        <ChevronRight className="w-4 h-4" />
                    </Button>
                </div>
            </CardHeader>
            <CardContent className="px-4 sm:px-6">
                <div className="grid grid-cols-7 mb-2 text-center text-xs font-semibold text-gray-400">
                    {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map(day => (
                        <div key={day} className="py-1">{day}</div>
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

                        return (
                            <button
                                key={day}
                                disabled={!isEditable}
                                onClick={() => toggleStatus(day)}
                                className={`aspect-square rounded-lg border flex flex-col items-center justify-center gap-0.5 transition-all relative group
                                ${status === 'available' ? 'border-green-100 bg-green-50/30' :
                                        status === 'busy' ? 'border-red-100 bg-red-50/30' :
                                            'border-gray-100 bg-gray-50'}
                                ${isEditable ? 'hover:scale-105 active:scale-95 cursor-pointer' : 'cursor-default'}
                                ${isToday ? 'ring-1 ring-primary ring-offset-1' : ''}
                            `}
                            >
                                <span className={`text-xs font-bold ${status === 'off' ? 'text-gray-400' : 'text-gray-900'}`}>{day}</span>
                                <StatusIcon status={status} />
                                {isEditable && <div className="absolute inset-0 bg-black/0 hover:bg-black/5 rounded-lg transition-colors" />}
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
