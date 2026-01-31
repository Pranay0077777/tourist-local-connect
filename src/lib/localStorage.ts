import { toast } from "sonner";
import { type Message } from "@/types";

// Type Definitions
export interface LocalUser {
    id: string;
    name: string;
    email: string;
    role: 'guide' | 'tourist';
    phone?: string;
    city?: string;
    bio?: string;
    languages?: string[];
    specialties?: string[];
    experience?: string;
    hourly_rate?: number;
    aadhar_number?: string;
    avatar?: string;
    joinDate: string;
    preferences?: {
        language?: string;
        currency?: string;
        theme?: 'light' | 'dark';
    };
    favorites?: string[]; // Guide IDs
    verificationStatus?: 'pending' | 'verified' | 'rejected';
    aadharId?: string;
    aadharImage?: string;
    token?: string;
}

export interface Booking {
    id: string;
    guideId: string;
    guideName: string;
    touristId: string;
    touristName: string;
    date: string;
    time: string;
    duration: number;
    totalPrice: number;
    status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
    location: string;
    tourType: string;
}


// Keys
const KEYS = {
    USERS: 'tlc_users',
    CURRENT_USER: 'tlc_current_user',
    BOOKINGS: 'user_bookings',
    MESSAGES: 'chat_messages'
} as const;

// User Management
export const saveUser = (user: LocalUser) => {
    try {
        const users = getUsers();
        // Check if email exists
        if (users.some(u => u.email === user.email)) {
            // Update existing
            const updated = users.map(u => u.email === user.email ? user : u);
            localStorage.setItem(KEYS.USERS, JSON.stringify(updated));
        } else {
            // Add new
            users.push(user);
            localStorage.setItem(KEYS.USERS, JSON.stringify(users));
        }
    } catch (error) {
        console.error("Error saving user:", error);
        toast.error("Failed to save user data");
    }
};

export const getUsers = (): LocalUser[] => {
    try {
        const data = localStorage.getItem(KEYS.USERS);
        return data ? JSON.parse(data) : [];
    } catch (error) {
        return [];
    }
};

export const setCurrentUser = (user: LocalUser | null) => {
    if (user) {
        localStorage.setItem(KEYS.CURRENT_USER, JSON.stringify(user));
    } else {
        localStorage.removeItem(KEYS.CURRENT_USER);
    }
    // Notify app of session change
    window.dispatchEvent(new Event('user-session-updated'));
};

export const getCurrentUser = (): LocalUser | null => {
    try {
        const data = localStorage.getItem(KEYS.CURRENT_USER);
        return data ? JSON.parse(data) : null;
    } catch (error) {
        return null;
    }
};

// Data Initializer (Optional)
export const initializeData = () => {
    if (!localStorage.getItem(KEYS.USERS)) {
        const initialUsers: LocalUser[] = [
            {
                id: 'guide_pending_1',
                name: 'Rahul Verma',
                email: 'rahul.guide@test.com',
                role: 'guide',
                city: 'Hyderabad',
                joinDate: new Date().toISOString(),
                verificationStatus: 'pending',
                aadharId: 'XXXX-XXXX-1234',
                aadharImage: 'https://placehold.co/600x400/png?text=Aadhar+Card+Preview',
                avatar: 'https://i.pravatar.cc/150?u=rahul'
            }
        ];
        localStorage.setItem(KEYS.USERS, JSON.stringify(initialUsers));
    }
    if (!localStorage.getItem('tlc_bookings')) {
        localStorage.setItem('tlc_bookings', JSON.stringify([]));
    }
    if (!localStorage.getItem('tlc_messages')) {
        localStorage.setItem('tlc_messages', JSON.stringify([]));
    }
};

// --- FAVORITES ---

export const toggleFavorite = (userId: string, guideId: string): string[] => {
    const users = getUsers();
    const userIndex = users.findIndex(u => u.id === userId);

    if (userIndex === -1) return [];

    const user = users[userIndex];
    let favorites = user.favorites || [];

    if (favorites.includes(guideId)) {
        favorites = favorites.filter(id => id !== guideId);
    } else {
        favorites.push(guideId);
    }

    // Update user object
    user.favorites = favorites;
    users[userIndex] = user;

    // Persist
    localStorage.setItem(KEYS.USERS, JSON.stringify(users));

    // Update current user if matches
    const currentUser = getCurrentUser();
    if (currentUser && currentUser.id === userId) {
        setCurrentUser(user);
    }

    return favorites;
};

// --- MESSAGES ---

export interface LocalMessage extends Message { }

export const getMessages = (userId: string, contactId: string): LocalMessage[] => {
    const messages = JSON.parse(localStorage.getItem('tlc_messages') || '[]');
    return messages.filter((m: LocalMessage) =>
        (m.senderId === userId && m.receiverId === contactId) ||
        (m.senderId === contactId && m.receiverId === userId)
    ).sort((a: LocalMessage, b: LocalMessage) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
};

export const sendMessage = (message: Omit<LocalMessage, 'id' | 'timestamp' | 'isRead'>): LocalMessage => {
    const messages = JSON.parse(localStorage.getItem('tlc_messages') || '[]');
    const newMessage: LocalMessage = {
        ...message,
        id: crypto.randomUUID(),
        timestamp: new Date().toISOString(),
        isRead: false
    };
    messages.push(newMessage);
    localStorage.setItem('tlc_messages', JSON.stringify(messages));
    return newMessage;
};

export const markMessagesAsRead = (userId: string, contactId: string): void => {
    const messages = JSON.parse(localStorage.getItem('tlc_messages') || '[]');
    const updatedMessages = messages.map((m: LocalMessage) => {
        if (m.senderId === contactId && m.receiverId === userId && !m.isRead) {
            return { ...m, isRead: true };
        }
        return m;
    });
    localStorage.setItem('tlc_messages', JSON.stringify(updatedMessages));
};

export const getUnreadCount = (userId: string): number => {
    const messages = JSON.parse(localStorage.getItem('tlc_messages') || '[]');
    return messages.filter((m: LocalMessage) => m.receiverId === userId && !m.isRead).length;
};

export const getConversations = (userId: string): string[] => {
    const messages = JSON.parse(localStorage.getItem('tlc_messages') || '[]');
    const contacts = new Set<string>();
    messages.forEach((m: LocalMessage) => {
        if (m.senderId === userId) contacts.add(m.receiverId);
        if (m.receiverId === userId) contacts.add(m.senderId);
    });
    return Array.from(contacts);
};

// Booking Management
export const createBooking = (booking: Booking): boolean => {
    try {
        const bookings = getAllBookings();
        bookings.push(booking);
        localStorage.setItem(KEYS.BOOKINGS, JSON.stringify(bookings));
        window.dispatchEvent(new Event('local-booking-updated'));
        return true;
    } catch (error) {
        console.error("Error creating booking:", error);
        return false;
    }
};

export const updateBookingStatus = (bookingId: string, status: Booking['status']): boolean => {
    try {
        const bookings = getAllBookings();
        const index = bookings.findIndex(b => b.id === bookingId);
        if (index !== -1) {
            bookings[index].status = status;
            localStorage.setItem(KEYS.BOOKINGS, JSON.stringify(bookings));
            window.dispatchEvent(new Event('local-booking-updated'));
            return true;
        }
        return false;
    } catch (error) {
        console.error("Error updating booking:", error);
        return false;
    }
};

export const getBookingsForUser = (userId: string): Booking[] => {
    const all = getAllBookings();
    return all.filter(b => b.touristId === userId);
};

export const getBookingsForGuide = (guideId: string): Booking[] => {
    const all = getAllBookings();
    return all.filter(b => b.guideId === guideId);
};

const getAllBookings = (): Booking[] => {
    try {
        const data = localStorage.getItem(KEYS.BOOKINGS);
        return data ? JSON.parse(data) : [];
    } catch (error) {
        return [];
    }
};

// --- ALERTS / NOTIFICATIONS ---

export interface Notification {
    id: string;
    userId: string;
    type: 'booking_request' | 'booking_confirmed' | 'booking_cancelled' | 'message' | 'system';
    title: string;
    message: string;
    timestamp: string;
    isRead: boolean;
    link?: string;
}

export const getNotifications = (userId: string): Notification[] => {
    try {
        const data = localStorage.getItem('tlc_notifications');
        const all: Notification[] = data ? JSON.parse(data) : [];
        return all.filter(n => n.userId === userId).sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    } catch (error) {
        return [];
    }
};

export const addNotification = (notif: Omit<Notification, 'id' | 'timestamp' | 'isRead'>) => {
    try {
        const data = localStorage.getItem('tlc_notifications');
        const all: Notification[] = data ? JSON.parse(data) : [];

        const newNotif: Notification = {
            ...notif,
            id: crypto.randomUUID(),
            timestamp: new Date().toISOString(),
            isRead: false
        };

        all.push(newNotif);
        localStorage.setItem('tlc_notifications', JSON.stringify(all));
        window.dispatchEvent(new Event('notifications-updated'));
        return newNotif;
    } catch (error) {
        console.error("Failed to add notification", error);
    }
};

export const markNotificationRead = (id: string) => {
    try {
        const data = localStorage.getItem('tlc_notifications');
        let all: Notification[] = data ? JSON.parse(data) : [];
        all = all.map(n => n.id === id ? { ...n, isRead: true } : n);
        localStorage.setItem('tlc_notifications', JSON.stringify(all));
        window.dispatchEvent(new Event('notifications-updated'));
    } catch (error) {
        console.error("Failed to mark read", error);
    }
};

export const markAllNotificationsRead = (userId: string) => {
    try {
        const data = localStorage.getItem('tlc_notifications');
        let all: Notification[] = data ? JSON.parse(data) : [];
        all = all.map(n => n.userId === userId ? { ...n, isRead: true } : n);
        localStorage.setItem('tlc_notifications', JSON.stringify(all));
        window.dispatchEvent(new Event('notifications-updated'));
    } catch (error) {
        console.error("Failed to mark all read", error);
    }
};
