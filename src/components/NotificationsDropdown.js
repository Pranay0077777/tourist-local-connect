import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect } from "react";
import { Bell, Check } from "lucide-react";
import { getNotifications, markNotificationRead, markAllNotificationsRead } from "@/lib/localStorage";
import { Button } from "./ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";
import { cn } from "@/lib/utils";
export function NotificationsDropdown({ user, onNavigate }) {
    const [notifications, setNotifications] = useState([]);
    const [open, setOpen] = useState(false);
    const loadNotifications = () => {
        const data = getNotifications(user.id);
        setNotifications(data);
    };
    useEffect(() => {
        loadNotifications();
        // Listen for updates
        window.addEventListener('notifications-updated', loadNotifications);
        // Also listen for booking updates to potentially re-fetch if we add logic there to auto-notify
        window.addEventListener('local-booking-updated', loadNotifications);
        return () => {
            window.removeEventListener('notifications-updated', loadNotifications);
            window.removeEventListener('local-booking-updated', loadNotifications);
        };
    }, [user.id]);
    const unreadCount = notifications.filter(n => !n.isRead).length;
    const handleMarkRead = (id, e) => {
        e.stopPropagation();
        markNotificationRead(id);
    };
    const handleClick = (notif) => {
        if (!notif.isRead)
            markNotificationRead(notif.id);
        if (notif.link) {
            onNavigate(notif.link);
            setOpen(false);
        }
    };
    return (_jsxs(Popover, { open: open, onOpenChange: setOpen, children: [_jsx(PopoverTrigger, { asChild: true, children: _jsxs(Button, { variant: "ghost", size: "icon", className: "relative text-gray-500 hover:text-gray-900", children: [_jsx(Bell, { className: "w-5 h-5" }), unreadCount > 0 && (_jsx("span", { className: "absolute top-1 right-1 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white" }))] }) }), _jsxs(PopoverContent, { className: "w-80 p-0", align: "end", children: [_jsxs("div", { className: "flex items-center justify-between p-4 border-b border-gray-100", children: [_jsx("h4", { className: "font-semibold text-sm", children: "Notifications" }), unreadCount > 0 && (_jsx("button", { onClick: () => markAllNotificationsRead(user.id), className: "text-xs text-primary hover:underline", children: "Mark all read" }))] }), _jsx("div", { className: "max-h-[300px] overflow-y-auto", children: notifications.length === 0 ? (_jsx("div", { className: "p-8 text-center text-gray-400 text-sm", children: "No notifications yet" })) : (_jsx("div", { children: notifications.map(notif => (_jsxs("div", { onClick: () => handleClick(notif), className: cn("p-4 border-b border-gray-50 cursor-pointer hover:bg-gray-50 transition-colors flex gap-3", !notif.isRead ? "bg-primary/5" : ""), children: [_jsx("div", { className: "mt-1 flex-shrink-0", children: _jsx("div", { className: cn("w-2 h-2 rounded-full", !notif.isRead ? "bg-primary" : "bg-gray-200") }) }), _jsxs("div", { className: "flex-1 space-y-1", children: [_jsx("p", { className: "text-sm font-medium text-gray-900 leading-none", children: notif.title }), _jsx("p", { className: "text-xs text-gray-500 line-clamp-2", children: notif.message }), _jsx("p", { className: "text-[10px] text-gray-400 mt-1", children: new Date(notif.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) })] }), !notif.isRead && (_jsx("button", { onClick: (e) => handleMarkRead(notif.id, e), className: "text-gray-400 hover:text-primary h-6 w-6 flex items-center justify-center rounded-full hover:bg-white", title: "Mark as read", children: _jsx(Check, { className: "w-3 h-3" }) }))] }, notif.id))) })) })] })] }));
}
