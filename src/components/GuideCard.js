import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
// ... (imports remain)
import { MapPin, Star, Heart, Award, Globe } from "lucide-react";
import {} from "@/types";
import {} from "@/lib/localStorage";
import { useState, useEffect } from "react";
import { api } from "@/lib/api";
import { toast } from "sonner";
export function GuideCard({ guide, user, onViewProfile }) {
    const [isFavorite, setIsFavorite] = useState(false);
    useEffect(() => {
        const checkFavorite = async () => {
            if (user) {
                try {
                    const favorites = await api.getFavorites(user.id);
                    setIsFavorite(favorites.includes(guide.id));
                }
                catch (err) {
                    console.error("Failed to fetch favorites", err);
                }
            }
        };
        checkFavorite();
    }, [guide.id, user]);
    const toggleFavorite = async (e) => {
        e.stopPropagation();
        if (user) {
            // API
            const newStatus = !isFavorite;
            setIsFavorite(newStatus); // Optimistic
            try {
                if (newStatus) {
                    await api.addFavorite(user.id, guide.id);
                    toast.success("Added to favorites");
                }
                else {
                    await api.removeFavorite(user.id, guide.id);
                    toast.success("Removed from favorites");
                }
            }
            catch (err) {
                console.error("Failed to toggle favorite", err);
                setIsFavorite(!newStatus); // Revert
                toast.error("Failed to update favorite");
            }
        }
        else {
            toast.error("Please log in to save favorites");
        }
    };
    return (_jsxs("div", { onClick: () => onViewProfile(guide.id), className: "group relative bg-card rounded-xl shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-200 overflow-hidden cursor-pointer border border-border/50 flex flex-col h-full", children: [_jsxs("div", { className: "relative aspect-[4/3] overflow-hidden bg-muted", children: [_jsx("img", { src: guide.avatar.includes('w=') ? guide.avatar.replace(/w=\d+/, 'w=400').replace(/h=\d+/, 'h=300') : guide.avatar, alt: guide.name, className: "w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-500", loading: "lazy" }), _jsx("div", { className: "absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-60 group-hover:opacity-80 transition-opacity duration-200" }), _jsx("button", { className: "absolute top-3 right-3 p-2 rounded-full bg-white/90 backdrop-blur-sm hover:bg-white shadow-md transition-all duration-200 z-10 active:scale-95", onClick: toggleFavorite, children: _jsx(Heart, { className: `w-5 h-5 transition-colors duration-200 ${isFavorite ? 'fill-red-500 text-red-500' : 'text-gray-400'}` }) }), guide.verified && (_jsxs("div", { className: "absolute top-3 left-3 px-3 py-1 bg-blue-600/90 backdrop-blur-sm text-white text-[10px] font-bold tracking-wider rounded-full shadow-lg flex items-center gap-1", children: [_jsx(Award, { className: "w-3 h-3" }), "VERIFIED"] }))] }), _jsxs("div", { className: "p-5 flex flex-col flex-1 bg-card", children: [_jsxs("div", { className: "flex justify-between items-start mb-2", children: [_jsxs("div", { children: [_jsx("h3", { className: "text-lg font-bold text-foreground group-hover:text-primary transition-colors font-heading", children: guide.name }), _jsxs("div", { className: "flex items-center text-muted-foreground text-sm mt-1", children: [_jsx(MapPin, { className: "w-3 h-3 mr-1" }), guide.location] })] }), _jsx("div", { className: "flex flex-col items-end", children: _jsxs("div", { className: "flex items-center bg-secondary px-2 py-1 rounded-lg border border-border/50", children: [_jsx(Star, { className: "w-3.5 h-3.5 text-accent fill-accent mr-1" }), _jsx("span", { className: "font-bold text-foreground text-sm", children: guide.rating }), _jsxs("span", { className: "text-muted-foreground text-xs ml-1", children: ["(", guide.reviewCount, ")"] })] }) })] }), _jsx("p", { className: "text-muted-foreground text-sm line-clamp-2 mb-4 flex-1", children: guide.bio }), _jsxs("div", { className: "space-y-3 mt-auto", children: [_jsxs("div", { className: "flex items-center gap-2 text-xs text-muted-foreground", children: [_jsx(Globe, { className: "w-3.5 h-3.5" }), _jsxs("span", { className: "truncate", children: ["Takes tours in: ", (Array.isArray(guide.languages)
                                                ? guide.languages
                                                : typeof guide.languages === 'string'
                                                    ? JSON.parse(guide.languages || '[]')
                                                    : []).join(", ")] })] }), _jsxs("div", { className: "pt-3 border-t border-border/50 flex items-center justify-between", children: [_jsxs("div", { children: [_jsx("span", { className: "text-[10px] text-muted-foreground uppercase font-bold tracking-wider block mb-0.5", children: "Rate" }), _jsxs("span", { className: "text-primary font-bold", children: ["\u20B9", guide.hourlyRate, "/hr"] })] }), _jsxs("div", { className: "text-right", children: [_jsx("span", { className: "text-[10px] text-muted-foreground uppercase font-bold tracking-wider block mb-0.5", children: "Experience" }), _jsxs("span", { className: "text-foreground font-medium flex items-center gap-1 justify-end", children: [_jsx(Award, { className: "w-3 h-3 text-accent" }), guide.experience || '2+ years'] })] })] })] })] })] }));
}
export default GuideCard;
