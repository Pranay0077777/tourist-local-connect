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

const API_URL = import.meta.env.VITE_API_URL || '';

export const api = {
    /**
     * Get security headers with JWT token
     */
    getHeaders: () => {
        const currentUserStr = localStorage.getItem('tlc_current_user');
        const token = currentUserStr ? JSON.parse(currentUserStr).token : null;

        const headers: Record<string, string> = {
            'Content-Type': 'application/json'
        };

        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }

        return headers;
    },

    /**
     * Fetch all guides with optional filtering
     */
    fetchGuides: async (filters?: SearchFilters): Promise<Guide[]> => {
        const params = new URLSearchParams();
        if (filters) {
            if (filters.query) params.append('query', filters.query);
            if (filters.city) params.append('city', filters.city);
            if (filters.minPrice) params.append('minPrice', filters.minPrice.toString());
            if (filters.maxPrice) params.append('maxPrice', filters.maxPrice.toString());
            if (filters.sortBy) params.append('sort', filters.sortBy);

            if (filters.languages && filters.languages.length > 0) {
                filters.languages.forEach(lang => params.append('languages', lang));
            }

            if (filters.specialties && filters.specialties.length > 0) {
                filters.specialties.forEach((spec: string) => params.append('specialties', spec));
            }
        }

        const res = await fetch(`${API_URL}/api/guides?${params.toString()}`);
        if (!res.ok) throw new Error('Failed to fetch guides');
        return res.json();
    },

    /**
     * Fetch a single guide by ID
     */
    getGuideById: async (id: string): Promise<Guide | null> => {
        const res = await fetch(`${API_URL}/api/guides/${id}`);
        if (res.status === 404) return null;
        if (!res.ok) throw new Error('Failed to fetch guide');
        return res.json();
    },

    /**
     * Fetch a generic user by ID (for chat/profiles)
     */
    getUserById: async (id: string): Promise<LocalUser | null> => {
        const res = await fetch(`${API_URL}/api/users/${id}`);
        if (res.status === 404) return null;
        if (!res.ok) throw new Error('Failed to fetch user');
        return res.json();
    },

    /**
     * Fetch reviews for a specific guide (Pending Backend Implementation)
     * For now, returning empty or mock
     */
    getReviewsForGuide: async (guideId: string): Promise<Review[]> => {
        const res = await fetch(`${API_URL}/api/reviews?guideId=${guideId}`);
        if (!res.ok) {
            // If table doesn't exist yet or other error, return empty to avoid crash while dev
            console.error("Failed to fetch reviews");
            return [];
        }
        return res.json();
    },

    /**
     *  Get unique list of cities from API
     */
    getAvailableCities: async (): Promise<string[]> => {
        const guides = await api.fetchGuides();
        const cities = new Set(guides.map((g: any) => g.location.split(',')[0].trim()));
        return Array.from(cities).sort();
    },

    /**
     * Get unique list of languages
     */
    getAvailableLanguages: async (): Promise<string[]> => {
        const guides = await api.fetchGuides();
        const languages = new Set(guides.flatMap((g: any) => g.languages));
        return Array.from(languages).sort();
    },

    /**
     * Get unique list of specialties
     */
    getAvailableSpecialties: async (): Promise<string[]> => {
        const guides = await api.fetchGuides();
        const specialties = new Set(guides.flatMap((g: any) => g.specialties));
        return Array.from(specialties).sort();
    },

    /**
     * Fetch dashboard stats for a guide (Simulated for now)
     */
    getGuideStats: async (guideId: string) => {
        try {
            const guide = await api.getGuideById(guideId);
            const bookings = await api.getBookingRequests(guideId);

            const completedTours = bookings.filter((b: any) => b.status === 'completed').length;
            const totalEarnings = bookings
                .filter((b: any) => b.status === 'completed')
                .reduce((acc: number, b: any) => acc + (b.totalPrice || 0), 0);

            return {
                totalEarnings: totalEarnings,
                completedTours: completedTours,
                profileViews: guide?.reviewCount || 0, // Fallback to reviews for "popularity"
                rating: guide?.rating || 0
            };
        } catch (error) {
            console.error("Failed to fetch real stats", error);
            return {
                totalEarnings: 0,
                completedTours: 0,
                profileViews: 0,
                rating: 0
            };
        }
    },

    /**
     * Fetch pending booking requests for a guide
     */
    getBookingRequests: async (guideId: string) => {
        const res = await fetch(`${API_URL}/api/bookings?userId=${guideId}&role=guide`, {
            headers: api.getHeaders()
        });
        if (!res.ok) throw new Error('Failed to fetch bookings');
        // Format backend status to frontend expectations if needed
        const bookings = await res.json();
        return bookings.map((b: any) => ({
            id: b.id,
            touristName: b.userName || 'Unknown',
            date: b.date,
            time: b.time || "10:00 AM",
            duration: b.duration || 3,
            totalPrice: b.total_price || b.price,
            status: b.status,
            tourType: b.tour_type || b.tourType || 'Standard Tour'
        }));
    },

    /**
     * Get bookings for a user (Tourist view)
     */
    getBookings: async (userId: string) => {
        const res = await fetch(`${API_URL}/api/bookings?userId=${userId}&role=tourist`, {
            headers: api.getHeaders()
        });
        if (!res.ok) throw new Error('Failed to fetch bookings');
        const data = await res.json();
        return data.map((b: any) => ({
            ...b,
            totalPrice: b.total_price || b.price,
            guideName: b.guideName || 'Guide',
            tourType: b.tour_type || b.tourType || 'Custom Tour'
        }));
    },

    /**
     * Update booking status
     */
    updateBookingStatus: async (bookingId: string, status: 'confirmed' | 'cancelled') => {
        const res = await fetch(`${API_URL}/api/bookings/${bookingId}`, {
            method: 'PATCH',
            headers: api.getHeaders(),
            body: JSON.stringify({ status })
        });
        return res.ok;
    },

    /**
     * Create a booking
     */
    createBooking: async (bookingData: any) => {
        const res = await fetch(`${API_URL}/api/bookings`, {
            method: 'POST',
            headers: api.getHeaders(),
            body: JSON.stringify(bookingData)
        });
        return res.json();
    },

    /**
     * Submit a review (Pending Backend)
     */
    addReview: async (review: Partial<Review>): Promise<Review> => {
        const res = await fetch(`${API_URL}/api/reviews`, {
            method: 'POST',
            headers: api.getHeaders(),
            body: JSON.stringify(review)
        });
        if (!res.ok) throw new Error('Failed to post review');
        return res.json();
    },

    /**
     * Get availability (Simulated for now)
     */
    getAvailability: async (guideId: string): Promise<Record<string, 'available' | 'busy' | 'off'>> => {
        const res = await fetch(`${API_URL}/api/availability/${guideId}`, {
            headers: api.getHeaders()
        });
        if (!res.ok) {
            console.error("Failed to fetch availability");
            return {};
        }
        return res.json();
    },

    /**
     * Update availability (Simulated)
     */
    updateAvailability: async (guideId: string, date: string, status: 'available' | 'busy' | 'off') => {
        const res = await fetch(`${API_URL}/api/availability/${guideId}`, {
            method: 'POST',
            headers: api.getHeaders(),
            body: JSON.stringify({ date, status })
        });
        if (!res.ok) throw new Error('Failed to update availability');
        return res.json();
    },

    /**
     * Update User Profile
     */
    updateUser: async (id: string, updates: any) => {
        const res = await fetch(`${API_URL}/api/users/${id}`, {
            method: 'PATCH',
            headers: api.getHeaders(),
            body: JSON.stringify(updates)
        });
        if (!res.ok) throw new Error('Failed to update user');
        return res.json();
    },

    /**
     * Get Messages
     */
    getMessages: async (userId: string, contactId: string) => {
        const res = await fetch(`${API_URL}/api/messages?userId=${userId}&contactId=${contactId}`, {
            headers: api.getHeaders()
        });
        if (!res.ok) throw new Error('Failed to fetch messages');
        return res.json();
    },

    /**
     * Get unique list of conversations for a user
     */
    getConversations: async (userId: string): Promise<any[]> => {
        const res = await fetch(`${API_URL}/api/messages/conversations/${userId}`, {
            headers: api.getHeaders()
        });
        if (!res.ok) throw new Error('Failed to fetch conversations');
        return res.json();
    },

    /**
     * Mark messages from a contact as read
     */
    markMessagesAsRead: async (userId: string, contactId: string): Promise<void> => {
        await fetch(`${API_URL}/api/messages/read`, {
            method: 'PATCH',
            headers: api.getHeaders(), // Added auth header just in case
            body: JSON.stringify({ userId, contactId })
        });
    },

    /**
     * Auth Methods
     */
    login: async (credentials: any) => {
        const res = await fetch(`${API_URL}/api/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(credentials)
        });
        if (!res.ok) {
            const error = await res.json();
            throw new Error(error.error || 'Login failed');
        }
        return res.json();
    },

    register: async (userData: any) => {
        const res = await fetch(`${API_URL}/api/auth/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(userData)
        });
        if (!res.ok) {
            const error = await res.json();
            throw new Error(error.error || 'Registration failed');
        }
        return res.json();
    },

    /**
     * Favorites
     */
    getFavorites: async (userId: string): Promise<string[]> => {
        const res = await fetch(`${API_URL}/api/favorites/${userId}`, {
            headers: api.getHeaders()
        });
        if (!res.ok) throw new Error('Failed to fetch favorites');
        return res.json();
    },

    addFavorite: async (userId: string, guideId: string) => {
        const res = await fetch(`${API_URL}/api/favorites`, {
            method: 'POST',
            headers: api.getHeaders(),
            body: JSON.stringify({ userId, guideId })
        });
        if (!res.ok) throw new Error('Failed to add favorite');
        return res.json();
    },

    removeFavorite: async (userId: string, guideId: string) => {
        const res = await fetch(`${API_URL}/api/favorites/${userId}/${guideId}`, {
            method: 'DELETE',
            headers: api.getHeaders()
        });
        if (!res.ok) throw new Error('Failed to remove favorite');
        return res.json();
    },

    /**
     * Saved Itineraries
     */
    saveItinerary: async (itinerary: { userId: string, city: string, title: string, content: any }) => {
        const res = await fetch(`${API_URL}/api/itineraries`, {
            method: 'POST',
            headers: api.getHeaders(),
            body: JSON.stringify(itinerary)
        });
        if (!res.ok) throw new Error('Failed to save itinerary');
        return res.json();
    },

    getSavedItineraries: async (userId: string) => {
        const res = await fetch(`${API_URL}/api/itineraries/user/${userId}`, { headers: api.getHeaders() });
        if (!res.ok) throw new Error('Failed to fetch itineraries');
        return res.json();
    },

    deleteItinerary: async (id: string) => {
        const res = await fetch(`${API_URL}/api/itineraries/${id}`, {
            method: 'DELETE', headers: api.getHeaders()
        });
        if (!res.ok) throw new Error('Failed to delete itinerary');
        return res.json();
    },

    getWeather: async (city: string) => {
        const res = await fetch(`${API_URL}/api/weather/${city}`);
        if (!res.ok) throw new Error('Failed to fetch weather');
        return res.json();
    },

    adjustItinerary: async (id: string) => {
        const res = await fetch(`${API_URL}/api/itineraries/${id}/adjust`, {
            method: 'PATCH', headers: api.getHeaders()
        });
        if (!res.ok) throw new Error('Failed to adjust itinerary');
        return res.json();
    },

    getCommunityPosts: async (city?: string) => {
        const url = city ? `${API_URL}/api/community/posts?city=${city}` : `${API_URL}/api/community/posts`;
        const res = await fetch(url);
        if (!res.ok) throw new Error('Failed to fetch community posts');
        return res.json();
    }
};
