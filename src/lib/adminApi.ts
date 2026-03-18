import { getCurrentUser } from './localStorage';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

// Helper to get auth headers
const getHeaders = () => {
    const user = getCurrentUser();
    return {
        'Content-Type': 'application/json',
        'Authorization': user?.token ? `Bearer ${user.token}` : ''
    };
};

export interface AdminOverviewStats {
    totalGuides: number;
    pendingVerifications: number;
    totalTourists: number;
    monthlyRevenue: number;
    bookingsPerMonth: { month: string; bookings: number }[];
    recentApplications: AdminGuide[];
}

export interface AdminGuide {
    id: string;
    name: string;
    email: string;
    city: string;
    languages: string[];
    verificationStatus: 'pending' | 'verified' | 'rejected';
    joinDate: string;
    aadharImage?: string;
    aadharId?: string;
    dob?: string;
    address?: string;
    avatar?: string;
    isBlocked?: boolean;
}

export interface AdminTourist {
    id: string;
    name: string;
    email: string;
    joinDate: string;
    numberOfTrips: number;
    status: 'active' | 'inactive' | 'blocked';
    avatar?: string;
}

export interface AdminBookingDetailed {
    id: string;
    touristName: string;
    guideName: string;
    tourName: string;
    date: string;
    amount: number;
    paymentStatus: 'paid' | 'upcoming' | 'refunded';
}

export interface AdminBookingsOverview {
    totalBookings: number;
    totalRevenue: number;
    averageTourValue: number;
    recentTransactions: AdminBookingDetailed[];
}

export const adminApi = {
    getOverviewStats: async (): Promise<AdminOverviewStats> => {
        const res = await fetch(`${API_URL}/api/admin/overview`, { headers: getHeaders() });
        if (!res.ok) throw new Error("Failed to fetch overview stats");
        return res.json();
    },

    getGuides: async (): Promise<AdminGuide[]> => {
        const res = await fetch(`${API_URL}/api/admin/guides`, { headers: getHeaders() });
        if (!res.ok) throw new Error("Failed to fetch guides");
        return res.json();
    },

    verifyGuide: async (id: string, status: 'verified' | 'rejected'): Promise<void> => {
        const res = await fetch(`${API_URL}/api/admin/guides/${id}/verify`, {
            method: 'PATCH',
            headers: getHeaders(),
            body: JSON.stringify({ status })
        });
        if (!res.ok) throw new Error("Failed to verify guide");
    },

    getTourists: async (): Promise<AdminTourist[]> => {
        const res = await fetch(`${API_URL}/api/admin/tourists`, { headers: getHeaders() });
        if (!res.ok) throw new Error("Failed to fetch tourists");
        return res.json();
    },

    getBookings: async (): Promise<AdminBookingsOverview> => {
        const res = await fetch(`${API_URL}/api/admin/bookings`, { headers: getHeaders() });
        if (!res.ok) throw new Error("Failed to fetch bookings");
        return res.json();
    },

    messageGuide: async (id: string, subject: string, message: string): Promise<void> => {
        const res = await fetch(`${API_URL}/api/admin/guides/${id}/message`, {
            method: 'POST',
            headers: getHeaders(),
            body: JSON.stringify({ subject, message })
        });
        if (!res.ok) throw new Error("Failed to send message");
    },

    blockUser: async (id: string, blocked: boolean): Promise<void> => {
        const res = await fetch(`${API_URL}/api/admin/users/${id}/block`, {
            method: 'PATCH',
            headers: getHeaders(),
            body: JSON.stringify({ blocked })
        });
        if (!res.ok) throw new Error("Failed to block/unblock user");
    },

    removeUser: async (id: string): Promise<void> => {
        const res = await fetch(`${API_URL}/api/admin/users/${id}`, {
            method: 'DELETE',
            headers: getHeaders()
        });
        if (!res.ok) throw new Error("Failed to remove user");
    }
};
