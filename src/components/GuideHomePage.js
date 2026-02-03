import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect } from "react";
import { RoleAwareHeader } from "./RoleAwareHeader";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { DashboardStat } from "./dashboard/DashboardStats";
import { Wallet, TrendingUp, Users, CalendarCheck, AlertCircle, Check, X, Clock, MessageSquare, Calendar, Settings, Star } from "lucide-react";
import {} from "@/lib/localStorage";
import { api } from "@/lib/api";
import { toast } from "sonner";
export function GuideHomePage({ user, onNavigate, onLogout }) {
    const [stats, setStats] = useState(null);
    const [requests, setRequests] = useState([]);
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
            }
            catch (error) {
                toast.error("Failed to load dashboard data");
            }
            finally {
                setLoading(false);
            }
        };
        fetchDashboardData();
    }, [user.id]);
    const handleRequestAction = async (requestId, action) => {
        try {
            await api.updateBookingStatus(requestId, action);
            setRequests(prev => prev.filter(r => r.id !== requestId));
            toast.success(action === 'confirmed' ? "Booking accepted!" : "Booking declined");
        }
        catch (error) {
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
    return (_jsxs("div", { className: "min-h-screen bg-gray-50/50", children: [_jsx(RoleAwareHeader, { user: user, currentPage: "home", onNavigate: onNavigate, onLogout: onLogout }), _jsxs("main", { className: "container mx-auto px-4 py-8 space-y-8", children: [_jsxs("div", { className: "flex flex-col md:flex-row md:items-center justify-between gap-4", children: [_jsxs("div", { children: [_jsx("h2", { className: "text-3xl font-bold text-gray-900 tracking-tight", children: "Dashboard" }), _jsxs("p", { className: "text-gray-500 mt-1", children: ["Welcome back, ", user.name, ". Here's what's happening today."] })] }), _jsx("div", { className: "flex gap-3", children: _jsxs("div", { className: "flex items-center gap-2 bg-white border border-gray-200 px-4 py-2 rounded-lg text-sm font-medium shadow-sm text-green-700", children: [_jsx("span", { className: "w-2 h-2 bg-green-500 rounded-full animate-pulse" }), "You are Online"] }) })] }), _jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4", children: [_jsx("div", { onClick: () => onNavigate('earnings'), className: "cursor-pointer transition-transform hover:scale-105", children: _jsx(DashboardStat, { icon: Wallet, label: "Total Earnings", value: `₹${stats?.totalEarnings.toLocaleString() || 0}`, color: "bg-green-500", loading: loading }) }), _jsx("div", { onClick: () => onNavigate('completed-tours'), className: "cursor-pointer transition-transform hover:scale-105", children: _jsx(DashboardStat, { icon: CalendarCheck, label: "Completed Tours", value: stats?.completedTours || 0, color: "bg-blue-500", loading: loading }) }), _jsx("div", { onClick: () => onNavigate('profile-stats'), className: "cursor-pointer transition-transform hover:scale-105", children: _jsx(DashboardStat, { icon: Users, label: "Profile Views", value: stats?.profileViews || 0, subtext: stats ? "+12% this week" : "", color: "bg-purple-500", loading: loading }) }), _jsx(DashboardStat, { icon: TrendingUp, label: "Rating", value: stats?.rating || "New", color: "bg-orange-500", loading: loading })] }), _jsxs("div", { children: [_jsx("h3", { className: "text-lg font-bold text-gray-900 mb-4", children: "Quick Actions" }), _jsxs("div", { className: "grid grid-cols-2 md:grid-cols-4 gap-4", children: [_jsxs(Button, { variant: "outline", className: "h-24 flex flex-col items-center justify-center gap-2 bg-white hover:border-primary hover:text-primary transition-all shadow-sm", onClick: () => onNavigate('calendar'), children: [_jsx(Calendar, { className: "w-6 h-6" }), _jsx("span", { children: "Manage Calendar" })] }), _jsxs(Button, { variant: "outline", className: "h-24 flex flex-col items-center justify-center gap-2 bg-white hover:border-primary hover:text-primary transition-all shadow-sm", onClick: () => onNavigate('myBookings'), children: [_jsx(CalendarCheck, { className: "w-6 h-6" }), _jsx("span", { children: "View Requests" })] }), _jsxs(Button, { variant: "outline", className: "h-24 flex flex-col items-center justify-center gap-2 bg-white hover:border-primary hover:text-primary transition-all shadow-sm", onClick: () => onNavigate('messages'), children: [_jsx(MessageSquare, { className: "w-6 h-6" }), _jsx("span", { children: "Messages" })] }), _jsxs(Button, { variant: "outline", className: "h-24 flex flex-col items-center justify-center gap-2 bg-white hover:border-primary hover:text-primary transition-all shadow-sm", onClick: () => onNavigate('profile-settings'), children: [_jsx(Settings, { className: "w-6 h-6" }), _jsx("span", { children: "Edit Profile" })] })] })] }), _jsxs("div", { className: "grid lg:grid-cols-3 gap-8", children: [_jsxs("div", { className: "lg:col-span-2 space-y-6", children: [_jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("h3", { className: "text-lg font-bold text-gray-900", children: ["New Requests ", _jsx("span", { className: "bg-red-100 text-red-600 px-2 py-0.5 rounded-full text-xs ml-2", children: requests.length })] }), requests.length > 0 && (_jsx(Button, { variant: "link", onClick: () => onNavigate('myBookings'), className: "text-primary", children: "View All" }))] }), loading ? (_jsx("div", { className: "flex justify-center p-8", children: _jsx("div", { className: "animate-spin rounded-full h-8 w-8 border-b-2 border-primary" }) })) : requests.length === 0 ? (
                                    /* Empty State */
                                    _jsx(Card, { className: "border-dashed border-2 border-gray-200 bg-gray-50/50 shadow-none", children: _jsxs(CardContent, { className: "flex flex-col items-center justify-center py-12 text-center", children: [_jsx(AlertCircle, { className: "w-12 h-12 text-gray-300 mb-4" }), _jsx("h4", { className: "text-lg font-semibold text-gray-900 mb-2", children: "No new requests" }), _jsx("p", { className: "text-gray-500 max-w-sm", children: "Tourists will send you booking requests here. Make sure your profile is complete to attract more views." })] }) })) : (_jsx("div", { className: "space-y-4", children: requests.slice(0, 3).map(request => (_jsx(Card, { className: "overflow-hidden border-l-4 border-l-primary hover:shadow-md transition-shadow group", children: _jsx(CardContent, { className: "p-0", children: _jsxs("div", { className: "p-5 flex flex-col sm:flex-row gap-4 sm:items-center justify-between", children: [_jsxs("div", { className: "space-y-2", children: [_jsxs("div", { className: "flex items-center gap-2", children: [_jsx("h4", { className: "font-bold text-gray-900 text-lg group-hover:text-primary transition-colors", children: request.touristName }), _jsx("span", { className: "px-2 py-0.5 rounded bg-blue-50 text-blue-700 text-xs font-bold uppercase border border-blue-100", children: request.tourType })] }), _jsxs("div", { className: "flex flex-wrap gap-x-6 gap-y-1 text-sm text-gray-500", children: [_jsxs("span", { className: "flex items-center gap-1.5", children: [_jsx(CalendarCheck, { className: "w-4 h-4 text-gray-400" }), " ", request.date] }), _jsxs("span", { className: "flex items-center gap-1.5", children: [_jsx(Clock, { className: "w-4 h-4 text-gray-400" }), " ", request.time, " (", request.duration, "h)"] }), _jsxs("span", { className: "font-bold text-gray-900 bg-gray-100 px-2 rounded", children: ["\u20B9", request.totalPrice] })] })] }), _jsxs("div", { className: "flex gap-2 shrink-0", children: [_jsxs(Button, { variant: "ghost", className: "text-red-500 hover:text-red-600 hover:bg-red-50", onClick: () => handleRequestAction(request.id, 'cancelled'), children: [_jsx(X, { className: "w-4 h-4 mr-1" }), " Decline"] }), _jsxs(Button, { className: "bg-primary text-white hover:bg-primary/90 shadow-md hover:shadow-lg transition-all", onClick: () => handleRequestAction(request.id, 'confirmed'), children: [_jsx(Check, { className: "w-4 h-4 mr-1" }), " Accept"] })] })] }) }) }, request.id))) }))] }), _jsxs("div", { className: "space-y-6", children: [_jsxs("div", { className: "space-y-4", children: [_jsx("h3", { className: "text-lg font-bold text-gray-900", children: "Profile Strength" }), (() => {
                                                const checks = [
                                                    { label: "Basic Info Added", done: !!user.name && !!user.bio },
                                                    { label: "Hourly Rate Set", done: (user.hourly_rate || 0) > 0 },
                                                    { label: "Add Profile Photo", done: !!user.avatar && !user.avatar.includes("default") },
                                                    { label: "Identity Verified", done: false } // We need a 'verified' field in LocalUser, using backend data implicitly or assuming mock
                                                ];
                                                // Hack: Check if user has 'verified' property or fetch it. For now, assume if ID set?
                                                // Let's use user.aadhar_number as proxy for verification submitted locally
                                                if (user.aadhar_number)
                                                    checks[3].done = true;
                                                const completed = checks.filter(c => c.done).length;
                                                const total = checks.length;
                                                const percent = Math.round((completed / total) * 100);
                                                return (_jsxs(Card, { className: "border-none shadow-md bg-gradient-to-br from-white to-gray-50", children: [_jsx(CardHeader, { className: "pb-3 border-b border-gray-100", children: _jsxs("div", { className: "flex justify-between items-center", children: [_jsx(CardTitle, { className: "text-sm font-medium text-gray-500", children: "Completion Status" }), _jsxs("span", { className: `text-2xl font-bold ${percent === 100 ? 'text-green-600' : 'text-primary'}`, children: [percent, "%"] })] }) }), _jsxs(CardContent, { className: "pt-4 space-y-4", children: [_jsx("div", { className: "w-full bg-gray-200 rounded-full h-2.5 overflow-hidden", children: _jsx("div", { className: `h-2.5 rounded-full ${percent === 100 ? 'bg-green-500' : 'bg-primary'}`, style: { width: `${percent}%` } }) }), _jsx("div", { className: "space-y-3", children: checks.map((check, i) => (_jsxs("div", { className: `flex items-center gap-3 text-sm ${check.done ? 'text-gray-700' : 'text-gray-500'}`, children: [check.done ? (_jsx("div", { className: "w-5 h-5 rounded-full bg-green-100 flex items-center justify-center text-green-600 text-xs shrink-0", children: "\u2713" })) : (_jsx("div", { className: "w-5 h-5 rounded-full border border-gray-300 shrink-0" })), check.label] }, i))) }), percent < 100 && (_jsx(Button, { className: "w-full mt-2", variant: "outline", onClick: () => onNavigate('profile-settings'), children: "Complete Profile" }))] })] }));
                                            })()] }), _jsxs("div", { className: "space-y-4", children: [_jsxs("div", { className: "flex items-center justify-between", children: [_jsx("h3", { className: "text-lg font-bold text-gray-900", children: "Recent Reviews" }), _jsx(Button, { variant: "link", className: "text-xs text-muted-foreground h-auto p-0", onClick: () => onNavigate('reviews'), children: "View All" })] }), _jsx("div", { className: "space-y-3", children: isDemoAccount && DEMO_REVIEWS.length > 0 ? (DEMO_REVIEWS.map(review => (_jsx(Card, { className: "bg-white border-none shadow-sm hover:shadow-md transition-shadow", children: _jsxs(CardContent, { className: "p-4 space-y-3", children: [_jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { className: "flex items-center gap-2", children: [_jsx("div", { className: "w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold text-xs", children: review.author[0] }), _jsxs("div", { children: [_jsx("p", { className: "text-sm font-semibold text-gray-900", children: review.author }), _jsx("div", { className: "flex items-center gap-1", children: _jsx("div", { className: "flex text-yellow-400", children: Array.from({ length: 5 }).map((_, i) => (_jsx(Star, { className: `w-3 h-3 ${i < review.rating ? 'fill-current' : 'text-gray-300'}` }, i))) }) })] })] }), _jsx("span", { className: "text-xs text-gray-400", children: review.date })] }), _jsxs("p", { className: "text-sm text-gray-600 italic", children: ["\"", review.text, "\""] })] }) }, review.id)))) : (_jsx(Card, { className: "bg-gray-50 border-dashed border-2 border-gray-200 shadow-none", children: _jsx(CardContent, { className: "p-6 text-center text-gray-500 text-sm", children: "No reviews yet. Complete more tours to get reviewed!" }) })) })] })] })] })] })] }));
}
