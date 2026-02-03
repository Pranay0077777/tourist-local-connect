import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useState, useEffect } from "react";
import { RoleAwareHeader } from "./RoleAwareHeader";
import { GuideCard } from "./GuideCard";
import {} from "@/lib/localStorage";
import { Search, ArrowRight } from "lucide-react";
import { Button } from "./ui/button";
import { api } from "@/lib/api";
const cityImages = {
    'Chennai': 'https://images.unsplash.com/photo-1582510003544-4d00b7f74220?auto=format&fit=crop&q=80&w=800',
    'Bengaluru': 'https://images.unsplash.com/photo-1596176530529-78163a4f7af2?auto=format&fit=crop&q=80&w=800',
    'Hyderabad': 'https://images.unsplash.com/photo-1572431441527-03266d627ec3?auto=format&fit=crop&q=80&w=800',
    'Kochi': 'https://images.unsplash.com/photo-1593504049359-74330189a355?auto=format&fit=crop&q=80&w=800',
    'Mysuru': 'https://images.unsplash.com/photo-1600100397608-f0109968edf9?auto=format&fit=crop&q=80&w=800',
    'Madurai': 'https://images.unsplash.com/photo-1580913956667-6284d7286377?auto=format&fit=crop&q=80&w=800',
};
export function BrowseGuides({ user, onNavigate, onLogout, onViewProfile, initialCity, initialBrowseMode }) {
    const [view, setView] = useState(initialBrowseMode || 'guides');
    const [searchQuery, setSearchQuery] = useState(initialCity || "");
    const [guides, setGuides] = useState([]);
    const [totalGuides, setTotalGuides] = useState([]); // For city counts
    const [loading, setLoading] = useState(true);
    const [availableCities, setAvailableCities] = useState([]);
    useEffect(() => {
        api.getAvailableCities().then(setAvailableCities).catch(console.error);
        api.fetchGuides().then(setTotalGuides).catch(console.error);
    }, []);
    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                const results = await api.fetchGuides({
                    query: searchQuery
                });
                setGuides(results);
            }
            catch (error) {
                console.error("Failed to fetch guides", error);
            }
            finally {
                setLoading(false);
            }
        };
        const timeoutId = setTimeout(fetchData, 300);
        return () => clearTimeout(timeoutId);
    }, [searchQuery]);
    const handleCityClick = (city) => {
        setSearchQuery(city);
        setView('guides');
    };
    return (_jsxs("div", { className: "min-h-screen bg-gray-50", children: [_jsx(RoleAwareHeader, { user: user, currentPage: "browse", onNavigate: onNavigate, onLogout: onLogout }), _jsx("main", { className: "container mx-auto px-4 py-8", children: _jsxs("div", { className: "flex flex-col gap-8", children: [_jsxs("div", { className: "flex flex-col md:flex-row justify-between items-center gap-6", children: [_jsxs("div", { className: "text-center md:text-left", children: [_jsx("h1", { className: "text-3xl font-bold text-gray-900 font-heading", children: view === 'cities' ? 'Exotic Destinations' : 'Find Your Local Guide' }), _jsx("p", { className: "text-gray-500 mt-1", children: view === 'cities' ? 'Discover the best cities in South India with expert local guides.' : 'Discover experienced locals to show you around South India.' })] }), _jsxs("div", { className: "flex items-center gap-4 w-full md:w-auto", children: [_jsxs("div", { className: "flex bg-white p-1 rounded-xl shadow-sm border border-gray-100 h-12", children: [_jsx("button", { onClick: () => setView('guides'), className: `px-6 py-2 rounded-lg text-sm font-bold transition-all ${view === 'guides' ? 'bg-primary text-white shadow-md' : 'text-gray-500 hover:bg-gray-50'}`, children: "Guides" }), _jsx("button", { onClick: () => setView('cities'), className: `px-6 py-2 rounded-lg text-sm font-bold transition-all ${view === 'cities' ? 'bg-primary text-white shadow-md' : 'text-gray-500 hover:bg-gray-50'}`, children: "Cities" })] }), _jsxs("div", { className: "relative flex-1 md:w-[350px] group", children: [_jsx(Search, { className: "absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5 z-10" }), _jsx("input", { type: "text", placeholder: "Search...", className: "w-full pl-12 pr-4 py-3 bg-white border border-gray-200 rounded-2xl focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all shadow-sm relative z-10 text-gray-900", value: searchQuery, onChange: (e) => {
                                                        setSearchQuery(e.target.value);
                                                        if (view === 'cities')
                                                            setView('guides');
                                                    } })] })] })] }), view === 'cities' ? (_jsx("div", { className: "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 animate-in fade-in slide-in-from-bottom-2 duration-200", children: availableCities.map(city => (_jsxs("div", { onClick: () => handleCityClick(city), className: "group relative h-80 rounded-3xl overflow-hidden cursor-pointer shadow-md hover:shadow-xl transition-all duration-300 hover:-translate-y-1", children: [_jsx("img", { src: (cityImages[city] || `https://images.unsplash.com/photo-1548013146-72479768bada?auto=format&fit=crop&q=80&w=400`).replace('w=800', 'w=400'), alt: city, className: "w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" }), _jsx("div", { className: "absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" }), _jsxs("div", { className: "absolute bottom-6 left-6 right-6", children: [_jsx("h3", { className: "text-2xl font-bold text-white mb-1", children: city }), _jsxs("p", { className: "text-gray-200 text-sm font-medium flex items-center gap-2", children: ["View ", totalGuides.filter(g => g.location.includes(city)).length || 'Local', " Guides", _jsx(ArrowRight, { className: "w-4 h-4 group-hover:translate-x-1 transition-transform" })] })] }), _jsx("div", { className: "absolute top-6 right-6", children: _jsx("div", { className: "bg-white/20 backdrop-blur-md px-3 py-1 rounded-full text-white text-xs font-bold border border-white/30", children: "Popular" }) })] }, city))) })) : (_jsxs(_Fragment, { children: [availableCities.length > 0 && (_jsxs("div", { className: "space-y-4 animate-in fade-in slide-in-from-top-2 duration-200", children: [_jsx("h2", { className: "text-sm font-bold text-gray-400 uppercase tracking-widest px-1", children: "Popular Cities" }), _jsxs("div", { className: "flex flex-wrap gap-2", children: [_jsx("button", { onClick: () => setSearchQuery(""), className: `px-4 py-2 border rounded-xl text-sm font-semibold transition-all active:scale-95 ${!searchQuery ? 'bg-primary text-white border-primary shadow-sm' : 'bg-white text-gray-700 border-gray-100 hover:border-primary hover:text-primary'}`, children: "All Cities" }), availableCities.slice(0, 10).map(city => (_jsx("button", { onClick: () => setSearchQuery(city), className: `px-4 py-2 border rounded-xl text-sm font-semibold transition-all active:scale-95 ${searchQuery === city ? 'bg-primary text-white border-primary shadow-sm' : 'bg-white text-gray-700 border-gray-100 hover:border-primary hover:text-primary'}`, children: city }, city)))] })] })), _jsxs("div", { className: "space-y-6", children: [_jsxs("div", { className: "flex items-center justify-between px-1", children: [_jsx("h2", { className: "text-xl font-bold text-gray-900 font-heading", children: searchQuery ? `Guides in "${searchQuery}"` : "All Available Guides" }), _jsxs("span", { className: "text-sm text-gray-500 font-medium", children: [guides.length, " matches found"] })] }), loading ? (_jsx("div", { className: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6", children: [1, 2, 3, 4, 5, 6].map((i) => (_jsx("div", { className: "h-[420px] bg-white border border-gray-100 rounded-2xl animate-pulse shadow-sm" }, i))) })) : (_jsx(_Fragment, { children: guides.length > 0 ? (_jsx("div", { className: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6", children: guides.map(guide => (_jsx(GuideCard, { guide: guide, user: user, onViewProfile: onViewProfile }, guide.id))) })) : (_jsxs("div", { className: "py-20 text-center bg-white border border-dashed border-gray-200 rounded-3xl", children: [_jsx("div", { className: "inline-flex items-center justify-center w-20 h-20 bg-gray-50 rounded-full mb-6", children: _jsx(Search, { className: "w-10 h-10 text-gray-300" }) }), _jsx("h3", { className: "text-xl font-bold text-gray-900 mb-2", children: "No guides found in this area" }), _jsx("p", { className: "text-gray-500 max-w-xs mx-auto mb-8", children: "Try searching for a different city or clearing your filters to see everyone." }), _jsx(Button, { onClick: () => setSearchQuery(""), className: "rounded-xl px-8 h-12 font-bold", children: "View All Guides" })] })) }))] })] }))] }) })] }));
}
