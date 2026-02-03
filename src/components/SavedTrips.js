import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect } from "react";
import { RoleAwareHeader } from "./RoleAwareHeader";
import {} from "@/lib/localStorage";
import { api } from "@/lib/api";
import { Button } from "./ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "./ui/card";
import { Loader2, MapPin, Calendar, Trash2, Sparkles, CloudRain, CloudSun, Thermometer, Wand2 } from "lucide-react";
import { toast } from "sonner";
import ReactMarkdown from 'react-markdown';
import { TripMap } from "./TripMap";
export function SavedTrips({ user, onNavigate, onLogout }) {
    const [trips, setTrips] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedTrip, setSelectedTrip] = useState(null);
    const [weather, setWeather] = useState(null);
    const [isAdjusting, setIsAdjusting] = useState(false);
    useEffect(() => {
        loadTrips();
    }, [user.id]);
    useEffect(() => {
        if (selectedTrip) {
            fetchWeather(selectedTrip.city);
        }
        else {
            setWeather(null);
        }
    }, [selectedTrip?.id]);
    const loadTrips = async () => {
        try {
            const data = await api.getSavedItineraries(user.id);
            setTrips(data);
        }
        catch (error) {
            toast.error("Failed to load saved trips");
        }
        finally {
            setLoading(false);
        }
    };
    const fetchWeather = async (city) => {
        try {
            const data = await api.getWeather(city);
            setWeather(data);
        }
        catch (error) {
            console.error("Failed to fetch weather", error);
        }
    };
    const handleAdjust = async () => {
        if (!selectedTrip)
            return;
        setIsAdjusting(true);
        try {
            const res = await api.adjustItinerary(selectedTrip.id);
            if (res.success && res.itinerary) {
                setTrips(prev => prev.map(t => t.id === selectedTrip.id ? res.itinerary : t));
                setSelectedTrip(res.itinerary);
                toast.success(res.message);
            }
            else {
                toast.info(res.message || "No adjustments made.");
            }
        }
        catch (error) {
            toast.error("Failed to adjust itinerary");
        }
        finally {
            setIsAdjusting(false);
        }
    };
    const handleDelete = async (e, id) => {
        e.stopPropagation();
        if (!confirm("Are you sure you want to delete this trip?"))
            return;
        try {
            await api.deleteItinerary(id);
            setTrips(trips.filter(t => t.id !== id));
            if (selectedTrip?.id === id)
                setSelectedTrip(null);
            toast.success("Trip deleted");
        }
        catch (error) {
            toast.error("Failed to delete trip");
        }
    };
    return (_jsxs("div", { className: "min-h-screen bg-gray-50", children: [_jsx(RoleAwareHeader, { user: user, currentPage: "saved-trips", onNavigate: onNavigate, onLogout: onLogout }), _jsxs("main", { className: "container mx-auto px-4 py-8 max-w-6xl", children: [_jsxs("div", { className: "flex items-center justify-between mb-8", children: [_jsxs("div", { children: [_jsx("h1", { className: "text-3xl font-heading font-bold text-gray-900", children: "My Saved Trips" }), _jsx("p", { className: "text-gray-500", children: "Persisted itineraries from the AI Planner" })] }), _jsxs(Button, { onClick: () => onNavigate('ai-planner'), className: "bg-primary hover:bg-primary/90", children: [_jsx(Sparkles, { className: "w-4 h-4 mr-2" }), " Plan New Trip"] })] }), _jsxs("div", { className: "grid lg:grid-cols-12 gap-8", children: [_jsx("div", { className: `${selectedTrip ? 'lg:col-span-4' : 'lg:col-span-12'} space-y-4`, children: loading ? (_jsx("div", { className: "flex justify-center p-12", children: _jsx(Loader2, { className: "w-8 h-8 animate-spin text-primary" }) })) : trips.length === 0 ? (_jsxs("div", { className: "text-center py-20 bg-white rounded-2xl border-2 border-dashed border-gray-200", children: [_jsx(Calendar, { className: "w-12 h-12 text-gray-300 mx-auto mb-4" }), _jsx("h3", { className: "text-lg font-bold text-gray-900", children: "No saved trips yet" }), _jsx("p", { className: "text-gray-500 mb-6", children: "Start planning your next adventure!" }), _jsx(Button, { onClick: () => onNavigate('ai-planner'), variant: "outline", children: "Go to AI Planner" })] })) : (_jsx("div", { className: `grid ${selectedTrip ? 'grid-cols-1' : 'md:grid-cols-2 lg:grid-cols-3'} gap-4`, children: trips.map(trip => (_jsx(Card, { className: `cursor-pointer transition-all hover:shadow-md border-2 ${selectedTrip?.id === trip.id ? 'border-primary' : 'border-transparent'}`, onClick: () => setSelectedTrip(trip), children: _jsxs(CardHeader, { className: "p-4", children: [_jsxs("div", { className: "flex justify-between items-start", children: [_jsx("div", { className: "p-2 bg-primary/10 rounded-lg", children: _jsx(MapPin, { className: "w-5 h-5 text-primary" }) }), _jsx(Button, { variant: "ghost", size: "icon", className: "text-gray-400 hover:text-red-500 hover:bg-red-50", onClick: (e) => handleDelete(e, trip.id), children: _jsx(Trash2, { className: "w-4 h-4" }) })] }), _jsx(CardTitle, { className: "text-lg mt-4", children: trip.title }), _jsxs(CardDescription, { className: "flex items-center gap-1", children: [_jsx(Calendar, { className: "w-3 h-3" }), "Saved on ", new Date(trip.created_at).toLocaleDateString()] })] }) }, trip.id))) })) }), selectedTrip && (_jsx("div", { className: "lg:col-span-8 space-y-6", children: _jsxs("div", { className: "bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden", children: [_jsxs("div", { className: "p-6 bg-gray-900 text-white flex justify-between items-center", children: [_jsxs("div", { children: [_jsx("h2", { className: "text-2xl font-bold", children: selectedTrip.title }), _jsx("p", { className: "text-gray-400 text-sm", children: selectedTrip.city })] }), _jsx(Button, { variant: "outline", size: "sm", className: "bg-white/10 border-white/20 hover:bg-white/20 text-white", onClick: () => setSelectedTrip(null), children: "Close Details" })] }), _jsxs(CardContent, { className: "p-8", children: [weather && (_jsxs("div", { className: `mb-8 p-4 rounded-xl border flex flex-col md:flex-row items-center justify-between gap-4 transition-all ${weather.condition === 'Rainy' ? 'bg-blue-50 border-blue-100' : 'bg-orange-50 border-orange-100'}`, children: [_jsxs("div", { className: "flex items-center gap-3", children: [_jsx("div", { className: `p-2 rounded-lg ${weather.condition === 'Rainy' ? 'bg-blue-100 text-blue-600' : 'bg-orange-100 text-orange-600'}`, children: weather.condition === 'Rainy' ? _jsx(CloudRain, { className: "w-6 h-6" }) : _jsx(CloudSun, { className: "w-6 h-6" }) }), _jsxs("div", { children: [_jsxs("h4", { className: "font-bold text-gray-900 flex items-center gap-2", children: ["Current Weather: ", weather.condition, _jsxs("span", { className: "text-sm font-normal text-gray-500 flex items-center gap-1", children: [_jsx(Thermometer, { className: "w-3 h-3" }), " ", weather.temp, "\u00B0C"] })] }), _jsx("p", { className: "text-xs text-gray-600", children: weather.condition === 'Rainy'
                                                                                ? "It's raining! Some outdoor spots might be closed."
                                                                                : "Great weather for exploration!" })] })] }), weather.condition === 'Rainy' && (_jsxs(Button, { onClick: handleAdjust, disabled: isAdjusting, className: "bg-blue-600 hover:bg-blue-700 text-white gap-2 shadow-lg shadow-blue-200 w-full md:w-auto", children: [isAdjusting ? _jsx(Loader2, { className: "w-4 h-4 animate-spin" }) : _jsx(Wand2, { className: "w-4 h-4" }), "Magic Adjust for Rain"] }))] })), _jsx("div", { className: "prose prose-blue max-w-none mb-8", children: _jsx(ReactMarkdown, { children: selectedTrip.content.itinerary }) }), selectedTrip.content.stops && selectedTrip.content.stops.length > 0 && (_jsx("div", { className: "mt-10 pt-10 border-t border-gray-100", children: _jsx(TripMap, { stops: selectedTrip.content.stops }) }))] })] }) }))] })] })] }));
}
