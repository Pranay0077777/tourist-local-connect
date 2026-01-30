import { useState, useEffect } from "react";
import { RoleAwareHeader } from "./RoleAwareHeader";
import { Card } from "./ui/card";
import { Button } from "./ui/button";
import { Search, ArrowRight } from "lucide-react";
import { type LocalUser } from "@/lib/localStorage";
import { api } from "@/lib/api";
import { type Guide } from "@/types";

interface TravellerHomePageProps {
    user: LocalUser;
    onNavigate: (page: string, params?: unknown) => void;
    onLogout: () => void;
}

const popularCities = [
    {
        name: "Chennai",
        image: "https://images.unsplash.com/photo-1582510003544-4d00b7f74220?q=80&w=1974&auto=format&fit=crop", // Kapaleeshwarar Temple
        description: "Kapaleeshwarar Temple"
    },
    {
        name: "Bengaluru",
        image: "https://images.unsplash.com/photo-1596176530529-78163a4f7af2?q=80&w=2070&auto=format&fit=crop", // Vidhana Soudha / Cityscape
        description: "Vidhana Soudha & Gardens"
    },
    {
        name: "Kochi",
        image: "https://plus.unsplash.com/premium_photo-1697730221799-f2aa87519636?q=80&w=2070&auto=format&fit=crop", // Chinese Fishing Nets
        description: "Chinese Fishing Nets"
    },
    {
        name: "Hyderabad",
        image: "https://images.unsplash.com/photo-1644941929421-4fa506482142?q=80&w=2070&auto=format&fit=crop", // Golconda Fort / Ruins vibe
        description: "Golkonda Fort & Heritage"
    },
    {
        name: "Mysuru",
        image: "https://images.unsplash.com/photo-1606214227915-132d0ff846db?q=80&w=2070&auto=format&fit=crop", // Mysore Palace
        description: "Mysore Palace"
    },
    {
        name: "Puducherry",
        image: "https://images.unsplash.com/photo-1616853244820-91c6e19d146c?q=80&w=2070&auto=format&fit=crop", // French Colony
        description: "French Colony Streets"
    }
];

export function TravellerHomePage({ user, onNavigate, onLogout }: TravellerHomePageProps) {
    const [guides, setGuides] = useState<Guide[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);

    useEffect(() => {
        api.fetchGuides()
            .then(data => {
                if (Array.isArray(data)) {
                    setGuides(data);
                } else {
                    setGuides([]);
                }
            })
            .catch(err => {
                console.error("Failed to fetch guides", err);
                setError(true);
            })
            .finally(() => setLoading(false));
    }, []);

    // Helper to get guide count
    const getGuideCount = (city: string) => {
        return guides.filter(g => g.location.includes(city)).length;
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
                <h2 className="text-xl font-bold text-gray-900 mb-2">Something went wrong</h2>
                <p className="text-gray-500 mb-4">We couldn't load the latest guides.</p>
                <Button onClick={() => window.location.reload()}>Retry</Button>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <RoleAwareHeader
                user={user}
                currentPage="home"
                onNavigate={onNavigate}
                onLogout={onLogout}
            />

            <main className="container mx-auto px-4 py-8 space-y-12">
                {/* Hero Search Section - Simplified Layout */}
                <div className="text-center space-y-6 py-8 md:py-12">
                    <h1 className="text-4xl md:text-5xl font-heading font-bold text-gray-900 leading-tight">
                        Explore South India <br />
                        <span className="text-primary italic">Like a Local</span>
                    </h1>
                    <p className="text-lg text-gray-500 max-w-2xl mx-auto">
                        Connect with verified guides who know the stories behind the stones, the spices in the food, and the secrets of the city.
                    </p>

                    <div className="max-w-xl mx-auto relative group">
                        <div className="absolute inset-0 bg-primary/20 blur-xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
                        <div className="bg-white p-2 rounded-2xl shadow-xl border border-gray-100 flex items-center relative z-10">
                            <div className="pl-4 text-gray-400">
                                <Search className="w-6 h-6" />
                            </div>
                            <input
                                type="text"
                                placeholder="Where do you want to go?"
                                className="flex-1 px-4 py-3 bg-transparent outline-none text-gray-900 placeholder:text-gray-400 font-medium"
                                onChange={() => {
                                    // Placeholder for future state management
                                }}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter') {
                                        const val = e.currentTarget.value.trim();
                                        if (val) onNavigate('browseGuides', { city: val });
                                    }
                                }}
                            />
                            <Button className="rounded-xl px-6 h-12 font-bold" onClick={(e) => {
                                const input = e.currentTarget.previousElementSibling as HTMLInputElement;
                                if (input && input.value.trim()) {
                                    onNavigate('browseGuides', { city: input.value.trim() });
                                }
                            }}>
                                Search
                            </Button>
                        </div>
                    </div>
                </div>

                {/* Popular Cities Grid */}
                <div className="space-y-6">
                    <div className="flex items-end justify-between px-2">
                        <div>
                            <h2 className="text-3xl font-heading font-bold text-gray-900">Popular Destinations</h2>
                            <p className="text-gray-500 mt-1">Found expert guides in these cities</p>
                        </div>
                        <Button variant="link" className="text-primary font-semibold" onClick={() => onNavigate('browseGuides')}>
                            View all cities <ArrowRight className="w-4 h-4 ml-1" />
                        </Button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        {popularCities.map((city) => {
                            const count = getGuideCount(city.name);
                            if (count === 0 && city.name !== 'Chennai' && city.name !== 'Bengaluru') return null; // Optional: Hide empty cities if desired, removing for now to show layout

                            return (
                                <div
                                    key={city.name}
                                    className="group relative h-64 rounded-3xl overflow-hidden cursor-pointer shadow-md hover:shadow-xl transition-all duration-300"
                                    onClick={() => onNavigate('browseGuides', { city: city.name })}
                                >
                                    {/* Background Image */}
                                    <img
                                        src={city.image}
                                        alt={city.name}
                                        className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                                    />

                                    {/* Gradient Overlay */}
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

                                    {/* Content Overlay */}
                                    <div className="absolute bottom-0 left-0 p-6 w-full text-white">
                                        <p className="text-white/80 text-sm font-medium mb-1 transform translate-y-2 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300">
                                            {city.description}
                                        </p>
                                        <h3 className="text-2xl font-bold font-heading mb-1">{city.name}</h3>
                                        <div className="flex items-center gap-2">
                                            <span className="bg-white/20 backdrop-blur-md px-2 py-0.5 rounded text-xs font-semibold text-white border border-white/30">
                                                {count} Verified Guides
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* AI Planner Promo Banner */}
                <Card className="bg-gradient-to-r from-indigo-600 to-purple-800 text-white border-none rounded-3xl p-8 md:p-12 relative overflow-hidden shadow-2xl group cursor-pointer" onClick={() => onNavigate('ai-planner')}>
                    <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -mr-16 -mt-16 animate-pulse" />
                    <div className="absolute bottom-0 left-0 w-48 h-48 bg-purple-500/20 rounded-full blur-3xl -ml-12 -mb-12" />

                    <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
                        <div className="space-y-4 max-w-xl">
                            <div className="inline-flex items-center gap-2 bg-white/10 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider border border-white/20 backdrop-blur-md">
                                <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></span>
                                New Feature
                            </div>
                            <h2 className="text-3xl md:text-4xl font-bold font-heading leading-tight">
                                Confused about your plan? <br /> Let AI Decide.
                            </h2>
                            <p className="text-indigo-100 text-lg">
                                Get a personalized day-by-day itinerary and guide suggestions based on your interests in seconds.
                            </p>
                            <Button
                                variant="secondary"
                                size="lg"
                                className="font-bold text-indigo-700 hover:bg-white shadow-lg transform group-hover:-translate-y-1 transition-all"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    onNavigate('ai-planner');
                                }}
                            >
                                Try AI Trip Planner
                            </Button>
                        </div>
                        <div className="hidden md:block relative">
                            <div className="absolute inset-0 bg-indigo-500/30 blur-2xl rounded-full"></div>
                            {/* Simple SVG illustration for AI */}
                            <svg className="w-40 h-40 text-white relative z-10 drop-shadow-xl" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M12 2a10 10 0 1 0 10 10H12V2z"></path>
                                <path d="M12 12 2.1 12a10.1 10.1 0 0 0 13.9 6" strokeOpacity="0.5"></path>
                                <path d="M22 17a10 10 0 0 0-6.1-4.9"></path>
                            </svg>
                        </div>
                    </div>
                </Card>

            </main>
        </div>
    );
}
