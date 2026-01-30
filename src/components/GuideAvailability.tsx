import { useState, useEffect } from "react";
import { type LocalUser } from "@/lib/localStorage";
import { RoleAwareHeader } from "./RoleAwareHeader";
import { api } from "@/lib/api";
import { Button } from "./ui/button";
import { ChevronLeft, ChevronRight, CheckCircle2, XCircle, Slash, ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";

interface GuideAvailabilityProps {
    user: LocalUser;
    onNavigate: (page: string) => void;
    onLogout: () => void;
}

type AvailabilityStatus = 'available' | 'busy' | 'off';

export function GuideAvailability({ user, onNavigate, onLogout }: GuideAvailabilityProps) {
    const [availability, setAvailability] = useState<Record<string, AvailabilityStatus>>({});
    const [loading, setLoading] = useState(true);
    const [currentDate, setCurrentDate] = useState(new Date());

    useEffect(() => {
        const fetchAvailability = async () => {
            try {
                const data = await api.getAvailability(user.id);
                setAvailability(data);
            } catch (error) {
                toast.error("Failed to load availability");
            } finally {
                setLoading(false);
            }
        };
        fetchAvailability();
    }, [user.id]);

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
            await api.updateAvailability(user.id, dateString, nextStatus);
        } catch (error) {
            toast.error("Failed to update status");
            // Revert on error
            setAvailability(prev => ({
                ...prev,
                [dateString]: currentStatus
            }));
        }
    };

    const handleMarkWeekendsOff = async () => {
        const updates: Record<string, AvailabilityStatus> = {};
        const { daysInMonth } = getDaysInMonth(currentDate);

        for (let i = 1; i <= daysInMonth; i++) {
            const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), i);
            const dayOfWeek = date.getDay(); // 0 = Sunday

            if (dayOfWeek === 0) {
                const dateString = date.toISOString().split('T')[0];
                updates[dateString] = 'busy'; // User requested "red x symbol" which corresponds to 'busy'
            }
        }

        // Optimistic update
        setAvailability(prev => ({
            ...prev,
            ...updates
        }));

        // In a real app, send bulk update to API
        // await api.bulkUpdateAvailability(user.id, updates);
        toast.success("Weekends marked as busy!");
    };

    const StatusIcon = ({ status }: { status: AvailabilityStatus }) => {
        switch (status) {
            case 'available': return <CheckCircle2 className="w-4 h-4 text-green-500" />;
            case 'busy': return <XCircle className="w-4 h-4 text-red-500" />;
            case 'off': return <Slash className="w-4 h-4 text-gray-400" />;
            default: return null;
        }
    };

    return (
        <div className="min-h-screen bg-gray-50">
            <RoleAwareHeader
                user={user}
                currentPage="calendar"
                onNavigate={onNavigate}
                onLogout={onLogout}
            />

            <main className="container mx-auto px-4 py-8 max-w-5xl">
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onNavigate('home')}
                    className="mb-6 text-gray-600 hover:text-gray-900"
                >
                    <ArrowLeft className="w-4 h-4 mr-1" /> Back to Dashboard
                </Button>

                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">Availability Calendar</h1>
                        <p className="text-gray-500">Manage your schedule and time off</p>
                    </div>
                </div>

                {loading ? (
                    <div className="flex justify-center p-12">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
                    </div>
                ) : (
                    <div className="grid lg:grid-cols-3 gap-8">
                        {/* Calendar Grid */}
                        <Card className="lg:col-span-2 border-none shadow-md">
                            <CardHeader className="flex flex-row items-center justify-between pb-4">
                                <CardTitle className="text-xl font-bold">
                                    {currentDate.toLocaleString('default', { month: 'long', year: 'numeric' })}
                                </CardTitle>
                                <div className="flex gap-2">
                                    <Button variant="outline" size="icon" onClick={() => handleMonthChange(-1)}>
                                        <ChevronLeft className="w-4 h-4" />
                                    </Button>
                                    <Button variant="outline" size="icon" onClick={() => handleMonthChange(1)}>
                                        <ChevronRight className="w-4 h-4" />
                                    </Button>
                                </div>
                            </CardHeader>
                            <CardContent>
                                {/* Days Header */}
                                <div className="grid grid-cols-7 mb-2 text-center text-sm font-medium text-gray-400">
                                    {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                                        <div key={day} className="py-2">{day}</div>
                                    ))}
                                </div>

                                {/* Days Grid */}
                                <div className="grid grid-cols-7 gap-2">
                                    {/* Empty cells for previous month */}
                                    {Array.from({ length: firstDayOfMonth }).map((_, i) => (
                                        <div key={`empty-${i}`} className="aspect-square bg-gray-50/50 rounded-lg"></div>
                                    ))}

                                    {/* Actual days */}
                                    {Array.from({ length: daysInMonth }).map((_, i) => {
                                        const day = i + 1;
                                        const dateDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
                                        const dateString = dateDate.toISOString().split('T')[0];
                                        const status = availability[dateString] || 'available';
                                        const isToday = new Date().toDateString() === dateDate.toDateString();

                                        return (
                                            <button
                                                key={day}
                                                onClick={() => toggleStatus(day)}
                                                className={`aspect-square rounded-xl border-2 flex flex-col items-center justify-center gap-1 transition-all relative group
                                                ${status === 'available' ? 'border-green-100 bg-green-50/30 hover:bg-green-50' :
                                                        status === 'busy' ? 'border-red-100 bg-red-50/30 hover:bg-red-50' :
                                                            'border-gray-100 bg-gray-50 hover:bg-gray-100'}
                                                ${isToday ? 'ring-2 ring-primary ring-offset-2' : ''}
                                            `}
                                            >
                                                <span className={`text-lg font-bold ${status === 'off' ? 'text-gray-400' : 'text-gray-900'}`}>{day}</span>
                                                <StatusIcon status={status} />
                                                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 rounded-xl transition-colors" />
                                            </button>
                                        );
                                    })}
                                </div>
                            </CardContent>
                        </Card>

                        {/* Sidebar / Legend / Quick Actions */}
                        <div className="space-y-6">
                            <Card>
                                <CardHeader>
                                    <CardTitle className="text-lg">Legend</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <CheckCircle2 className="w-5 h-5 text-green-500" />
                                            <span className="text-gray-700">Available</span>
                                        </div>
                                        <span className="text-xs text-gray-500">Open for bookings</span>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <XCircle className="w-5 h-5 text-red-500" />
                                            <span className="text-gray-700">Busy / Booked</span>
                                        </div>
                                        <span className="text-xs text-gray-500">Fully booked</span>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <Slash className="w-5 h-5 text-gray-400" />
                                            <span className="text-gray-700">Time Off</span>
                                        </div>
                                        <span className="text-xs text-gray-500">Not working</span>
                                    </div>
                                </CardContent>
                            </Card>

                            <Card className="bg-primary/5 border-primary/20">
                                <CardHeader>
                                    <CardTitle className="text-lg text-primary">Quick Settings</CardTitle>
                                    <CardDescription>Bulk update your schedule</CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-2">
                                    <Button
                                        onClick={handleMarkWeekendsOff}
                                        className="w-full bg-white text-primary border border-primary/20 hover:bg-primary/10 mb-2"
                                    >
                                        Mark Sundays Off
                                    </Button>
                                    <Button className="w-full bg-white text-primary border border-primary/20 hover:bg-primary/10">
                                        Sync with Google Calendar
                                    </Button>
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
}
