import { useState, useEffect } from "react";
import { RoleAwareHeader } from "./RoleAwareHeader";
import { type LocalUser } from "@/lib/localStorage";
import { api } from "@/lib/api";
import { Button } from "./ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "./ui/card";
import {
    Loader2,
    MapPin,
    Calendar,
    Trash2,
    Sparkles,
    CloudRain,
    CloudSun,
    Thermometer,
    Wand2
} from "lucide-react";
import { toast } from "sonner";
import ReactMarkdown from 'react-markdown';
import { TripMap } from "./TripMap";

interface SavedTripsProps {
    user: LocalUser;
    onNavigate: (page: string) => void;
    onLogout: () => void;
}

export function SavedTrips({ user, onNavigate, onLogout }: SavedTripsProps) {
    const [trips, setTrips] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedTrip, setSelectedTrip] = useState<any | null>(null);
    const [weather, setWeather] = useState<{ condition: string; temp: number } | null>(null);
    const [isAdjusting, setIsAdjusting] = useState(false);

    useEffect(() => {
        loadTrips();
    }, [user.id]);

    useEffect(() => {
        if (selectedTrip) {
            fetchWeather(selectedTrip.city);
        } else {
            setWeather(null);
        }
    }, [selectedTrip?.id]);

    const loadTrips = async () => {
        try {
            const data = await api.getSavedItineraries(user.id);
            setTrips(data);
        } catch (error) {
            toast.error("Failed to load saved trips");
        } finally {
            setLoading(false);
        }
    };

    const fetchWeather = async (city: string) => {
        try {
            const data = await api.getWeather(city);
            setWeather(data);
        } catch (error) {
            console.error("Failed to fetch weather", error);
        }
    };

    const handleAdjust = async () => {
        if (!selectedTrip) return;
        setIsAdjusting(true);
        try {
            const res = await api.adjustItinerary(selectedTrip.id);
            if (res.success && res.itinerary) {
                setTrips(prev => prev.map(t => t.id === selectedTrip.id ? res.itinerary : t));
                setSelectedTrip(res.itinerary);
                toast.success(res.message);
            } else {
                toast.info(res.message || "No adjustments made.");
            }
        } catch (error) {
            toast.error("Failed to adjust itinerary");
        } finally {
            setIsAdjusting(false);
        }
    };

    const handleDelete = async (e: React.MouseEvent, id: string) => {
        e.stopPropagation();
        if (!confirm("Are you sure you want to delete this trip?")) return;

        try {
            await api.deleteItinerary(id);
            setTrips(trips.filter(t => t.id !== id));
            if (selectedTrip?.id === id) setSelectedTrip(null);
            toast.success("Trip deleted");
        } catch (error) {
            toast.error("Failed to delete trip");
        }
    };

    return (
        <div className="min-h-screen bg-gray-50">
            <RoleAwareHeader
                user={user}
                currentPage="saved-trips"
                onNavigate={onNavigate}
                onLogout={onLogout}
            />

            <main className="container mx-auto px-4 py-8 max-w-6xl">
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h1 className="text-3xl font-heading font-bold text-gray-900">My Saved Trips</h1>
                        <p className="text-gray-500">Persisted itineraries from the AI Planner</p>
                    </div>
                    <Button
                        onClick={() => onNavigate('ai-planner')}
                        className="bg-primary hover:bg-primary/90"
                    >
                        <Sparkles className="w-4 h-4 mr-2" /> Plan New Trip
                    </Button>
                </div>

                <div className="grid lg:grid-cols-12 gap-8">
                    {/* List of Trips */}
                    <div className={`${selectedTrip ? 'lg:col-span-4' : 'lg:col-span-12'} space-y-4`}>
                        {loading ? (
                            <div className="flex justify-center p-12">
                                <Loader2 className="w-8 h-8 animate-spin text-primary" />
                            </div>
                        ) : trips.length === 0 ? (
                            <div className="text-center py-20 bg-white rounded-2xl border-2 border-dashed border-gray-200">
                                <Calendar className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                                <h3 className="text-lg font-bold text-gray-900">No saved trips yet</h3>
                                <p className="text-gray-500 mb-6">Start planning your next adventure!</p>
                                <Button onClick={() => onNavigate('ai-planner')} variant="outline">
                                    Go to AI Planner
                                </Button>
                            </div>
                        ) : (
                            <div className={`grid ${selectedTrip ? 'grid-cols-1' : 'md:grid-cols-2 lg:grid-cols-3'} gap-4`}>
                                {trips.map(trip => (
                                    <Card
                                        key={trip.id}
                                        className={`cursor-pointer transition-all hover:shadow-md border-2 ${selectedTrip?.id === trip.id ? 'border-primary' : 'border-transparent'}`}
                                        onClick={() => setSelectedTrip(trip)}
                                    >
                                        <CardHeader className="p-4">
                                            <div className="flex justify-between items-start">
                                                <div className="p-2 bg-primary/10 rounded-lg">
                                                    <MapPin className="w-5 h-5 text-primary" />
                                                </div>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="text-gray-400 hover:text-red-500 hover:bg-red-50"
                                                    onClick={(e) => handleDelete(e, trip.id)}
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </Button>
                                            </div>
                                            <CardTitle className="text-lg mt-4">{trip.title}</CardTitle>
                                            <CardDescription className="flex items-center gap-1">
                                                <Calendar className="w-3 h-3" />
                                                Saved on {new Date(trip.created_at).toLocaleDateString()}
                                            </CardDescription>
                                        </CardHeader>
                                    </Card>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Trip Detail View */}
                    {selectedTrip && (
                        <div className="lg:col-span-8 space-y-6">
                            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                                <div className="p-6 bg-gray-900 text-white flex justify-between items-center">
                                    <div>
                                        <h2 className="text-2xl font-bold">{selectedTrip.title}</h2>
                                        <p className="text-gray-400 text-sm">{selectedTrip.city}</p>
                                    </div>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        className="bg-white/10 border-white/20 hover:bg-white/20 text-white"
                                        onClick={() => setSelectedTrip(null)}
                                    >
                                        Close Details
                                    </Button>
                                </div>

                                <CardContent className="p-8">
                                    {/* Weather Alert & Adjuster */}
                                    {weather && (
                                        <div className={`mb-8 p-4 rounded-xl border flex flex-col md:flex-row items-center justify-between gap-4 transition-all ${weather.condition === 'Rainy' ? 'bg-blue-50 border-blue-100' : 'bg-orange-50 border-orange-100'}`}>
                                            <div className="flex items-center gap-3">
                                                <div className={`p-2 rounded-lg ${weather.condition === 'Rainy' ? 'bg-blue-100 text-blue-600' : 'bg-orange-100 text-orange-600'}`}>
                                                    {weather.condition === 'Rainy' ? <CloudRain className="w-6 h-6" /> : <CloudSun className="w-6 h-6" />}
                                                </div>
                                                <div>
                                                    <h4 className="font-bold text-gray-900 flex items-center gap-2">
                                                        Current Weather: {weather.condition}
                                                        <span className="text-sm font-normal text-gray-500 flex items-center gap-1">
                                                            <Thermometer className="w-3 h-3" /> {weather.temp}°C
                                                        </span>
                                                    </h4>
                                                    <p className="text-xs text-gray-600">
                                                        {weather.condition === 'Rainy'
                                                            ? "It's raining! Some outdoor spots might be closed."
                                                            : "Great weather for exploration!"}
                                                    </p>
                                                </div>
                                            </div>

                                            {weather.condition === 'Rainy' && (
                                                <Button
                                                    onClick={handleAdjust}
                                                    disabled={isAdjusting}
                                                    className="bg-blue-600 hover:bg-blue-700 text-white gap-2 shadow-lg shadow-blue-200 w-full md:w-auto"
                                                >
                                                    {isAdjusting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Wand2 className="w-4 h-4" />}
                                                    Magic Adjust for Rain
                                                </Button>
                                            )}
                                        </div>
                                    )}

                                    <div className="prose prose-blue max-w-none mb-8">
                                        <ReactMarkdown>{selectedTrip.content.itinerary}</ReactMarkdown>
                                    </div>

                                    {selectedTrip.content.stops && selectedTrip.content.stops.length > 0 && (
                                        <div className="mt-10 pt-10 border-t border-gray-100">
                                            <TripMap stops={selectedTrip.content.stops} />
                                        </div>
                                    )}
                                </CardContent>
                            </div>
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
}
