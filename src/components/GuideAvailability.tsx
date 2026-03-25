import { useState } from "react";
import { type LocalUser } from "@/lib/localStorage";
import { RoleAwareHeader } from "./RoleAwareHeader";
import { api } from "@/lib/api";
import { Button } from "./ui/button";
import { CheckCircle2, XCircle, Slash, ArrowLeft } from "lucide-react";
import { GuideCalendar } from "./GuideCalendar";
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

export function GuideAvailability({ user, onNavigate, onLogout }: GuideAvailabilityProps) {
    const [refreshKey, setRefreshKey] = useState(0);

    const handleMarkWeekendsOff = async () => {
        const today = new Date();
        const year = today.getFullYear();
        const month = today.getMonth();
        const daysInMonth = new Date(year, month + 1, 0).getDate();

        toast.info("Marking Sundays as busy for this month...");
        
        try {
            let count = 0;
            for (let i = 1; i <= daysInMonth; i++) {
                const date = new Date(year, month, i);
                if (date.getDay() === 0) { // Sunday
                    const dateString = date.toISOString().split('T')[0];
                    await api.updateAvailability(user.id, dateString, 'busy');
                    count++;
                }
            }
            if (count > 0) {
                toast.success(`Successfully marked ${count} Sundays as busy!`);
                setRefreshKey(prev => prev + 1); // Trigger re-render of calendar
            } else {
                toast.info("No Sundays found to update in the current month.");
            }
        } catch (error) {
            toast.error("Failed to update some dates. Please try again.");
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

                <div className="grid lg:grid-cols-3 gap-8">
                    {/* Calendar Component */}
                    <div className="lg:col-span-2">
                        <GuideCalendar 
                            key={refreshKey}
                            guideId={user.id} 
                            isEditable={true} 
                            className="shadow-md border border-gray-100"
                        />
                    </div>

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
            </main>
        </div>
    );
}
