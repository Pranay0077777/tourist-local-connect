export interface Guide {
    id: string;
    name: string;
    avatar: string;
    location: string;
    languages: string[];
    rating: number;
    reviewCount: number;
    hourlyRate: number;
    specialties: string[];
    bio: string;
    verified: boolean;
    responseTime: string;
    experience?: string;
    completedTours: number;
    joinedDate: string;
    availability: string[];
    itinerary?: {
        time: string;
        activity: string;
        icon: string;
    }[];
    hiddenGems?: {
        name: string;
        image: string;
        description: string;
    }[];
}
export interface Review {
    id: string;
    guideId: string;
    userName: string;
    userAvatar: string;
    rating: number;
    comment: string;
    date: string;
    tourType: string;
}
export interface Message {
    id: string;
    senderId: string;
    receiverId: string;
    text: string;
    timestamp: string;
    isRead: boolean;
    translatedText?: string;
}
