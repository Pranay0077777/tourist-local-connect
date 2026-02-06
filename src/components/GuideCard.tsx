// ... (imports remain)
import { MapPin, Star, Heart, Award, Globe } from "lucide-react";
import { type Guide } from "@/types";
import { type LocalUser } from "@/lib/localStorage";
import { useState, useEffect } from "react";
import { api } from "@/lib/api";
import { toast } from "sonner";

interface GuideCardProps {
    guide: Guide;
    user?: LocalUser | null;
    isFavorite?: boolean;
    onToggleFavorite?: (guideId: string, newStatus: boolean) => void;
    onViewProfile: (guideId: string) => void;
}

export function GuideCard({ guide, user, onViewProfile, isFavorite: initialFavorite, onToggleFavorite }: GuideCardProps) {
    const [isFavorite, setIsFavorite] = useState(initialFavorite || false);
    const [imageLoaded, setImageLoaded] = useState(false);

    useEffect(() => {
        setIsFavorite(initialFavorite || false);
    }, [initialFavorite]);

    const toggleFavorite = async (e: React.MouseEvent) => {
        e.stopPropagation();

        if (user) {
            // API
            const newStatus = !isFavorite;
            setIsFavorite(newStatus); // Optimistic

            try {
                if (newStatus) {
                    await api.addFavorite(user.id, guide.id);
                    toast.success("Added to favorites");
                } else {
                    await api.removeFavorite(user.id, guide.id);
                    toast.success("Removed from favorites");
                }
                if (onToggleFavorite) onToggleFavorite(guide.id, newStatus);
            } catch (err) {
                console.error("Failed to toggle favorite", err);
                setIsFavorite(!newStatus); // Revert
                toast.error("Failed to update favorite");
            }
        } else {
            toast.error("Please log in to save favorites");
        }
    };

    return (
        <div
            onClick={() => onViewProfile(guide.id)}
            className="group relative bg-card rounded-xl shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-200 overflow-hidden cursor-pointer border border-border/50 flex flex-col h-full"
        >
            <div className="relative aspect-[4/3] overflow-hidden bg-muted">
                <img
                    src={api.getAssetUrl(guide.avatar.includes('w=') ? guide.avatar.replace(/w=\d+/, 'w=400').replace(/h=\d+/, 'h=300') : guide.avatar)}
                    alt={guide.name}
                    className={`w-full h-full object-cover transform group-hover:scale-105 transition-all duration-700 ${imageLoaded ? 'opacity-100' : 'opacity-0'}`}
                    onLoad={() => setImageLoaded(true)}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-60 group-hover:opacity-80 transition-opacity duration-200" />

                <button
                    className="absolute top-3 right-3 p-2 rounded-full bg-white/90 backdrop-blur-sm hover:bg-white shadow-md transition-all duration-200 z-10 active:scale-95"
                    onClick={toggleFavorite}
                >
                    <Heart className={`w-5 h-5 transition-colors duration-200 ${isFavorite ? 'fill-red-500 text-red-500' : 'text-gray-400'}`} />
                </button>

                {guide.verified && (
                    <div className="absolute top-3 left-3 px-3 py-1 bg-blue-600/90 backdrop-blur-sm text-white text-[10px] font-bold tracking-wider rounded-full shadow-lg flex items-center gap-1">
                        <Award className="w-3 h-3" />
                        VERIFIED
                    </div>
                )}
            </div>

            <div className="p-5 flex flex-col flex-1 bg-card">
                <div className="flex justify-between items-start mb-2">
                    <div>
                        <h3 className="text-lg font-bold text-foreground group-hover:text-primary transition-colors font-heading">
                            {guide.name}
                        </h3>
                        <div className="flex items-center text-muted-foreground text-sm mt-1">
                            <MapPin className="w-3 h-3 mr-1" />
                            {guide.location}
                        </div>
                    </div>
                    <div className="flex flex-col items-end">
                        <div className="flex items-center bg-secondary px-2 py-1 rounded-lg border border-border/50">
                            <Star className="w-3.5 h-3.5 text-accent fill-accent mr-1" />
                            <span className="font-bold text-foreground text-sm">{guide.rating}</span>
                            <span className="text-muted-foreground text-xs ml-1">({guide.reviewCount})</span>
                        </div>
                    </div>
                </div>

                <p className="text-muted-foreground text-sm line-clamp-2 mb-4 flex-1">
                    {guide.bio}
                </p>

                <div className="space-y-3 mt-auto">
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <Globe className="w-3.5 h-3.5" />
                        <span className="truncate">
                            Takes tours in: {
                                (Array.isArray(guide.languages)
                                    ? guide.languages
                                    : typeof guide.languages === 'string'
                                        ? JSON.parse(guide.languages || '[]')
                                        : []).join(", ")
                            }
                        </span>
                    </div>

                    <div className="pt-3 border-t border-border/50 flex items-center justify-between">
                        <div>
                            <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider block mb-0.5">Rate</span>
                            <span className="text-primary font-bold">₹{guide.hourlyRate}/hr</span>
                        </div>
                        <div className="text-right">
                            <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider block mb-0.5">Experience</span>
                            <span className="text-foreground font-medium flex items-center gap-1 justify-end">
                                <Award className="w-3 h-3 text-accent" />
                                {guide.experience || '2+ years'}
                            </span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default GuideCard;
