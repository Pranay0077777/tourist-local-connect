import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect } from "react";
import {} from "@/lib/localStorage";
import { RoleAwareHeader } from "./RoleAwareHeader";
import { api } from "@/lib/api";
import { Button } from "./ui/button";
import { ChevronLeft, ChevronRight, CheckCircle2, XCircle, Slash, ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, } from "@/components/ui/card";
export function GuideAvailability({ user, onNavigate, onLogout }) {
    const [availability, setAvailability] = useState({});
    const [loading, setLoading] = useState(true);
    const [currentDate, setCurrentDate] = useState(new Date());
    useEffect(() => {
        const fetchAvailability = async () => {
            try {
                const data = await api.getAvailability(user.id);
                setAvailability(data);
            }
            catch (error) {
                toast.error("Failed to load availability");
            }
            finally {
                setLoading(false);
            }
        };
        fetchAvailability();
    }, [user.id]);
    const getDaysInMonth = (date) => {
        const year = date.getFullYear();
        const month = date.getMonth();
        const daysInMonth = new Date(year, month + 1, 0).getDate();
        const firstDayOfMonth = new Date(year, month, 1).getDay();
        return { daysInMonth, firstDayOfMonth };
    };
    const { daysInMonth, firstDayOfMonth } = getDaysInMonth(currentDate);
    const handleMonthChange = (offset) => {
        const newDate = new Date(currentDate);
        newDate.setMonth(newDate.getMonth() + offset);
        setCurrentDate(newDate);
    };
    const toggleStatus = async (day) => {
        const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
        const dateString = date.toISOString().split('T')[0];
        const currentStatus = availability[dateString] || 'available';
        const nextStatus = currentStatus === 'available' ? 'busy' :
            currentStatus === 'busy' ? 'off' : 'available';
        // Optimistic update
        setAvailability(prev => ({
            ...prev,
            [dateString]: nextStatus
        }));
        try {
            await api.updateAvailability(user.id, dateString, nextStatus);
        }
        catch (error) {
            toast.error("Failed to update status");
            // Revert on error
            setAvailability(prev => ({
                ...prev,
                [dateString]: currentStatus
            }));
        }
    };
    const handleMarkWeekendsOff = async () => {
        const updates = {};
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
    const StatusIcon = ({ status }) => {
        switch (status) {
            case 'available': return _jsx(CheckCircle2, { className: "w-4 h-4 text-green-500" });
            case 'busy': return _jsx(XCircle, { className: "w-4 h-4 text-red-500" });
            case 'off': return _jsx(Slash, { className: "w-4 h-4 text-gray-400" });
            default: return null;
        }
    };
    return (_jsxs("div", { className: "min-h-screen bg-gray-50", children: [_jsx(RoleAwareHeader, { user: user, currentPage: "calendar", onNavigate: onNavigate, onLogout: onLogout }), _jsxs("main", { className: "container mx-auto px-4 py-8 max-w-5xl", children: [_jsxs(Button, { variant: "ghost", size: "sm", onClick: () => onNavigate('home'), className: "mb-6 text-gray-600 hover:text-gray-900", children: [_jsx(ArrowLeft, { className: "w-4 h-4 mr-1" }), " Back to Dashboard"] }), _jsx("div", { className: "flex items-center justify-between mb-8", children: _jsxs("div", { children: [_jsx("h1", { className: "text-3xl font-bold text-gray-900", children: "Availability Calendar" }), _jsx("p", { className: "text-gray-500", children: "Manage your schedule and time off" })] }) }), loading ? (_jsx("div", { className: "flex justify-center p-12", children: _jsx("div", { className: "animate-spin rounded-full h-12 w-12 border-b-2 border-primary" }) })) : (_jsxs("div", { className: "grid lg:grid-cols-3 gap-8", children: [_jsxs(Card, { className: "lg:col-span-2 border-none shadow-md", children: [_jsxs(CardHeader, { className: "flex flex-row items-center justify-between pb-4", children: [_jsx(CardTitle, { className: "text-xl font-bold", children: currentDate.toLocaleString('default', { month: 'long', year: 'numeric' }) }), _jsxs("div", { className: "flex gap-2", children: [_jsx(Button, { variant: "outline", size: "icon", onClick: () => handleMonthChange(-1), children: _jsx(ChevronLeft, { className: "w-4 h-4" }) }), _jsx(Button, { variant: "outline", size: "icon", onClick: () => handleMonthChange(1), children: _jsx(ChevronRight, { className: "w-4 h-4" }) })] })] }), _jsxs(CardContent, { children: [_jsx("div", { className: "grid grid-cols-7 mb-2 text-center text-sm font-medium text-gray-400", children: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (_jsx("div", { className: "py-2", children: day }, day))) }), _jsxs("div", { className: "grid grid-cols-7 gap-2", children: [Array.from({ length: firstDayOfMonth }).map((_, i) => (_jsx("div", { className: "aspect-square bg-gray-50/50 rounded-lg" }, `empty-${i}`))), Array.from({ length: daysInMonth }).map((_, i) => {
                                                        const day = i + 1;
                                                        const dateDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
                                                        const dateString = dateDate.toISOString().split('T')[0];
                                                        const status = availability[dateString] || 'available';
                                                        const isToday = new Date().toDateString() === dateDate.toDateString();
                                                        return (_jsxs("button", { onClick: () => toggleStatus(day), className: `aspect-square rounded-xl border-2 flex flex-col items-center justify-center gap-1 transition-all relative group
                                                ${status === 'available' ? 'border-green-100 bg-green-50/30 hover:bg-green-50' :
                                                                status === 'busy' ? 'border-red-100 bg-red-50/30 hover:bg-red-50' :
                                                                    'border-gray-100 bg-gray-50 hover:bg-gray-100'}
                                                ${isToday ? 'ring-2 ring-primary ring-offset-2' : ''}
                                            `, children: [_jsx("span", { className: `text-lg font-bold ${status === 'off' ? 'text-gray-400' : 'text-gray-900'}`, children: day }), _jsx(StatusIcon, { status: status }), _jsx("div", { className: "absolute inset-0 bg-black/0 group-hover:bg-black/5 rounded-xl transition-colors" })] }, day));
                                                    })] })] })] }), _jsxs("div", { className: "space-y-6", children: [_jsxs(Card, { children: [_jsx(CardHeader, { children: _jsx(CardTitle, { className: "text-lg", children: "Legend" }) }), _jsxs(CardContent, { className: "space-y-4", children: [_jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { className: "flex items-center gap-2", children: [_jsx(CheckCircle2, { className: "w-5 h-5 text-green-500" }), _jsx("span", { className: "text-gray-700", children: "Available" })] }), _jsx("span", { className: "text-xs text-gray-500", children: "Open for bookings" })] }), _jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { className: "flex items-center gap-2", children: [_jsx(XCircle, { className: "w-5 h-5 text-red-500" }), _jsx("span", { className: "text-gray-700", children: "Busy / Booked" })] }), _jsx("span", { className: "text-xs text-gray-500", children: "Fully booked" })] }), _jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { className: "flex items-center gap-2", children: [_jsx(Slash, { className: "w-5 h-5 text-gray-400" }), _jsx("span", { className: "text-gray-700", children: "Time Off" })] }), _jsx("span", { className: "text-xs text-gray-500", children: "Not working" })] })] })] }), _jsxs(Card, { className: "bg-primary/5 border-primary/20", children: [_jsxs(CardHeader, { children: [_jsx(CardTitle, { className: "text-lg text-primary", children: "Quick Settings" }), _jsx(CardDescription, { children: "Bulk update your schedule" })] }), _jsxs(CardContent, { className: "space-y-2", children: [_jsx(Button, { onClick: handleMarkWeekendsOff, className: "w-full bg-white text-primary border border-primary/20 hover:bg-primary/10 mb-2", children: "Mark Sundays Off" }), _jsx(Button, { className: "w-full bg-white text-primary border border-primary/20 hover:bg-primary/10", children: "Sync with Google Calendar" })] })] })] })] }))] })] }));
}
