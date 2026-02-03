import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect } from "react";
import {} from "@/lib/localStorage";
import { RoleAwareHeader } from "./RoleAwareHeader";
import { GuideCard } from "./GuideCard";
import { api } from "@/lib/api";
import {} from "@/types";
import { Button } from "./ui/button";
import { Heart, ArrowLeft } from "lucide-react";
export function SavedGuides({ user, onNavigate, onLogout, onViewProfile }) {
    const [guides, setGuides] = useState([]);
    const [loading, setLoading] = useState(true);
    useEffect(() => {
        const fetchFavorites = async () => {
            setLoading(true);
            try {
                let favoriteIds = [];
                if (user) {
                    favoriteIds = await api.getFavorites(user.id);
                }
                if (favoriteIds.length === 0) {
                    setGuides([]);
                    return;
                }
                const allGuides = await api.fetchGuides();
                const favGuides = allGuides.filter(g => favoriteIds.includes(g.id));
                setGuides(favGuides);
            }
            catch (error) {
                console.error("Failed to fetch favorites", error);
            }
            finally {
                setLoading(false);
            }
        };
        fetchFavorites();
    }, [user]);
    return (_jsxs("div", { className: "min-h-screen bg-gray-50", children: [_jsx(RoleAwareHeader, { user: user, currentPage: "saved", onNavigate: onNavigate, onLogout: onLogout }), _jsx("div", { className: "bg-white border-b border-gray-200 sticky top-0 z-20 px-4 py-3 md:px-8 shadow-sm", children: _jsxs("div", { className: "container mx-auto flex items-center justify-between", children: [_jsxs(Button, { variant: "ghost", size: "sm", onClick: () => onNavigate('home'), className: "text-gray-600 hover:text-gray-900 hover:bg-gray-100", children: [_jsx(ArrowLeft, { className: "w-5 h-5 mr-1" }), "Back to Home"] }), _jsx("span", { className: "font-bold text-gray-900", children: "Saved Guides" })] }) }), _jsxs("main", { className: "container mx-auto px-4 py-8", children: [_jsxs("div", { className: "mb-8 flex items-center gap-3", children: [_jsx("div", { className: "w-12 h-12 bg-red-50 rounded-full flex items-center justify-center", children: _jsx(Heart, { className: "w-6 h-6 text-red-500 fill-red-500" }) }), _jsxs("div", { children: [_jsx("h1", { className: "text-3xl font-bold text-gray-900", children: "Saved Guides" }), _jsx("p", { className: "text-gray-500", children: "Your shortlist of favorite local experts" })] })] }), loading ? (_jsx("div", { className: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6", children: [1, 2, 3, 4].map((i) => (_jsx("div", { className: "h-[400px] bg-gray-200 animate-pulse rounded-2xl" }, i))) })) : (_jsx("div", { className: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6", children: guides.length > 0 ? (guides.map(guide => (_jsx(GuideCard, { guide: guide, user: user, onViewProfile: onViewProfile }, guide.id)))) : (_jsxs("div", { className: "col-span-full py-16 text-center text-gray-500", children: [_jsx("p", { className: "mb-4 text-lg", children: "You haven't saved any guides yet." }), _jsx(Button, { onClick: () => onNavigate('browseGuides'), children: "Browse Guides" })] })) }))] })] }));
}
