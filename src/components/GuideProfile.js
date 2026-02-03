import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect } from "react";
import { Button } from "./ui/button";
import { Card, CardContent } from "./ui/card";
import { BookingModal } from "./BookingModal";
import {} from "@/lib/localStorage";
import {} from "@/types";
import { api } from "@/lib/api";
import { socket } from "@/lib/socket";
import { toast } from "sonner";
import { MapPin, Star, Languages, ChevronLeft, Footprints, Lock, Play, MessageSquare, ShieldCheck, Coffee, Utensils, ShoppingBag, Image as ImageIcon } from "lucide-react";
export function GuideProfile({ guideId, onBack, currentUser, onNavigate }) {
    const [guide, setGuide] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isBookingOpen, setIsBookingOpen] = useState(false);
    const [reviews, setReviews] = useState([]);
    const [cityPhotos, setCityPhotos] = useState([]);
    useEffect(() => {
        const fetchDetails = async () => {
            setLoading(true);
            try {
                const guideData = await api.getGuideById(guideId);
                setGuide(guideData);
                if (guideData) {
                    // Fetch reviews
                    const reviewsData = await api.getReviewsForGuide(guideId);
                    setReviews(reviewsData);
                    // Fetch City Photos (Community posts from this city)
                    // We extract just the city name part (e.g. "Chennai" from "Chennai, Tamil Nadu")
                    const cityName = guideData.location.split(',')[0].trim();
                    const photosData = await api.getCommunityPosts(cityName);
                    // Filter for posts that actually have images
                    setCityPhotos(photosData.filter((p) => p.image));
                }
            }
            catch (error) {
                toast.error("Failed to load guide profile");
            }
            finally {
                setLoading(false);
            }
        };
        fetchDetails();
    }, [guideId]);
    const iconMap = {
        "map-pin": MapPin,
        "coffee": Coffee,
        "utensils": Utensils,
        "shopping-bag": ShoppingBag,
        "footprints": Footprints,
        "sunset": Star, // Fallback or specific
        "mask": ShieldCheck // Fallback
    };
    if (loading) {
        return (_jsxs("div", { className: "min-h-screen bg-gray-50 pb-24 md:pb-12 animate-pulse", children: [_jsx("div", { className: "bg-white border-b border-gray-200 px-4 py-3 md:px-8 h-16 w-full" }), _jsx("main", { className: "container mx-auto px-4 py-8", children: _jsxs("div", { className: "grid grid-cols-1 lg:grid-cols-12 gap-8", children: [_jsxs("div", { className: "lg:col-span-4 xl:col-span-3 space-y-6", children: [_jsx("div", { className: "aspect-[3/4] w-full bg-gray-200 rounded-xl" }), _jsx("div", { className: "h-40 bg-white rounded-xl" })] }), _jsxs("div", { className: "lg:col-span-8 xl:col-span-9 space-y-8", children: [_jsx("div", { className: "bg-white p-6 md:p-8 rounded-2xl h-48 bg-gray-200" }), _jsx("div", { className: "bg-white p-6 md:p-8 rounded-2xl h-64 bg-gray-200" })] })] }) })] }));
    }
    if (!guide)
        return _jsx("div", { children: "Guide not found" });
    const handleMessage = () => {
        // Start conversation via Socket
        const ids = [currentUser.id, guide.id].sort();
        const roomId = `room_${ids[0]}_${ids[1]}`;
        socket.connect();
        socket.emit('join_room', roomId);
        socket.emit('send_message', {
            roomId,
            senderId: currentUser.id,
            receiverId: guide.id,
            text: "Hi! I'm interested in a tour.",
        });
        onNavigate('messages', { guideId: guide.id });
    };
    // ... (rest of code)
    return (_jsxs("div", { className: "min-h-screen bg-gray-50 pb-24 md:pb-12", children: [_jsx("div", { className: "bg-white border-b border-gray-200 sticky top-0 z-20 px-4 py-3 md:px-8 shadow-sm", children: _jsxs("div", { className: "container mx-auto flex items-center justify-between", children: [_jsxs("div", { className: "flex items-center gap-4", children: [_jsxs(Button, { variant: "ghost", size: "sm", onClick: onBack, className: "text-gray-600 hover:text-gray-900 hover:bg-gray-100", children: [_jsx(ChevronLeft, { className: "w-5 h-5 mr-1" }), "Back"] }), _jsx(Button, { variant: "ghost", size: "sm", onClick: () => onNavigate('app'), className: "text-gray-600 hover:text-gray-900 hover:bg-gray-100 hidden md:flex", children: "Home" })] }), _jsx("span", { className: "font-bold text-gray-900 md:hidden", children: guide.name })] }) }), _jsx("main", { className: "container mx-auto px-4 py-8", children: _jsxs("div", { className: "grid grid-cols-1 lg:grid-cols-12 gap-8", children: [_jsxs("div", { className: "lg:col-span-4 xl:col-span-3 space-y-6", children: [_jsxs(Card, { className: "overflow-hidden border-none shadow-lg", children: [_jsxs("div", { className: "aspect-[3/4] w-full relative group", children: [_jsx("img", { src: guide.avatar, alt: guide.name, className: "w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" }), guide.verified && (_jsx("div", { className: "absolute top-4 left-4", children: _jsx("span", { className: "px-3 py-1 bg-white/90 backdrop-blur text-gray-900 text-xs font-bold uppercase tracking-wider rounded-lg shadow-sm", children: "Verified" }) }))] }), _jsxs(CardContent, { className: "p-6 space-y-6 bg-white", children: [_jsxs("div", { className: "text-center space-y-1", children: [_jsxs("div", { className: "flex items-center justify-center gap-1.5 text-yellow-500 font-bold text-xl", children: [_jsx(Star, { className: "w-5 h-5 fill-current" }), guide.rating, _jsxs("span", { className: "text-gray-400 text-sm font-normal", children: ["(", guide.reviewCount, " reviews)"] })] }), _jsxs("p", { className: "text-gray-500 text-sm", children: ["Response time: ", guide.responseTime] }), guide.experience && (_jsxs("p", { className: "text-gray-500 text-sm", children: ["Experience: ", guide.experience] }))] }), _jsxs("div", { className: "space-y-4 pt-4 border-t border-gray-100", children: [_jsxs("div", { className: "flex justify-between items-baseline px-2", children: [_jsx("span", { className: "text-gray-500", children: "Rate" }), _jsxs("span", { className: "text-3xl font-bold text-primary", children: ["\u20B9", guide.hourlyRate, _jsx("span", { className: "text-base font-normal text-gray-400", children: "/hr" })] })] }), _jsxs("div", { className: "grid grid-cols-2 gap-3", children: [_jsxs(Button, { size: "lg", variant: "outline", className: "w-full font-bold text-lg border-2", onClick: handleMessage, children: [_jsx(MessageSquare, { className: "w-5 h-5 mr-2" }), "Chat"] }), _jsx(Button, { size: "lg", className: "w-full bg-primary hover:bg-primary/90 text-white font-bold text-lg shadow-lg shadow-primary/20", onClick: () => setIsBookingOpen(true), children: "Book Now" })] }), _jsx("p", { className: "text-xs text-center text-gray-400", children: "No payment required today" }), _jsxs("div", { className: "mt-4 pt-4 border-t border-gray-100", children: [_jsxs("div", { className: "flex items-center gap-2 text-xs font-bold text-gray-500 mb-2", children: [_jsx("div", { className: "w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-primary", children: _jsx(Play, { className: "w-3 h-3 fill-current" }) }), "Hear my Intro"] }), _jsx("div", { className: "flex items-center gap-0.5 h-6", children: [...Array(20)].map((_, i) => (_jsx("div", { className: "w-1 bg-primary/40 rounded-full animate-pulse", style: {
                                                                            height: `${Math.random() * 100}% `,
                                                                            animationDelay: `${i * 0.05} s`
                                                                        } }, i))) })] })] })] })] }), guide.verified && (_jsx("div", { className: "hidden lg:grid grid-cols-1 gap-4", children: _jsxs("div", { className: "flex items-center gap-3 p-4 bg-white rounded-xl border border-gray-100 shadow-sm", children: [_jsx("div", { className: "p-2 bg-green-50 rounded-full text-green-600", children: _jsx(ShieldCheck, { className: "w-5 h-5" }) }), _jsxs("div", { children: [_jsx("p", { className: "font-bold text-sm text-gray-900", children: "Identity Verified" }), _jsx("p", { className: "text-xs text-gray-500", children: "Government ID Check" })] })] }) }))] }), _jsxs("div", { className: "lg:col-span-8 xl:col-span-9 space-y-8", children: [_jsxs("div", { className: "bg-white p-6 md:p-8 rounded-2xl shadow-sm border border-gray-100 space-y-4", children: [_jsxs("div", { children: [_jsx("h1", { className: "text-3xl md:text-4xl font-heading font-bold text-gray-900 mb-2", children: guide.name }), _jsxs("div", { className: "flex flex-wrap gap-4 text-gray-600", children: [_jsxs("span", { className: "flex items-center gap-1.5 bg-gray-50 px-3 py-1.5 rounded-lg border border-gray-100", children: [_jsx(MapPin, { className: "w-4 h-4 text-primary" }), " ", guide.location] }), _jsxs("span", { className: "flex items-center gap-1.5 bg-gray-50 px-3 py-1.5 rounded-lg border border-gray-100", children: [_jsx(Languages, { className: "w-4 h-4 text-primary" }), " ", guide.languages.join(", ")] })] })] }), _jsxs("div", { className: "pt-4 border-t border-gray-100", children: [_jsx("h3", { className: "font-bold text-sm text-gray-900 mb-3 uppercase tracking-wide", children: "Expertise" }), _jsx("div", { className: "flex flex-wrap gap-2", children: guide.specialties.map(tag => (_jsx("span", { className: "px-4 py-2 bg-secondary/50 text-secondary-foreground rounded-lg font-medium hover:bg-secondary transition-colors cursor-default", children: tag }, tag))) })] })] }), _jsxs("div", { className: "bg-white p-6 md:p-8 rounded-2xl shadow-sm border border-gray-100", children: [_jsx("h3", { className: "font-bold text-gray-900 mb-2", children: "About Me" }), _jsx("p", { className: "text-gray-600 leading-relaxed mb-6", children: guide.bio }), guide.itinerary && (_jsxs("div", { className: "mb-8", children: [_jsx("h3", { className: "font-bold text-gray-900 mb-4 text-lg", children: "A Day with Me" }), _jsx("div", { className: "space-y-0 pl-2", children: guide.itinerary.map((item, index) => {
                                                        const IconComponent = iconMap[item.icon] || MapPin;
                                                        return (_jsxs("div", { className: "flex gap-4 relative pb-6 last:pb-0", children: [index !== guide.itinerary.length - 1 && (_jsx("div", { className: "absolute left-[11px] top-6 bottom-0 w-0.5 bg-gray-200" })), _jsx("div", { className: "relative z-10 w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center shrink-0 border border-primary/20", children: _jsx(IconComponent, { className: "w-3 h-3 text-primary" }) }), _jsxs("div", { children: [_jsx("p", { className: "text-xs font-bold text-primary uppercase tracking-wider mb-0.5", children: item.time }), _jsx("p", { className: "text-gray-800 font-medium", children: item.activity })] })] }, index));
                                                    }) })] })), guide.hiddenGems && (_jsxs("div", { className: "mb-8", children: [_jsxs("div", { className: "flex items-center gap-2 mb-4", children: [_jsx("h3", { className: "font-bold text-gray-900 text-lg", children: "My Secret Spots" }), _jsx("span", { className: "px-2 py-0.5 bg-yellow-100 text-yellow-700 text-[10px] font-bold uppercase tracking-wider rounded-full", children: "Exclusive" })] }), _jsx("div", { className: "grid grid-cols-1 sm:grid-cols-2 gap-4", children: guide.hiddenGems.map((gem, index) => (_jsxs("div", { className: "group relative rounded-xl overflow-hidden h-40 border border-gray-100 shadow-sm cursor-pointer", children: [_jsx("img", { src: gem.image, className: "w-full h-full object-cover blur-sm scale-110 group-hover:scale-100 transition-all duration-700", alt: "Secret" }), _jsxs("div", { className: "absolute inset-0 bg-black/40 flex flex-col items-center justify-center text-white p-4 text-center", children: [_jsx(Lock, { className: "w-6 h-6 mb-2 text-white/80" }), _jsx("p", { className: "font-bold text-sm", children: "Book to Unlock" }), _jsx("p", { className: "text-xs text-white/70 mt-1", children: gem.description })] })] }, index))) })] }))] }), cityPhotos.length > 0 && (_jsxs("div", { className: "bg-white p-6 md:p-8 rounded-2xl shadow-sm border border-gray-100", children: [_jsxs("div", { className: "flex items-center gap-2 mb-6", children: [_jsx(ImageIcon, { className: "w-6 h-6 text-indigo-600" }), _jsxs("h2", { className: "text-2xl font-bold font-heading text-gray-900", children: [guide.location.split(',')[0], " Vibes"] })] }), _jsx("div", { className: "grid grid-cols-2 md:grid-cols-3 gap-4", children: cityPhotos.slice(0, 6).map((photo) => (_jsxs("div", { className: "relative group overflow-hidden rounded-xl aspect-square", children: [_jsx("img", { src: photo.image, alt: photo.city, className: "w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" }), _jsx("div", { className: "absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-3", children: _jsxs("p", { className: "text-white text-xs font-medium truncate", children: ["by ", photo.user_name] }) })] }, photo.id))) }), _jsx("p", { className: "text-sm text-gray-500 mt-4 text-center", children: "Photos from our travel community" })] })), _jsxs("div", { className: "bg-white p-6 md:p-8 rounded-2xl shadow-sm border border-gray-100", children: [_jsxs("div", { className: "flex items-center gap-3 mb-6", children: [_jsx("h2", { className: "text-2xl font-bold font-heading text-primary", children: "Guest Reviews" }), _jsx("span", { className: "bg-gray-100 text-gray-600 px-2 py-1 rounded-full text-sm font-bold", children: reviews.length })] }), _jsx("div", { className: "grid gap-6", children: reviews.map(review => (_jsx("div", { className: "pb-6 border-b border-gray-100 last:border-0 last:pb-0", children: _jsxs("div", { className: "flex items-start gap-4", children: [_jsx("img", { src: review.userAvatar, alt: review.userName, className: "w-12 h-12 rounded-full object-cover border border-gray-200" }), _jsxs("div", { className: "flex-1", children: [_jsxs("div", { className: "flex justify-between items-start mb-1", children: [_jsx("h4", { className: "font-bold text-gray-900", children: review.userName }), _jsx("span", { className: "text-xs text-gray-400", children: review.date })] }), _jsxs("div", { className: "flex items-center gap-2 mb-2", children: [_jsx("div", { className: "flex text-yellow-400", children: [...Array(5)].map((_, i) => (_jsx(Star, { className: `w - 3.5 h - 3.5 ${i < review.rating ? 'fill-current' : 'text-gray-200'} ` }, i))) }), _jsx("span", { className: "text-xs text-gray-500 font-medium px-2 py-0.5 bg-gray-50 rounded", children: review.tourType })] }), _jsx("p", { className: "text-gray-600 leading-relaxed", children: review.comment })] })] }) }, review.id))) })] })] })] }) }), _jsxs("div", { className: "fixed bottom-0 left-0 w-full bg-white border-t border-gray-200 p-4 z-30 lg:hidden flex items-center justify-between shadow-[0_-5px_20px_rgba(0,0,0,0.1)]", children: [_jsxs("div", { children: [_jsx("p", { className: "text-xs text-gray-500 font-medium", children: "Starting from" }), _jsxs("p", { className: "text-2xl font-bold text-primary", children: ["\u20B9", guide.hourlyRate, _jsx("span", { className: "text-sm text-gray-400 font-normal", children: "/hr" })] })] }), _jsx(Button, { size: "lg", className: "bg-accent hover:bg-accent/90 text-white font-bold px-8 rounded-xl shadow-lg shadow-accent/20", onClick: () => setIsBookingOpen(true), children: "Book Now" })] }), _jsx(BookingModal, { guideId: guide.id, guideName: guide.name, ratePerPerson: guide.hourlyRate, isOpen: isBookingOpen, onClose: () => setIsBookingOpen(false), currentUser: currentUser })] }));
}
