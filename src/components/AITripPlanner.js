import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useState } from "react";
import ReactMarkdown from 'react-markdown';
import { RoleAwareHeader } from "./RoleAwareHeader";
import {} from "@/lib/localStorage";
import { GuideCard } from "./GuideCard";
import {} from "@/types";
import { Button } from "./ui/button";
import { Card, CardContent } from "./ui/card";
import { Loader2, Sparkles, MapPin, Calendar, ArrowLeft, Bookmark } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { toast } from "sonner";
import { TripMap } from "./TripMap";
import { api } from "@/lib/api";
import { AILoadingAnimation } from "./AILoadingAnimation";
export function AITripPlanner({ user, onNavigate, onLogout, onViewProfile }) {
    const [city, setCity] = useState("Chennai");
    const [days, setDays] = useState("1");
    const [interests, setInterests] = useState([]);
    // Loading State Management
    const [isLoading, setIsLoading] = useState(false);
    const [isDataReady, setIsDataReady] = useState(false);
    const [result, setResult] = useState(null);
    const [isSaving, setIsSaving] = useState(false);
    const interestOptions = ["Food", "Culture", "History", "Nature", "Shopping"];
    const toggleInterest = (interest) => {
        if (interests.includes(interest)) {
            setInterests(interests.filter(i => i !== interest));
        }
        else {
            setInterests([...interests, interest]);
        }
    };
    const handleSave = async () => {
        if (!result)
            return;
        setIsSaving(true);
        try {
            await api.saveItinerary({
                userId: user.id,
                city,
                title: `${days} Day Trip to ${city}`,
                content: result
            });
            toast.success("Itinerary saved to your trips!");
        }
        catch (error) {
            toast.error("Failed to save itinerary");
        }
        finally {
            setIsSaving(false);
        }
    };
    const handleGenerate = async () => {
        setIsLoading(true);
        setIsDataReady(false);
        setResult(null);
        try {
            const data = await api.planTrip({
                city,
                days: parseInt(days),
                interests
            });
            if (data.itinerary) {
                // Formatting delay is handled by Animation now
                setResult(data);
                setIsDataReady(true); // Tell animation to finish
                toast.success("Itinerary Generated!");
            }
            else {
                toast.error("Failed to generate itinerary");
                setIsLoading(false); // Stop immediately on error
            }
        }
        catch (error) {
            console.error(error);
            toast.error(error.message || "Failed to generate itinerary. Please try again.");
            setIsLoading(false);
        }
    };
    return (_jsxs("div", { className: "min-h-screen bg-gray-50", children: [_jsx(RoleAwareHeader, { user: user, currentPage: "ai-planner", onNavigate: onNavigate, onLogout: onLogout }), _jsxs("main", { className: "container mx-auto px-4 py-8 max-w-5xl", children: [_jsxs(Button, { variant: "ghost", size: "sm", onClick: () => onNavigate('home'), className: "mb-4 text-gray-600 hover:text-gray-900", children: [_jsx(ArrowLeft, { className: "w-4 h-4 mr-1" }), " Back to Dashboard"] }), _jsxs("div", { className: "text-center mb-10", children: [_jsxs("h1", { className: "text-4xl font-heading font-bold text-gray-900 mb-3 flex items-center justify-center gap-3", children: [_jsx(Sparkles, { className: "w-8 h-8 text-primary animate-pulse" }), "AI Trip Planner"] }), _jsx("p", { className: "text-gray-600 max-w-2xl mx-auto text-lg", children: "Not sure what to do? Let our AI curate the perfect itinerary for you based on your interests and time." })] }), _jsxs("div", { className: "grid lg:grid-cols-3 gap-8", children: [_jsx(Card, { className: "lg:col-span-1 h-fit", children: _jsxs(CardContent, { className: "p-6 space-y-6", children: [_jsxs("div", { className: "space-y-3", children: [_jsxs("label", { className: "text-sm font-bold text-gray-700 flex items-center gap-2", children: [_jsx(MapPin, { className: "w-4 h-4" }), " Destination"] }), _jsxs(Select, { value: city, onValueChange: setCity, children: [_jsx(SelectTrigger, { children: _jsx(SelectValue, {}) }), _jsxs(SelectContent, { children: [_jsx(SelectItem, { value: "Chennai", children: "Chennai" }), _jsx(SelectItem, { value: "Bengaluru", children: "Bengaluru" }), _jsx(SelectItem, { value: "Hyderabad", children: "Hyderabad" }), _jsx(SelectItem, { value: "Kochi", children: "Kochi" }), _jsx(SelectItem, { value: "Mysuru", children: "Mysuru" }), _jsx(SelectItem, { value: "Madurai", children: "Madurai" }), _jsx(SelectItem, { value: "Pondicherry", children: "Pondicherry" }), _jsx(SelectItem, { value: "Coimbatore", children: "Coimbatore" }), _jsx(SelectItem, { value: "Thiruvananthapuram", children: "Thiruvananthapuram" }), _jsx(SelectItem, { value: "Visakhapatnam", children: "Visakhapatnam" })] })] })] }), _jsxs("div", { className: "space-y-3", children: [_jsxs("label", { className: "text-sm font-bold text-gray-700 flex items-center gap-2", children: [_jsx(Calendar, { className: "w-4 h-4" }), " Duration (Days)"] }), _jsxs(Select, { value: days, onValueChange: setDays, children: [_jsx(SelectTrigger, { children: _jsx(SelectValue, {}) }), _jsxs(SelectContent, { children: [_jsx(SelectItem, { value: "1", children: "1 Day" }), _jsx(SelectItem, { value: "2", children: "2 Days" }), _jsx(SelectItem, { value: "3", children: "3 Days" })] })] })] }), _jsxs("div", { className: "space-y-3", children: [_jsx("label", { className: "text-sm font-bold text-gray-700", children: "Interests" }), _jsx("div", { className: "flex flex-wrap gap-2", children: interestOptions.map(interest => (_jsx("button", { onClick: () => toggleInterest(interest), className: `px-3 py-1.5 rounded-full text-sm font-medium transition-colors border ${interests.includes(interest)
                                                            ? "bg-primary text-white border-primary"
                                                            : "bg-white text-gray-600 border-gray-200 hover:border-primary hover:text-primary"}`, children: interest }, interest))) })] }), _jsx(Button, { onClick: handleGenerate, disabled: isLoading, className: "w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-bold h-12 rounded-xl", children: isLoading ? (_jsxs(_Fragment, { children: [_jsx(Loader2, { className: "w-5 h-5 mr-2 animate-spin" }), " Generating Plan..."] })) : (_jsxs(_Fragment, { children: [_jsx(Sparkles, { className: "w-5 h-5 mr-2" }), " Generate Itinerary"] })) })] }) }), _jsxs("div", { className: "lg:col-span-2 space-y-8", children: [isLoading && (_jsx("div", { className: "h-fit", children: _jsx(AILoadingAnimation, { isDataReady: isDataReady, onComplete: () => setIsLoading(false) }) })), !isLoading && !result && (_jsxs("div", { className: "h-96 flex flex-col items-center justify-center bg-white/50 border-2 border-dashed border-gray-200 rounded-2xl", children: [_jsx(Sparkles, { className: "w-12 h-12 text-gray-300 mb-4" }), _jsx("p", { className: "text-gray-400 font-medium max-w-xs text-center", children: "Select your preferences and click generate to see the magic." })] })), !isLoading && result && (_jsxs("div", { className: "space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500", children: [_jsx(Card, { className: "min-h-[200px] border-blue-100 shadow-md", children: _jsxs(CardContent, { className: "p-6", children: [_jsxs("div", { className: "flex items-center justify-between mb-6", children: [_jsx("h2", { className: "text-2xl font-heading font-bold gradient-text", children: "Your Itinerary" }), _jsx(Button, { variant: "outline", onClick: handleSave, disabled: isSaving, children: isSaving ? (_jsxs(_Fragment, { children: [_jsx(Loader2, { className: "w-4 h-4 mr-2 animate-spin" }), " Saving..."] })) : (_jsxs(_Fragment, { children: [_jsx(Bookmark, { className: "w-4 h-4 mr-2" }), " Save Trip"] })) })] }), result.itinerary ? (_jsx("div", { className: "prose prose-blue max-w-none prose-headings:font-heading prose-a:text-blue-600", children: _jsx(ReactMarkdown, { children: result.itinerary }) })) : (_jsx("div", { className: "text-center py-10 text-gray-500", children: _jsx("p", { children: "No written itinerary available." }) }))] }) }), result.stops && (_jsxs("div", { className: "space-y-2", children: [_jsx("h3", { className: "font-heading font-bold text-lg px-1", children: "Route Map" }), _jsx(TripMap, { stops: result.stops })] })), result.guides && result.guides.length > 0 && (_jsxs("div", { className: "space-y-4", children: [_jsx("div", { className: "flex items-center justify-between px-1", children: _jsx("h2", { className: "text-xl font-heading font-bold text-gray-900", children: "Recommended Guides" }) }), _jsx("div", { className: "grid sm:grid-cols-2 gap-4", children: result.guides.map(guide => (_jsx(GuideCard, { guide: guide, onViewProfile: onViewProfile }, guide.id))) })] }))] }))] })] })] })] }));
}
