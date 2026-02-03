import { type Message } from "@/types";
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
    favorites?: string[];
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
export declare const saveUser: (user: LocalUser) => void;
export declare const getUsers: () => LocalUser[];
export declare const setCurrentUser: (user: LocalUser | null) => void;
export declare const getCurrentUser: () => LocalUser | null;
export declare const initializeData: () => void;
export declare const toggleFavorite: (userId: string, guideId: string) => string[];
export interface LocalMessage extends Message {
}
export declare const getMessages: (userId: string, contactId: string) => LocalMessage[];
export declare const sendMessage: (message: Omit<LocalMessage, "id" | "timestamp" | "isRead">) => LocalMessage;
export declare const markMessagesAsRead: (userId: string, contactId: string) => void;
export declare const getUnreadCount: (userId: string) => number;
export declare const getConversations: (userId: string) => string[];
export declare const createBooking: (booking: Booking) => boolean;
export declare const updateBookingStatus: (bookingId: string, status: Booking["status"]) => boolean;
export declare const getBookingsForUser: (userId: string) => Booking[];
export declare const getBookingsForGuide: (guideId: string) => Booking[];
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
export declare const getNotifications: (userId: string) => Notification[];
export declare const addNotification: (notif: Omit<Notification, "id" | "timestamp" | "isRead">) => Notification | undefined;
export declare const markNotificationRead: (id: string) => void;
export declare const markAllNotificationsRead: (userId: string) => void;
