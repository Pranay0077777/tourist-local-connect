import { useState, useEffect } from "react";
import { Button } from "./ui/button";
import {
    MapPin,
    User,
    LogOut,
    MessageSquare,
    Calendar,
    Compass,
    Heart,
    ShieldHalf,
    FolderHeart,
    Sun,
    Moon,
    Laptop,
    Users
} from "lucide-react";

import { type LocalUser, getUnreadCount } from "@/lib/localStorage";
import { NotificationsDropdown } from "./NotificationsDropdown";
import { useTheme } from "./theme-provider";
import { isAdmin } from "@/lib/adminUtils";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";

interface RoleAwareHeaderProps {
    user: LocalUser;
    currentPage: string;
    onNavigate: (page: string) => void;
    onLogout: () => void;
}

export function RoleAwareHeader({ user, currentPage, onNavigate, onLogout }: RoleAwareHeaderProps) {
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

    const NavItem = ({ page, icon: Icon, label, badge }: { page: string; icon: any; label: string; badge?: number }) => (
        <button
            onClick={() => onNavigate(page)}
            className={`flex items-center gap-2 px-4 py-2 rounded-full transition-all duration-300 relative text-sm font-medium
                ${currentPage === page
                    ? activeClass
                    : `text-muted-foreground ${hoverBg}`
                }`}
        >
            <div className="relative">
                <Icon className="w-4 h-4" />
                {badge && badge > 0 ? (
                    <span className="absolute -top-2 -right-2 bg-accent text-white text-[10px] font-bold px-1.5 h-4 min-w-[16px] flex items-center justify-center rounded-full border-2 border-white">
                        {badge}
                    </span>
                ) : null}
            </div>
            <span className="hidden xl:inline">{label}</span>
        </button>
    );

    console.log("Header Render - User Avatar:", user.avatar);

    return (
        <header className="sticky top-0 z-50 w-full bg-background/80 backdrop-blur-md border-b border-border/40 shadow-sm support-backdrop-blur">
            <div className="w-full px-6 h-16 flex items-center justify-between">
                {/* Logo */}
                <div
                    className="flex items-center gap-2 cursor-pointer group"
                    onClick={() => onNavigate('home')}
                >
                    <div className={`p-2 rounded-xl bg-blue-50 group-hover:bg-blue-100 transition-colors`}>
                        {isGuide ? (
                            <Compass className={`w-6 h-6 text-blue-600`} />
                        ) : (
                            <MapPin className={`w-6 h-6 text-blue-600`} />
                        )}
                    </div>
                    <div className="flex flex-col">
                        <h1 className="text-xl font-bold text-foreground leading-none font-heading tracking-tight">
                            Tourist Local
                        </h1>
                        <span className={`text-[10px] font-bold text-gray-500 uppercase tracking-widest hidden sm:block`}>
                            {user.role} Dashboard
                        </span>
                    </div>
                </div>

                {/* Desktop Navigation */}
                <nav className="hidden md:flex flex-1 justify-center items-center gap-1 bg-secondary/50 p-1.5 rounded-full border border-border/50 mx-4">
                    <NavItem page="home" icon={isGuide ? Compass : MapPin} label="Home" />

                    {isGuide ? (
                        <>
                            <NavItem page="myBookings" icon={Calendar} label="Requests" />
                            <NavItem page="calendar" icon={Calendar} label="Calendar" />
                        </>
                    ) : (
                        <>
                            <NavItem page="browseGuides" icon={Compass} label="Find Guides" />
                            <NavItem page="myBookings" icon={Calendar} label="My Bookings" />
                            <NavItem page="saved-trips" icon={FolderHeart} label="Saved Plans" />
                            <NavItem page="saved" icon={Heart} label="Saved" />
                        </>
                    )}

                    <NavItem page="community" icon={Users} label="Community" />

                    <NavItem page="messages" icon={MessageSquare} label="Messages" badge={unreadCount} />

                    <NotificationsDropdown user={user} onNavigate={onNavigate} />

                    {isAdmin(user.email) && (
                        <NavItem page="admin" icon={ShieldHalf} label="Admin" />
                    )}
                </nav>

                {/* User Actions */}
                <div className="flex items-center gap-3">
                    <button
                        onClick={() => onNavigate('profile-settings')}
                        className="hidden md:flex items-center gap-3 pl-4 border-l border-border/50 hover:bg-muted/50 rounded-lg p-2 transition-colors cursor-pointer max-w-[200px]"
                        title="Edit Profile"
                    >
                        <div className="text-right flex flex-col items-end overflow-hidden">
                            <p className="text-sm font-semibold text-foreground truncate w-full">{user.name}</p>
                            <p className="text-xs text-muted-foreground capitalize truncate w-full">{user.city || 'South India'}</p>
                        </div>
                        <div className={`h-10 w-10 rounded-full flex-shrink-0 flex items-center justify-center border-2 border-primary/20 bg-primary/5 relative`}>
                            {user.avatar ? (
                                <img
                                    src={`${user.avatar.startsWith('http') ? user.avatar : `http://localhost:3001${user.avatar}`}?t=${Date.now()}`}
                                    alt={user.name}
                                    className="h-full w-full rounded-full object-cover"
                                    onError={(e) => {
                                        console.error("Failed to load avatar:", user.avatar);
                                        e.currentTarget.src = "https://github.com/shadcn.png"; // Fallback
                                    }}
                                />
                            ) : (
                                <User className={`w-5 h-5 text-primary`} />
                            )}
                        </div>
                    </button>

                    <Button
                        variant="ghost"
                        onClick={onLogout}
                        className="text-red-600 hover:text-red-700 hover:bg-red-50 gap-2 px-3 order-first md:order-none"
                        title="Logout"
                    >
                        <LogOut className="w-5 h-5" />
                        <span className="hidden lg:inline font-medium">Logout</span>
                    </Button>

                    <ThemeToggle />
                </div>
            </div>
        </header>
    );
}

function ThemeToggle() {
    const { setTheme } = useTheme()

    return (
        <Popover>
            <PopoverTrigger asChild>
                <Button variant="ghost" size="icon" className="text-gray-500 hover:text-primary w-9 h-9 rounded-full">
                    <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
                    <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
                    <span className="sr-only">Toggle theme</span>
                </Button>
            </PopoverTrigger>
            <PopoverContent align="end" className="w-36">
                <div className="grid gap-1">
                    <Button variant="ghost" className="justify-start gap-2" onClick={() => setTheme("light")}>
                        <Sun className="h-4 w-4" /> Light
                    </Button>
                    <Button variant="ghost" className="justify-start gap-2" onClick={() => setTheme("dark")}>
                        <Moon className="h-4 w-4" /> Dark
                    </Button>
                    <Button variant="ghost" className="justify-start gap-2" onClick={() => setTheme("system")}>
                        <Laptop className="h-4 w-4" /> System
                    </Button>
                </div>
            </PopoverContent>
        </Popover>
    )
}
