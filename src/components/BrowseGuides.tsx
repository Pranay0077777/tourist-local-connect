import { useState, useEffect } from "react";
import { RoleAwareHeader } from "./RoleAwareHeader";
import { GuideCard } from "./GuideCard";
import { mockGuides } from "../data/mockData";
import { type LocalUser } from "@/lib/localStorage";
import { Search } from "lucide-react";
import { Button } from "./ui/button";
import { api } from "@/lib/api";

interface BrowseGuidesProps {
    user: LocalUser;
    onNavigate: (page: string) => void;
    onLogout: () => void;
    onViewProfile: (guideId: string) => void;
    initialCity?: string;
}

export function BrowseGuides({ user, onNavigate, onLogout, onViewProfile, initialCity }: BrowseGuidesProps) {
    const [searchQuery, setSearchQuery] = useState("");
    const [guides, setGuides] = useState<typeof mockGuides>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                // Fetch all guides initially, filtering happens via search
                const results = await api.fetchGuides({
                    query: searchQuery,
                    city: initialCity
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
    }, [searchQuery, initialCity]);

    return (
        <div className="min-h-screen bg-gray-50">
            <RoleAwareHeader
                user={user}
                currentPage="browse"
                onNavigate={onNavigate}
                onLogout={onLogout}
            />

            <main className="container mx-auto px-4 py-8">
                <div className="flex flex-col gap-6">
                    {/* Simplified Header & Search */}
                    <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900">Find a Local Guide</h1>
                            <p className="text-gray-500 text-sm">Discover experienced locals to show you around.</p>
                        </div>
                        <div className="relative w-full md:w-96">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                            <input
                                type="text"
                                placeholder="Search guides by name or location..."
                                className="w-full pl-12 pr-4 py-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all shadow-sm"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>
                    </div>

                    {/* Results Grid */}
                    {loading ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {[1, 2, 3, 4, 5, 6].map((i) => (
                                <div key={i} className="h-[400px] bg-gray-200 animate-pulse rounded-2xl"></div>
                            ))}
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {guides.length > 0 ? (
                                guides.map(guide => (
                                    <GuideCard
                                        key={guide.id}
                                        guide={guide}
                                        user={user}
                                        onViewProfile={onViewProfile}
                                    />
                                ))
                            ) : (
                                <div className="col-span-full py-16 text-center text-gray-500">
                                    <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 rounded-full mb-4">
                                        <Search className="w-8 h-8 text-gray-400" />
                                    </div>
                                    <h3 className="text-lg font-semibold text-gray-900">No guides found</h3>
                                    <p className="max-w-xs mx-auto mt-2">Try adjusting your search terms.</p>
                                    <Button
                                        variant="outline"
                                        onClick={() => setSearchQuery("")}
                                        className="mt-4"
                                    >
                                        Clear Search
                                    </Button>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
}
