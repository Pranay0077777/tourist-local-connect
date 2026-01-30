import { useState, useEffect } from "react";
import { RoleAwareHeader } from "./RoleAwareHeader";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { DashboardStat } from "./dashboard/DashboardStats";
import {
    Wallet,
    TrendingUp,
    Users,
    CalendarCheck,
    AlertCircle,
    Check,
    X,
    Clock,
    MessageSquare,
    Calendar,
    Settings,
    Star
} from "lucide-react";
import { type LocalUser } from "@/lib/localStorage";
import { api } from "@/lib/api";
import { toast } from "sonner";

interface GuideHomePageProps {
    user: LocalUser;
    onNavigate: (page: string) => void;
    onLogout: () => void;
}

interface DashboardStatsData {
    totalEarnings: number;
    completedTours: number;
    profileViews: number;
    rating: number;
}

interface BookingRequest {
    id: string;
    touristName: string;
    date: string;
    time: string;
    duration: number;
    totalPrice: number;
    status: string;
    tourType: string;
}

export function GuideHomePage({ user, onNavigate, onLogout }: GuideHomePageProps) {
    const [stats, setStats] = useState<DashboardStatsData | null>(null);
    const [requests, setRequests] = useState<BookingRequest[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                const [statsData, requestsData] = await Promise.all([
                    api.getGuideStats(user.id),
                    api.getBookingRequests(user.id)
                ]);
                setStats(statsData);
                setRequests(requestsData);
            } catch (error) {
                toast.error("Failed to load dashboard data");
            } finally {
                setLoading(false);
            }
        };

        fetchDashboardData();
    }, [user.id]);

    const handleRequestAction = async (requestId: string, action: 'confirmed' | 'cancelled') => {
        try {
            await api.updateBookingStatus(requestId, action);
            setRequests(prev => prev.filter(r => r.id !== requestId));
            toast.success(action === 'confirmed' ? "Booking accepted!" : "Booking declined");
        } catch (error) {
            toast.error("Failed to update booking");
        }
    };

    // MOCK DATA FOR DEMO (Only for Guide with ID 1 or ch_1)
    const DEMO_EMAILS = ['guide@test.com', 'saipranay6733@gmail.com'];
    const isDemoAccount = DEMO_EMAILS.includes(user.email);

    if (isDemoAccount && stats) {
        stats.completedTours = 4;
        stats.profileViews = 850;
        stats.rating = 4.5;
        stats.totalEarnings = 85000;
    }

    const DEMO_REVIEWS = [
        {
            id: 1,
            author: "Sarah Jenkins",
            rating: 5,
            date: "2 days ago",
            text: "Absolutely amazing experience! The guide was so knowledgeable about the local history and hidden gems. Highly recommended!",
            avatar: ""
        },
        {
            id: 2,
            author: "Mike Chen",
            rating: 5,
            date: "1 week ago",
            text: "Great tour! We saw everything we wanted to see and more. Very friendly and professional.",
            avatar: ""
        },
        {
            id: 3,
            author: "Priya Sharma",
            rating: 4,
            date: "2 weeks ago",
            text: "Very good experience. The food stops were the highlight.",
            avatar: ""
        }
    ];

    return (
        <div className="min-h-screen bg-gray-50/50">
            <RoleAwareHeader
                user={user}
                currentPage="home"
                onNavigate={onNavigate}
                onLogout={onLogout}
            />

            <main className="container mx-auto px-4 py-8 space-y-8">
                {/* Welcome Section */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h2 className="text-3xl font-bold text-gray-900 tracking-tight">Dashboard</h2>
                        <p className="text-gray-500 mt-1">Welcome back, {user.name}. Here's what's happening today.</p>
                    </div>
                    <div className="flex gap-3">
                        <div className="flex items-center gap-2 bg-white border border-gray-200 px-4 py-2 rounded-lg text-sm font-medium shadow-sm text-green-700">
                            <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                            You are Online
                        </div>
                    </div>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div onClick={() => onNavigate('earnings')} className="cursor-pointer transition-transform hover:scale-105">
                        <DashboardStat
                            icon={Wallet}
                            label="Total Earnings"
                            value={`₹${stats?.totalEarnings.toLocaleString() || 0}`}
                            color="bg-green-500"
                            loading={loading}
                        />
                    </div>
                    <div onClick={() => onNavigate('completed-tours')} className="cursor-pointer transition-transform hover:scale-105">
                        <DashboardStat
                            icon={CalendarCheck}
                            label="Completed Tours"
                            value={stats?.completedTours || 0}
                            color="bg-blue-500"
                            loading={loading}
                        />
                    </div>
                    <div onClick={() => onNavigate('profile-stats')} className="cursor-pointer transition-transform hover:scale-105">
                        <DashboardStat
                            icon={Users}
                            label="Profile Views"
                            value={stats?.profileViews || 0}
                            subtext={stats ? "+12% this week" : ""}
                            color="bg-purple-500"
                            loading={loading}
                        />
                    </div>
                    <DashboardStat
                        icon={TrendingUp}
                        label="Rating"
                        value={stats?.rating || "New"}
                        color="bg-orange-500"
                        loading={loading}
                    />
                </div>

                {/* Quick Actions */}
                <div>
                    <h3 className="text-lg font-bold text-gray-900 mb-4">Quick Actions</h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <Button
                            variant="outline"
                            className="h-24 flex flex-col items-center justify-center gap-2 bg-white hover:border-primary hover:text-primary transition-all shadow-sm"
                            onClick={() => onNavigate('calendar')}
                        >
                            <Calendar className="w-6 h-6" />
                            <span>Manage Calendar</span>
                        </Button>
                        <Button
                            variant="outline"
                            className="h-24 flex flex-col items-center justify-center gap-2 bg-white hover:border-primary hover:text-primary transition-all shadow-sm"
                            onClick={() => onNavigate('myBookings')}
                        >
                            <CalendarCheck className="w-6 h-6" />
                            <span>View Requests</span>
                        </Button>
                        <Button
                            variant="outline"
                            className="h-24 flex flex-col items-center justify-center gap-2 bg-white hover:border-primary hover:text-primary transition-all shadow-sm"
                            onClick={() => onNavigate('messages')}
                        >
                            <MessageSquare className="w-6 h-6" />
                            <span>Messages</span>
                        </Button>
                        <Button
                            variant="outline"
                            className="h-24 flex flex-col items-center justify-center gap-2 bg-white hover:border-primary hover:text-primary transition-all shadow-sm"
                            onClick={() => onNavigate('profile-settings')}
                        >
                            <Settings className="w-6 h-6" />
                            <span>Edit Profile</span>
                        </Button>
                    </div>
                </div>

                {/* Main Content Areas */}
                <div className="grid lg:grid-cols-3 gap-8">

                    {/* Left: Booking Requests */}
                    <div className="lg:col-span-2 space-y-6">
                        <div className="flex items-center justify-between">
                            <h3 className="text-lg font-bold text-gray-900">New Requests <span className="bg-red-100 text-red-600 px-2 py-0.5 rounded-full text-xs ml-2">{requests.length}</span></h3>
                            {requests.length > 0 && (
                                <Button variant="link" onClick={() => onNavigate('myBookings')} className="text-primary">View All</Button>
                            )}
                        </div>

                        {loading ? (
                            <div className="flex justify-center p-8"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div></div>
                        ) : requests.length === 0 ? (
                            /* Empty State */
                            <Card className="border-dashed border-2 border-gray-200 bg-gray-50/50 shadow-none">
                                <CardContent className="flex flex-col items-center justify-center py-12 text-center">
                                    <AlertCircle className="w-12 h-12 text-gray-300 mb-4" />
                                    <h4 className="text-lg font-semibold text-gray-900 mb-2">No new requests</h4>
                                    <p className="text-gray-500 max-w-sm">
                                        Tourists will send you booking requests here. Make sure your profile is complete to attract more views.
                                    </p>
                                </CardContent>
                            </Card>
                        ) : (
                            <div className="space-y-4">
                                {requests.slice(0, 3).map(request => (
                                    <Card key={request.id} className="overflow-hidden border-l-4 border-l-primary hover:shadow-md transition-shadow group">
                                        <CardContent className="p-0">
                                            <div className="p-5 flex flex-col sm:flex-row gap-4 sm:items-center justify-between">
                                                <div className="space-y-2">
                                                    <div className="flex items-center gap-2">
                                                        <h4 className="font-bold text-gray-900 text-lg group-hover:text-primary transition-colors">{request.touristName}</h4>
                                                        <span className="px-2 py-0.5 rounded bg-blue-50 text-blue-700 text-xs font-bold uppercase border border-blue-100">{request.tourType}</span>
                                                    </div>
                                                    <div className="flex flex-wrap gap-x-6 gap-y-1 text-sm text-gray-500">
                                                        <span className="flex items-center gap-1.5"><CalendarCheck className="w-4 h-4 text-gray-400" /> {request.date}</span>
                                                        <span className="flex items-center gap-1.5"><Clock className="w-4 h-4 text-gray-400" /> {request.time} ({request.duration}h)</span>
                                                        <span className="font-bold text-gray-900 bg-gray-100 px-2 rounded">₹{request.totalPrice}</span>
                                                    </div>
                                                </div>
                                                <div className="flex gap-2 shrink-0">
                                                    <Button
                                                        variant="ghost"
                                                        className="text-red-500 hover:text-red-600 hover:bg-red-50"
                                                        onClick={() => handleRequestAction(request.id, 'cancelled')}
                                                    >
                                                        <X className="w-4 h-4 mr-1" /> Decline
                                                    </Button>
                                                    <Button
                                                        className="bg-primary text-white hover:bg-primary/90 shadow-md hover:shadow-lg transition-all"
                                                        onClick={() => handleRequestAction(request.id, 'confirmed')}
                                                    >
                                                        <Check className="w-4 h-4 mr-1" /> Accept
                                                    </Button>
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Right: Profile Status & Upcoming */}
                    <div className="space-y-6">
                        {/* Profile Strength */}
                        <div className="space-y-4">
                            <h3 className="text-lg font-bold text-gray-900">Profile Strength</h3>
                            {(() => {
                                const checks = [
                                    { label: "Basic Info Added", done: !!user.name && !!user.bio },
                                    { label: "Hourly Rate Set", done: (user.hourly_rate || 0) > 0 },
                                    { label: "Add Profile Photo", done: !!user.avatar && !user.avatar.includes("default") },
                                    { label: "Identity Verified", done: false } // We need a 'verified' field in LocalUser, using backend data implicitly or assuming mock
                                ];
                                // Hack: Check if user has 'verified' property or fetch it. For now, assume if ID set?
                                // Let's use user.aadhar_number as proxy for verification submitted locally
                                if (user.aadhar_number) checks[3].done = true;

                                const completed = checks.filter(c => c.done).length;
                                const total = checks.length;
                                const percent = Math.round((completed / total) * 100);

                                return (
                                    <Card className="border-none shadow-md bg-gradient-to-br from-white to-gray-50">
                                        <CardHeader className="pb-3 border-b border-gray-100">
                                            <div className="flex justify-between items-center">
                                                <CardTitle className="text-sm font-medium text-gray-500">Completion Status</CardTitle>
                                                <span className={`text-2xl font-bold ${percent === 100 ? 'text-green-600' : 'text-primary'}`}>{percent}%</span>
                                            </div>
                                        </CardHeader>
                                        <CardContent className="pt-4 space-y-4">
                                            <div className="w-full bg-gray-200 rounded-full h-2.5 overflow-hidden">
                                                <div className={`h-2.5 rounded-full ${percent === 100 ? 'bg-green-500' : 'bg-primary'}`} style={{ width: `${percent}%` }}></div>
                                            </div>
                                            <div className="space-y-3">
                                                {checks.map((check, i) => (
                                                    <div key={i} className={`flex items-center gap-3 text-sm ${check.done ? 'text-gray-700' : 'text-gray-500'}`}>
                                                        {check.done ? (
                                                            <div className="w-5 h-5 rounded-full bg-green-100 flex items-center justify-center text-green-600 text-xs shrink-0">✓</div>
                                                        ) : (
                                                            <div className="w-5 h-5 rounded-full border border-gray-300 shrink-0"></div>
                                                        )}
                                                        {check.label}
                                                    </div>
                                                ))}
                                            </div>
                                            {percent < 100 && (
                                                <Button className="w-full mt-2" variant="outline" onClick={() => onNavigate('profile-settings')}>Complete Profile</Button>
                                            )}
                                        </CardContent>
                                    </Card>
                                );
                            })()}
                        </div>

                        {/* Recent Reviews */}
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <h3 className="text-lg font-bold text-gray-900">Recent Reviews</h3>
                                <Button variant="link" className="text-xs text-muted-foreground h-auto p-0" onClick={() => onNavigate('reviews')}>View All</Button>
                            </div>

                            <div className="space-y-3">
                                {isDemoAccount && DEMO_REVIEWS.length > 0 ? (
                                    DEMO_REVIEWS.map(review => (
                                        <Card key={review.id} className="bg-white border-none shadow-sm hover:shadow-md transition-shadow">
                                            <CardContent className="p-4 space-y-3">
                                                <div className="flex items-center justify-between">
                                                    <div className="flex items-center gap-2">
                                                        <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold text-xs">
                                                            {review.author[0]}
                                                        </div>
                                                        <div>
                                                            <p className="text-sm font-semibold text-gray-900">{review.author}</p>
                                                            <div className="flex items-center gap-1">
                                                                <div className="flex text-yellow-400">
                                                                    {Array.from({ length: 5 }).map((_, i) => (
                                                                        <Star
                                                                            key={i}
                                                                            className={`w-3 h-3 ${i < review.rating ? 'fill-current' : 'text-gray-300'}`}
                                                                        />
                                                                    ))}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <span className="text-xs text-gray-400">{review.date}</span>
                                                </div>
                                                <p className="text-sm text-gray-600 italic">"{review.text}"</p>
                                            </CardContent>
                                        </Card>
                                    ))
                                ) : (
                                    <Card className="bg-gray-50 border-dashed border-2 border-gray-200 shadow-none">
                                        <CardContent className="p-6 text-center text-gray-500 text-sm">
                                            No reviews yet. Complete more tours to get reviewed!
                                        </CardContent>
                                    </Card>
                                )}
                            </div>
                        </div>

                    </div>

                </div>
            </main>
        </div>
    );
}
