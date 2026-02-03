import { type Guide, type Review } from "@/types";
import { type LocalUser } from "@/lib/localStorage";
export interface SearchFilters {
    query?: string;
    city?: string;
    languages?: string[];
    specialties?: string[];
    minPrice?: number;
    maxPrice?: number;
    sortBy?: 'price_asc' | 'price_desc' | 'rating_desc' | 'reviews_desc';
}
export declare const api: {
    /**
     * Get security headers with JWT token
     */
    getHeaders: () => Record<string, string>;
    /**
     * Fetch all guides with optional filtering
     */
    fetchGuides: (filters?: SearchFilters) => Promise<Guide[]>;
    /**
     * Fetch metadata (cities, languages, specialties) with caching
     */
    fetchMetadata: () => Promise<any>;
    /**
     * Fetch a single guide by ID
     */
    getGuideById: (id: string) => Promise<Guide | null>;
    /**
     * Fetch a generic user by ID (for chat/profiles)
     */
    getUserById: (id: string) => Promise<LocalUser | null>;
    /**
     * Fetch reviews for a specific guide (Pending Backend Implementation)
     * For now, returning empty or mock
     */
    getReviewsForGuide: (guideId: string) => Promise<Review[]>;
    /**
     *  Get unique list of cities from API
     */
    getAvailableCities: () => Promise<string[]>;
    /**
     * Get unique list of languages
     */
    getAvailableLanguages: () => Promise<string[]>;
    /**
     * Get unique list of specialties
     */
    getAvailableSpecialties: () => Promise<string[]>;
    /**
     * Fetch dashboard stats for a guide (Simulated for now)
     */
    getGuideStats: (guideId: string) => Promise<{
        totalEarnings: any;
        completedTours: any;
        profileViews: number;
        rating: number;
    }>;
    /**
     * Fetch pending booking requests for a guide
     */
    getBookingRequests: (guideId: string) => Promise<any>;
    /**
     * Get bookings for a user (Tourist view)
     */
    getBookings: (userId: string) => Promise<any>;
    /**
     * Update booking status
     */
    updateBookingStatus: (bookingId: string, status: "confirmed" | "cancelled") => Promise<boolean>;
    /**
     * Create a booking
     */
    createBooking: (bookingData: any) => Promise<any>;
    /**
     * Submit a review (Pending Backend)
     */
    addReview: (review: Partial<Review>) => Promise<Review>;
    /**
     * Get availability (Simulated for now)
     */
    getAvailability: (guideId: string) => Promise<Record<string, "available" | "busy" | "off">>;
    /**
     * Update availability (Simulated)
     */
    updateAvailability: (guideId: string, date: string, status: "available" | "busy" | "off") => Promise<any>;
    /**
     * Update User Profile
     */
    updateUser: (id: string, updates: any) => Promise<any>;
    /**
     * Get Messages
     */
    getMessages: (userId: string, contactId: string) => Promise<any>;
    /**
     * Get unique list of conversations for a user
     */
    getConversations: (userId: string) => Promise<any[]>;
    /**
     * Mark messages from a contact as read
     */
    markMessagesAsRead: (userId: string, contactId: string) => Promise<void>;
    /**
     * Auth Methods
     */
    login: (credentials: any) => Promise<any>;
    register: (userData: any) => Promise<any>;
    /**
     * Favorites
     */
    getFavorites: (userId: string) => Promise<string[]>;
    addFavorite: (userId: string, guideId: string) => Promise<any>;
    removeFavorite: (userId: string, guideId: string) => Promise<any>;
    /**
     * Saved Itineraries
     */
    saveItinerary: (itinerary: {
        userId: string;
        city: string;
        title: string;
        content: any;
    }) => Promise<any>;
    getSavedItineraries: (userId: string) => Promise<any>;
    deleteItinerary: (id: string) => Promise<any>;
    getWeather: (city: string) => Promise<any>;
    adjustItinerary: (id: string) => Promise<any>;
    getCommunityPosts: (city?: string) => Promise<any>;
    /**
     * AI Trip Planner
     */
    planTrip: (data: {
        city: string;
        days: number;
        interests: string[];
    }) => Promise<any>;
};
