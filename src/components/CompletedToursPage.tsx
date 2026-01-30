import { type LocalUser } from "@/lib/localStorage";
import { RoleAwareHeader } from "./RoleAwareHeader";
import { Button } from "./ui/button";
import { Card, CardContent } from "./ui/card";
import { ArrowLeft, MapPin, Calendar, Clock, User, Star } from "lucide-react";

interface CompletedToursPageProps {
    user: LocalUser;
    onNavigate: (page: string) => void;
    onLogout: () => void;
}

export function CompletedToursPage({ user, onNavigate, onLogout }: CompletedToursPageProps) {
    // Professional Mock Data - Detailed Entries with Distance & Places
    const COMPLETED_TOURS = [
        {
            id: 1,
            tourName: "Heritage Temple Architecture Walk",
            touristName: "Sarah Jenkins & Family",
            date: "Jan 15, 2024",
            duration: "4 hours",
            price: 2400,
            location: "Mylapore, Chennai",
            distance: "3.5 km",
            placesCount: 4,
            rating: 5,
            description: "A comprehensive guided walking tour covering the Kapaleeshwarar Temple and surrounding heritage sites. The group was deeply interested in Dravidian architecture and mythological stories. We concluded with a traditional South Indian breakfast at a local heritage home.",
            feedback: "Absolutely amazing experience! The guide was so knowledgeable about the local history and hidden gems.",
            tags: ["Heritage", "Culture", "Walking"]
        },
        {
            id: 2,
            tourName: "Sunrise Beach Yoga & Meditation",
            touristName: "Mike Chen",
            date: "Jan 12, 2024",
            duration: "2 hours",
            price: 1200,
            location: "Marina Beach, Chennai",
            distance: "1.2 km",
            placesCount: 1,
            rating: 5,
            description: "Early morning wellness session at Marina Beach. Started with basic breathing exercises (Pranayama) followed by a guided meditation session as the sun rose. The session focused on stress relief and mindfulness, followed by a casual discussion on local wellness traditions.",
            feedback: "Great session! The timing was perfect and the meditation was very relaxing. Highly recommended.",
            tags: ["Wellness", "Morning", "Yoga"]
        },
        {
            id: 3,
            tourName: "Authentic Street Food Crawler",
            touristName: "Priya Sharma groups",
            date: "Jan 08, 2024",
            duration: "3 hours",
            price: 1800,
            location: "George Town, Chennai",
            distance: "2.8 km",
            placesCount: 6,
            rating: 4,
            description: "An energetic food tasting tour through the bustling streets of George Town. We visited 6 famous local eateries, tasting everything from crispy Murukku Sandwich to hot filtered coffee. The group loved the spicy flavors and the chaotic charm of the market streets.",
            feedback: "Very good experience. The food stops were the highlight, though it was a bit crowded.",
            tags: ["Foodie", "Urban", "Tasting"]
        },
        {
            id: 4,
            tourName: "Colonial History of Madras",
            touristName: "Robert & friends",
            date: "Jan 05, 2024",
            duration: "3.5 hours",
            price: 2100,
            location: "Fort St. George",
            distance: "4.0 km",
            placesCount: 5,
            rating: 5,
            description: "Exploring the British colonial roots of Madras. We walked through Fort St. George, St. Mary's Church, and the museum. The tourists were fascinated by the old maps and military history. A very educational and structured walk.",
            feedback: "Detailed and informative. A must for history buffs.",
            tags: ["History", "Architecture", "Educational"]
        }
    ];

    return (
        <div className="min-h-screen bg-gray-50/50">
            <RoleAwareHeader
                user={user}
                currentPage="calendar"
                onNavigate={onNavigate}
                onLogout={onLogout}
            />

            <main className="container mx-auto px-4 py-8 max-w-4xl">
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onNavigate('home')}
                    className="mb-6 text-gray-600 hover:text-gray-900"
                >
                    <ArrowLeft className="w-4 h-4 mr-1" /> Back to Dashboard
                </Button>

                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Completed Tours</h1>
                    <p className="text-gray-500 mt-2">A detailed history of your successfully delivered experiences.</p>
                </div>

                <div className="space-y-6">
                    {COMPLETED_TOURS.map((tour) => (
                        <Card key={tour.id} className="border-none shadow-sm hover:shadow-md transition-shadow overflow-hidden bg-white group">
                            <CardContent className="p-0">
                                <div className="flex flex-col md:flex-row">
                                    {/* Left: Tour Details */}
                                    <div className="flex-1 p-6 space-y-4">
                                        <div className="flex justify-between items-start">
                                            <div>
                                                <h3 className="font-bold text-xl text-gray-900 group-hover:text-primary transition-colors">
                                                    {tour.tourName}
                                                </h3>
                                                <div className="flex items-center gap-2 text-sm text-gray-500 mt-1">
                                                    <MapPin className="w-4 h-4" /> {tour.location}
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-1 bg-green-50 text-green-700 px-3 py-1 rounded-full text-xs font-bold">
                                                <Star className="w-3 h-3 fill-current" />
                                                {tour.rating}.0
                                            </div>
                                        </div>

                                        <p className="text-gray-600 text-sm leading-relaxed border-l-2 border-primary/20 pl-4">
                                            {tour.description}
                                        </p>

                                        <div className="flex flex-wrap gap-4 pt-2 text-sm text-gray-600">
                                            <div className="flex items-center gap-1.5 bg-gray-50 px-2 py-1 rounded">
                                                <span className="font-semibold text-gray-900">{tour.distance}</span> walked
                                            </div>
                                            <div className="flex items-center gap-1.5 bg-gray-50 px-2 py-1 rounded">
                                                <span className="font-semibold text-gray-900">{tour.placesCount}</span> places visited
                                            </div>
                                        </div>

                                        <div className="flex flex-wrap gap-2 pt-1">
                                            {tour.tags.map(tag => (
                                                <span key={tag} className="px-2.5 py-0.5 rounded-md bg-gray-100 text-gray-600 text-xs font-medium">
                                                    #{tag}
                                                </span>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Right: Meta Info */}
                                    <div className="bg-gray-50/50 p-6 md:w-64 flex flex-col justify-between border-l border-gray-100">
                                        <div className="space-y-3 text-sm">
                                            <div className="flex items-center gap-2 text-gray-700">
                                                <User className="w-4 h-4 text-gray-400" />
                                                <span className="font-medium">{tour.touristName}</span>
                                            </div>
                                            <div className="flex items-center gap-2 text-gray-600">
                                                <Calendar className="w-4 h-4 text-gray-400" />
                                                <span>{tour.date}</span>
                                            </div>
                                            <div className="flex items-center gap-2 text-gray-600">
                                                <Clock className="w-4 h-4 text-gray-400" />
                                                <span>{tour.duration}</span>
                                            </div>
                                        </div>

                                        <div className="mt-6 pt-4 border-t border-gray-200">
                                            <div className="flex justify-between items-end">
                                                <div className="text-xs text-gray-500">Earnings</div>
                                                <div className="flex items-center gap-1 font-bold text-xl text-gray-900">
                                                    ₹{tour.price.toLocaleString()}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>

                <div className="mt-8 text-center">
                    <Button variant="outline" className="text-gray-500" disabled>
                        No more history to load
                    </Button>
                </div>
            </main>
        </div>
    );
}
