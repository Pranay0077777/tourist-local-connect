import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useState, useEffect } from "react";
import { Button } from "./ui/button";
import { MapPin, User, LogOut, MessageSquare, Calendar, Compass, Heart, ShieldHalf, FolderHeart, Sun, Moon, Laptop, Users } from "lucide-react";
import { getUnreadCount } from "@/lib/localStorage";
import { NotificationsDropdown } from "./NotificationsDropdown";
import { useTheme } from "./theme-provider";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";
export function RoleAwareHeader({ user, currentPage, onNavigate, onLogout }) {
    const isGuide = user.role === 'guide';
    // Using theme colors: Primary (Sage) for everyone to keep it consistent and premium, 
    // or we could use 'accent' for one role. Let's stick to the unified premium theme.
    // To distinguish, we might subtle change badge colors or just rely on content.
    // For now, let's use the new semantic tokens.
    // Actually, keeping the distinction is good, but let's map them to the new palette.
    // Guide = Sage (Primary), Tourist = Brown (Accent) or sticking to Primary for cleaner look?
    // Let's make the entire app consistent with the "Sage" brand.
    const hoverBg = "hover:bg-primary/5 hover:text-primary";
    const activeClass = "bg-primary text-primary-foreground shadow-md";
    const [unreadCount, setUnreadCount] = useState(0);
    useEffect(() => {
        const checkUnread = () => {
            const count = getUnreadCount(user.id);
            setUnreadCount(count);
        };
        checkUnread();
        // Poll for updates (in case messages come in background or from other tab simulation)
        const interval = setInterval(checkUnread, 2000);
        return () => clearInterval(interval);
    }, [user.id]);
    const NavItem = ({ page, icon: Icon, label, badge }) => (_jsxs("button", { onClick: () => onNavigate(page), className: `flex items-center gap-2 px-4 py-2 rounded-full transition-all duration-300 relative text-sm font-medium
                ${currentPage === page
            ? activeClass
            : `text-muted-foreground ${hoverBg}`}`, children: [_jsxs("div", { className: "relative", children: [_jsx(Icon, { className: "w-4 h-4" }), badge && badge > 0 ? (_jsx("span", { className: "absolute -top-2 -right-2 bg-accent text-white text-[10px] font-bold px-1.5 h-4 min-w-[16px] flex items-center justify-center rounded-full border-2 border-white", children: badge })) : null] }), _jsx("span", { className: "hidden xl:inline", children: label })] }));
    console.log("Header Render - User Avatar:", user.avatar);
    return (_jsx("header", { className: "sticky top-0 z-50 w-full bg-background/80 backdrop-blur-md border-b border-border/40 shadow-sm support-backdrop-blur", children: _jsxs("div", { className: "w-full px-6 h-16 flex items-center justify-between", children: [_jsxs("div", { className: "flex items-center gap-2 cursor-pointer group", onClick: () => onNavigate('home'), children: [_jsx("div", { className: `p-2 rounded-xl bg-blue-50 group-hover:bg-blue-100 transition-colors`, children: isGuide ? (_jsx(Compass, { className: `w-6 h-6 text-blue-600` })) : (_jsx(MapPin, { className: `w-6 h-6 text-blue-600` })) }), _jsxs("div", { className: "flex flex-col", children: [_jsx("h1", { className: "text-xl font-bold text-foreground leading-none font-heading tracking-tight", children: "Tourist Local" }), _jsxs("span", { className: `text-[10px] font-bold text-gray-500 uppercase tracking-widest hidden sm:block`, children: [user.role, " Dashboard"] })] })] }), _jsxs("nav", { className: "hidden md:flex flex-1 justify-center items-center gap-1 bg-secondary/50 p-1.5 rounded-full border border-border/50 mx-4", children: [_jsx(NavItem, { page: "home", icon: isGuide ? Compass : MapPin, label: "Home" }), isGuide ? (_jsxs(_Fragment, { children: [_jsx(NavItem, { page: "myBookings", icon: Calendar, label: "Requests" }), _jsx(NavItem, { page: "calendar", icon: Calendar, label: "Calendar" })] })) : (_jsxs(_Fragment, { children: [_jsx(NavItem, { page: "browseGuides", icon: Compass, label: "Find Guides" }), _jsx(NavItem, { page: "myBookings", icon: Calendar, label: "My Bookings" }), _jsx(NavItem, { page: "saved-trips", icon: FolderHeart, label: "Saved Plans" }), _jsx(NavItem, { page: "saved", icon: Heart, label: "Saved" })] })), _jsx(NavItem, { page: "community", icon: Users, label: "Community" }), _jsx(NavItem, { page: "messages", icon: MessageSquare, label: "Messages", badge: unreadCount }), _jsx(NotificationsDropdown, { user: user, onNavigate: onNavigate }), user.email === 'tourist@test.com' && (_jsx(NavItem, { page: "admin", icon: ShieldHalf, label: "Admin" }))] }), _jsxs("div", { className: "flex items-center gap-3", children: [_jsxs("button", { onClick: () => onNavigate('profile-settings'), className: "hidden md:flex items-center gap-3 pl-4 border-l border-border/50 hover:bg-muted/50 rounded-lg p-2 transition-colors cursor-pointer max-w-[200px]", title: "Edit Profile", children: [_jsxs("div", { className: "text-right flex flex-col items-end overflow-hidden", children: [_jsx("p", { className: "text-sm font-semibold text-foreground truncate w-full", children: user.name }), _jsx("p", { className: "text-xs text-muted-foreground capitalize truncate w-full", children: user.city || 'South India' })] }), _jsx("div", { className: `h-10 w-10 rounded-full flex-shrink-0 flex items-center justify-center border-2 border-primary/20 bg-primary/5 relative`, children: user.avatar ? (_jsx("img", { src: `${user.avatar.startsWith('http') ? user.avatar : `http://localhost:3001${user.avatar}`}?t=${Date.now()}`, alt: user.name, className: "h-full w-full rounded-full object-cover", onError: (e) => {
                                            console.error("Failed to load avatar:", user.avatar);
                                            e.currentTarget.src = "https://github.com/shadcn.png"; // Fallback
                                        } })) : (_jsx(User, { className: `w-5 h-5 text-primary` })) })] }), _jsxs(Button, { variant: "ghost", onClick: onLogout, className: "text-red-600 hover:text-red-700 hover:bg-red-50 gap-2 px-3 order-first md:order-none", title: "Logout", children: [_jsx(LogOut, { className: "w-5 h-5" }), _jsx("span", { className: "hidden lg:inline font-medium", children: "Logout" })] }), _jsx(ThemeToggle, {})] })] }) }));
}
function ThemeToggle() {
    const { setTheme } = useTheme();
    return (_jsxs(Popover, { children: [_jsx(PopoverTrigger, { asChild: true, children: _jsxs(Button, { variant: "ghost", size: "icon", className: "text-gray-500 hover:text-primary w-9 h-9 rounded-full", children: [_jsx(Sun, { className: "h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" }), _jsx(Moon, { className: "absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" }), _jsx("span", { className: "sr-only", children: "Toggle theme" })] }) }), _jsx(PopoverContent, { align: "end", className: "w-36", children: _jsxs("div", { className: "grid gap-1", children: [_jsxs(Button, { variant: "ghost", className: "justify-start gap-2", onClick: () => setTheme("light"), children: [_jsx(Sun, { className: "h-4 w-4" }), " Light"] }), _jsxs(Button, { variant: "ghost", className: "justify-start gap-2", onClick: () => setTheme("dark"), children: [_jsx(Moon, { className: "h-4 w-4" }), " Dark"] }), _jsxs(Button, { variant: "ghost", className: "justify-start gap-2", onClick: () => setTheme("system"), children: [_jsx(Laptop, { className: "h-4 w-4" }), " System"] })] }) })] }));
}
