import { useState, useEffect } from "react";
import { type LocalUser } from "@/lib/localStorage";
import { RoleAwareHeader } from "./RoleAwareHeader";
import { GuideCard } from "./GuideCard";
import { api } from "@/lib/api";
import { type Guide } from "@/types";
import { Button } from "./ui/button";
import { Heart, ArrowLeft } from "lucide-react";

interface SavedGuidesProps {
    user: LocalUser;
    onNavigate: (page: string) => void;
    onLogout: () => void;
    onViewProfile: (guideId: string) => void;
}

export function SavedGuides({ user, onNavigate, onLogout, onViewProfile }: SavedGuidesProps) {
    const [guides, setGuides] = useState<Guide[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchFavorites = async () => {
            setLoading(true);
            try {
                let favoriteIds: string[] = [];

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
            } catch (error) {
                console.error("Failed to fetch favorites", error);
            } finally {
                setLoading(false);
            }
        };

        fetchFavorites();
    }, [user]);

    return (
        <div className="min-h-screen bg-gray-50">
            <RoleAwareHeader
                user={user}
                currentPage="saved"
                onNavigate={onNavigate}
                onLogout={onLogout}
            />

            <div className="bg-white border-b border-gray-200 sticky top-0 z-20 px-4 py-3 md:px-8 shadow-sm">
                <div className="container mx-auto flex items-center justify-between">
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onNavigate('home')}
                        className="text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                    >
                        <ArrowLeft className="w-5 h-5 mr-1" />
                        Back to Home
                    </Button>
                    <span className="font-bold text-gray-900">Saved Guides</span>
                </div>
            </div>

            <main className="container mx-auto px-4 py-8">
                <div className="mb-8 flex items-center gap-3">
                    <div className="w-12 h-12 bg-red-50 rounded-full flex items-center justify-center">
                        <Heart className="w-6 h-6 text-red-500 fill-red-500" />
                    </div>
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">Saved Guides</h1>
                        <p className="text-gray-500">Your shortlist of favorite local experts</p>
                    </div>
                </div>

                {loading ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {[1, 2, 3, 4].map((i) => (
                            <div key={i} className="h-[400px] bg-gray-200 animate-pulse rounded-2xl"></div>
                        ))}
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
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
                                <p className="mb-4 text-lg">You haven't saved any guides yet.</p>
                                <Button onClick={() => onNavigate('browseGuides')}>
                                    Browse Guides
                                </Button>
                            </div>
                        )}
                    </div>
                )}
            </main>
        </div>
    );
}
