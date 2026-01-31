import { useState, useEffect } from "react";
import { RoleAwareHeader } from "./RoleAwareHeader";
import { GuideCard } from "./GuideCard";
import { type LocalUser } from "@/lib/localStorage";
import { Search, ArrowRight } from "lucide-react";
import { Button } from "./ui/button";
import { api } from "@/lib/api";

interface BrowseGuidesProps {
    user: LocalUser;
    onNavigate: (page: string, params?: any) => void;
    onLogout: () => void;
    onViewProfile: (guideId: string) => void;
    initialCity?: string;
    initialBrowseMode?: 'guides' | 'cities';
}

const cityImages: Record<string, string> = {
    'Chennai': 'https://images.unsplash.com/photo-1582510003544-4d00b7f74220?auto=format&fit=crop&q=80&w=800',
    'Bengaluru': 'https://images.unsplash.com/photo-1596176530529-78163a4f7af2?auto=format&fit=crop&q=80&w=800',
    'Hyderabad': 'https://images.unsplash.com/photo-1572431441527-03266d627ec3?auto=format&fit=crop&q=80&w=800',
    'Kochi': 'https://images.unsplash.com/photo-1593504049359-74330189a355?auto=format&fit=crop&q=80&w=800',
    'Mysuru': 'https://images.unsplash.com/photo-1600100397608-f0109968edf9?auto=format&fit=crop&q=80&w=800',
    'Madurai': 'https://images.unsplash.com/photo-1580913956667-6284d7286377?auto=format&fit=crop&q=80&w=800',
};

export function BrowseGuides({ user, onNavigate, onLogout, onViewProfile, initialCity, initialBrowseMode }: BrowseGuidesProps) {
    const [view, setView] = useState<'guides' | 'cities'>(initialBrowseMode || 'guides');
    const [searchQuery, setSearchQuery] = useState(initialCity || "");
    const [guides, setGuides] = useState<any[]>([]);
    const [totalGuides, setTotalGuides] = useState<any[]>([]); // For city counts
    const [loading, setLoading] = useState(true);
    const [availableCities, setAvailableCities] = useState<string[]>([]);

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
            } catch (error) {
                console.error("Failed to fetch guides", error);
            } finally {
                setLoading(false);
            }
        };

        const timeoutId = setTimeout(fetchData, 300);
        return () => clearTimeout(timeoutId);
    }, [searchQuery]);

    const handleCityClick = (city: string) => {
        setSearchQuery(city);
        setView('guides');
    };

    return (
        <div className="min-h-screen bg-gray-50">
            <RoleAwareHeader
                user={user}
                currentPage="browse"
                onNavigate={onNavigate}
                onLogout={onLogout}
            />

            <main className="container mx-auto px-4 py-8">
                <div className="flex flex-col gap-8">
                    {/* Header & Search */}
                    <div className="flex flex-col md:flex-row justify-between items-center gap-6">
                        <div className="text-center md:text-left">
                            <h1 className="text-3xl font-bold text-gray-900 font-heading">
                                {view === 'cities' ? 'Exotic Destinations' : 'Find Your Local Guide'}
                            </h1>
                            <p className="text-gray-500 mt-1">
                                {view === 'cities' ? 'Discover the best cities in South India with expert local guides.' : 'Discover experienced locals to show you around South India.'}
                            </p>
                        </div>

                        <div className="flex items-center gap-4 w-full md:w-auto">
                            <div className="flex bg-white p-1 rounded-xl shadow-sm border border-gray-100 h-12">
                                <button
                                    onClick={() => setView('guides')}
                                    className={`px-6 py-2 rounded-lg text-sm font-bold transition-all ${view === 'guides' ? 'bg-primary text-white shadow-md' : 'text-gray-500 hover:bg-gray-50'}`}
                                >
                                    Guides
                                </button>
                                <button
                                    onClick={() => setView('cities')}
                                    className={`px-6 py-2 rounded-lg text-sm font-bold transition-all ${view === 'cities' ? 'bg-primary text-white shadow-md' : 'text-gray-500 hover:bg-gray-50'}`}
                                >
                                    Cities
                                </button>
                            </div>

                            <div className="relative flex-1 md:w-[350px] group">
                                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5 z-10" />
                                <input
                                    type="text"
                                    placeholder="Search..."
                                    className="w-full pl-12 pr-4 py-3 bg-white border border-gray-200 rounded-2xl focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all shadow-sm relative z-10 text-gray-900"
                                    value={searchQuery}
                                    onChange={(e) => {
                                        setSearchQuery(e.target.value);
                                        if (view === 'cities') setView('guides');
                                    }}
                                />
                            </div>
                        </div>
                    </div>

                    {view === 'cities' ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                            {availableCities.map(city => (
                                <div
                                    key={city}
                                    onClick={() => handleCityClick(city)}
                                    className="group relative h-80 rounded-3xl overflow-hidden cursor-pointer shadow-lg hover:shadow-2xl transition-all duration-500 hover:-translate-y-2"
                                >
                                    <img
                                        src={cityImages[city] || `https://images.unsplash.com/photo-1548013146-72479768bada?auto=format&fit=crop&q=80&w=800`}
                                        alt={city}
                                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                                    <div className="absolute bottom-6 left-6 right-6">
                                        <h3 className="text-2xl font-bold text-white mb-1">{city}</h3>
                                        <p className="text-gray-200 text-sm font-medium flex items-center gap-2">
                                            View {totalGuides.filter(g => g.location.includes(city)).length || 'Local'} Guides
                                            <ArrowRight className="w-4 h-4 group-hover:translate-x-2 transition-transform" />
                                        </p>
                                    </div>
                                    <div className="absolute top-6 right-6">
                                        <div className="bg-white/20 backdrop-blur-md px-3 py-1 rounded-full text-white text-xs font-bold border border-white/30">
                                            Popular
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <>
                            {/* Quick City Filters */}
                            {!searchQuery && availableCities.length > 0 && (
                                <div className="space-y-4 animate-in fade-in slide-in-from-top-4 duration-500">
                                    <h2 className="text-sm font-bold text-gray-400 uppercase tracking-widest px-1">Popular Cities</h2>
                                    <div className="flex flex-wrap gap-2">
                                        {availableCities.slice(0, 10).map(city => (
                                            <button
                                                key={city}
                                                onClick={() => setSearchQuery(city)}
                                                className="px-4 py-2 bg-white border border-gray-100 rounded-xl text-sm font-semibold text-gray-700 hover:border-primary hover:text-primary hover:shadow-md transition-all active:scale-95"
                                            >
                                                {city}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Results Grid */}
                            <div className="space-y-6">
                                <div className="flex items-center justify-between px-1">
                                    <h2 className="text-xl font-bold text-gray-900 font-heading">
                                        {searchQuery ? `Guides in "${searchQuery}"` : "All Available Guides"}
                                    </h2>
                                    <span className="text-sm text-gray-500 font-medium">{guides.length} matches found</span>
                                </div>

                                {loading ? (
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                        {[1, 2, 3, 4, 5, 6].map((i) => (
                                            <div key={i} className="h-[420px] bg-white border border-gray-100 rounded-2xl animate-pulse shadow-sm"></div>
                                        ))}
                                    </div>
                                ) : (
                                    <>
                                        {guides.length > 0 ? (
                                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                                {guides.map(guide => (
                                                    <GuideCard
                                                        key={guide.id}
                                                        guide={guide}
                                                        user={user}
                                                        onViewProfile={onViewProfile}
                                                    />
                                                ))}
                                            </div>
                                        ) : (
                                            <div className="py-20 text-center bg-white border border-dashed border-gray-200 rounded-3xl">
                                                <div className="inline-flex items-center justify-center w-20 h-20 bg-gray-50 rounded-full mb-6">
                                                    <Search className="w-10 h-10 text-gray-300" />
                                                </div>
                                                <h3 className="text-xl font-bold text-gray-900 mb-2">No guides found in this area</h3>
                                                <p className="text-gray-500 max-w-xs mx-auto mb-8">Try searching for a different city or clearing your filters to see everyone.</p>
                                                <Button
                                                    onClick={() => setSearchQuery("")}
                                                    className="rounded-xl px-8 h-12 font-bold"
                                                >
                                                    View All Guides
                                                </Button>
                                            </div>
                                        )}
                                    </>
                                )}
                            </div>
                        </>
                    )}
                </div>
            </main>
        </div>
    );
}
