import { useState, useEffect } from "react";
import { Bell, Check } from "lucide-react";
import { type LocalUser, getNotifications, markNotificationRead, markAllNotificationsRead, type Notification } from "@/lib/localStorage";
import { Button } from "./ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";
import { cn } from "@/lib/utils";

interface NotificationsDropdownProps {
    user: LocalUser;
    onNavigate: (page: string) => void;
}

export function NotificationsDropdown({ user, onNavigate }: NotificationsDropdownProps) {
    const [notifications, setNotifications] = useState<Notification[]>([]);
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

    const handleMarkRead = (id: string, e: React.MouseEvent) => {
        e.stopPropagation();
        markNotificationRead(id);
    };

    const handleClick = (notif: Notification) => {
        if (!notif.isRead) markNotificationRead(notif.id);
        if (notif.link) {
            onNavigate(notif.link);
            setOpen(false);
        }
    };

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <Button variant="ghost" size="icon" className="relative text-gray-500 hover:text-gray-900">
                    <Bell className="w-5 h-5" />
                    {unreadCount > 0 && (
                        <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white"></span>
                    )}
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80 p-0" align="end">
                <div className="flex items-center justify-between p-4 border-b border-gray-100">
                    <h4 className="font-semibold text-sm">Notifications</h4>
                    {unreadCount > 0 && (
                        <button
                            onClick={() => markAllNotificationsRead(user.id)}
                            className="text-xs text-primary hover:underline"
                        >
                            Mark all read
                        </button>
                    )}
                </div>
                <div className="max-h-[300px] overflow-y-auto">
                    {notifications.length === 0 ? (
                        <div className="p-8 text-center text-gray-400 text-sm">
                            No notifications yet
                        </div>
                    ) : (
                        <div>
                            {notifications.map(notif => (
                                <div
                                    key={notif.id}
                                    onClick={() => handleClick(notif)}
                                    className={cn(
                                        "p-4 border-b border-gray-50 cursor-pointer hover:bg-gray-50 transition-colors flex gap-3",
                                        !notif.isRead ? "bg-primary/5" : ""
                                    )}
                                >
                                    <div className="mt-1 flex-shrink-0">
                                        <div className={cn(
                                            "w-2 h-2 rounded-full",
                                            !notif.isRead ? "bg-primary" : "bg-gray-200"
                                        )} />
                                    </div>
                                    <div className="flex-1 space-y-1">
                                        <p className="text-sm font-medium text-gray-900 leading-none">{notif.title}</p>
                                        <p className="text-xs text-gray-500 line-clamp-2">{notif.message}</p>
                                        <p className="text-[10px] text-gray-400 mt-1">
                                            {new Date(notif.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </p>
                                    </div>
                                    {!notif.isRead && (
                                        <button
                                            onClick={(e) => handleMarkRead(notif.id, e)}
                                            className="text-gray-400 hover:text-primary h-6 w-6 flex items-center justify-center rounded-full hover:bg-white"
                                            title="Mark as read"
                                        >
                                            <Check className="w-3 h-3" />
                                        </button>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </PopoverContent>
        </Popover>
    );
}
