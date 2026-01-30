import { useState, useEffect } from "react";
import { Button } from "./ui/button";
import { Card, CardContent } from "./ui/card";
import { BookingModal } from "./BookingModal";
import { type LocalUser } from "@/lib/localStorage";
import { type Guide, type Review } from "@/types";
import { api } from "@/lib/api";
import { socket } from "@/lib/socket";
import { toast } from "sonner";
import {
    MapPin,
    Star,
    Languages,
    ChevronLeft,
    Footprints,
    Lock,
    Play,
    MessageSquare,
    ShieldCheck,
    Coffee,
    Utensils,
    ShoppingBag,
    Image as ImageIcon
} from "lucide-react";

interface GuideProfileProps {
    guideId: string;
    onBack: () => void;
    currentUser: LocalUser;
    onNavigate: (page: string, params?: any) => void;
}

export function GuideProfile({ guideId, onBack, currentUser, onNavigate }: GuideProfileProps) {
    const [guide, setGuide] = useState<Guide | null>(null);
    const [loading, setLoading] = useState(true);
    const [isBookingOpen, setIsBookingOpen] = useState(false);

    const [reviews, setReviews] = useState<Review[]>([]);

    const [cityPhotos, setCityPhotos] = useState<any[]>([]);

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
                    const photosRes = await fetch(`/api/community/posts?city=${cityName}`);
                    const photosData = await photosRes.json();

                    // Filter for posts that actually have images
                    setCityPhotos(photosData.filter((p: any) => p.image));
                }
            } catch (error) {
                toast.error("Failed to load guide profile");
            } finally {
                setLoading(false);
            }
        };
        fetchDetails();
    }, [guideId]);

    const iconMap: Record<string, React.ElementType> = {
        "map-pin": MapPin,
        "coffee": Coffee,
        "utensils": Utensils,
        "shopping-bag": ShoppingBag,
        "footprints": Footprints,
        "sunset": Star, // Fallback or specific
        "mask": ShieldCheck // Fallback
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 pb-24 md:pb-12 animate-pulse">
                {/* Header Skeleton */}
                <div className="bg-white border-b border-gray-200 px-4 py-3 md:px-8 h-16 w-full" />

                <main className="container mx-auto px-4 py-8">
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                        {/* Sidebar Skeleton */}
                        <div className="lg:col-span-4 xl:col-span-3 space-y-6">
                            <div className="aspect-[3/4] w-full bg-gray-200 rounded-xl" />
                            <div className="h-40 bg-white rounded-xl" />
                        </div>

                        {/* Main Content Skeleton */}
                        <div className="lg:col-span-8 xl:col-span-9 space-y-8">
                            <div className="bg-white p-6 md:p-8 rounded-2xl h-48 bg-gray-200" />
                            <div className="bg-white p-6 md:p-8 rounded-2xl h-64 bg-gray-200" />
                        </div>
                    </div>
                </main>
            </div>
        );
    }

    if (!guide) return <div>Guide not found</div>;

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



    return (
        <div className="min-h-screen bg-gray-50 pb-24 md:pb-12">
            {/* Navigation Header */}
            <div className="bg-white border-b border-gray-200 sticky top-0 z-20 px-4 py-3 md:px-8 shadow-sm">
                <div className="container mx-auto flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={onBack}
                            className="text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                        >
                            <ChevronLeft className="w-5 h-5 mr-1" />
                            Back
                        </Button>
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => onNavigate('app')}
                            className="text-gray-600 hover:text-gray-900 hover:bg-gray-100 hidden md:flex"
                        >
                            Home
                        </Button>
                    </div>
                    <span className="font-bold text-gray-900 md:hidden">{guide.name}</span>
                </div>
            </div>

            <main className="container mx-auto px-4 py-8">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

                    {/* LEFT COLUMN: Profile Sidebar (Image, Quick Stats, Booking) */}
                    <div className="lg:col-span-4 xl:col-span-3 space-y-6">
                        <Card className="overflow-hidden border-none shadow-lg">
                            <div className="aspect-[3/4] w-full relative group">
                                <img
                                    src={guide.avatar}
                                    alt={guide.name}
                                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                                />
                                {guide.verified && (
                                    <div className="absolute top-4 left-4">
                                        <span className="px-3 py-1 bg-white/90 backdrop-blur text-gray-900 text-xs font-bold uppercase tracking-wider rounded-lg shadow-sm">
                                            Verified
                                        </span>
                                    </div>
                                )}
                            </div>
                            <CardContent className="p-6 space-y-6 bg-white">
                                <div className="text-center space-y-1">
                                    <div className="flex items-center justify-center gap-1.5 text-yellow-500 font-bold text-xl">
                                        <Star className="w-5 h-5 fill-current" />
                                        {guide.rating}
                                        <span className="text-gray-400 text-sm font-normal">({guide.reviewCount} reviews)</span>
                                    </div>
                                    <p className="text-gray-500 text-sm">Response time: {guide.responseTime}</p>
                                    {guide.experience && (
                                        <p className="text-gray-500 text-sm">Experience: {guide.experience}</p>
                                    )}
                                </div>

                                <div className="space-y-4 pt-4 border-t border-gray-100">
                                    <div className="flex justify-between items-baseline px-2">
                                        <span className="text-gray-500">Rate</span>
                                        <span className="text-3xl font-bold text-primary">₹{guide.hourlyRate}<span className="text-base font-normal text-gray-400">/hr</span></span>
                                    </div>
                                    <div className="grid grid-cols-2 gap-3">
                                        <Button
                                            size="lg"
                                            variant="outline"
                                            className="w-full font-bold text-lg border-2"
                                            onClick={handleMessage}
                                        >
                                            <MessageSquare className="w-5 h-5 mr-2" />
                                            Chat
                                        </Button>
                                        <Button
                                            size="lg"
                                            className="w-full bg-accent hover:bg-accent/90 text-white font-bold text-lg shadow-lg shadow-accent/20"
                                            onClick={() => setIsBookingOpen(true)}
                                        >
                                            Book Now
                                        </Button>
                                    </div>
                                    <p className="text-xs text-center text-gray-400">No payment required today</p>

                                    {/* Audio Intro Feature */}
                                    <div className="mt-4 pt-4 border-t border-gray-100">
                                        <div className="flex items-center gap-2 text-xs font-bold text-gray-500 mb-2">
                                            <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                                                <Play className="w-3 h-3 fill-current" />
                                            </div>
                                            Hear my Intro
                                        </div>
                                        {/* Fake Waveform */}
                                        <div className="flex items-center gap-0.5 h-6">
                                            {[...Array(20)].map((_, i) => (
                                                <div
                                                    key={i}
                                                    className="w-1 bg-primary/40 rounded-full animate-pulse"
                                                    style={{
                                                        height: `${Math.random() * 100}% `,
                                                        animationDelay: `${i * 0.05} s`
                                                    }}
                                                />
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {guide.verified && (
                            <div className="hidden lg:grid grid-cols-1 gap-4">
                                <div className="flex items-center gap-3 p-4 bg-white rounded-xl border border-gray-100 shadow-sm">
                                    <div className="p-2 bg-green-50 rounded-full text-green-600">
                                        <ShieldCheck className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <p className="font-bold text-sm text-gray-900">Identity Verified</p>
                                        <p className="text-xs text-gray-500">Government ID Check</p>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* RIGHT COLUMN: Content (Bio, Details, Reviews) */}
                    <div className="lg:col-span-8 xl:col-span-9 space-y-8">

                        {/* Header Info */}
                        <div className="bg-white p-6 md:p-8 rounded-2xl shadow-sm border border-gray-100 space-y-4">
                            <div>
                                <h1 className="text-3xl md:text-4xl font-heading font-bold text-gray-900 mb-2">{guide.name}</h1>
                                <div className="flex flex-wrap gap-4 text-gray-600">
                                    <span className="flex items-center gap-1.5 bg-gray-50 px-3 py-1.5 rounded-lg border border-gray-100">
                                        <MapPin className="w-4 h-4 text-primary" /> {guide.location}
                                    </span>
                                    <span className="flex items-center gap-1.5 bg-gray-50 px-3 py-1.5 rounded-lg border border-gray-100">
                                        <Languages className="w-4 h-4 text-primary" /> {guide.languages.join(", ")}
                                    </span>
                                </div>
                            </div>

                            <div className="pt-4 border-t border-gray-100">
                                <h3 className="font-bold text-sm text-gray-900 mb-3 uppercase tracking-wide">Expertise</h3>
                                <div className="flex flex-wrap gap-2">
                                    {guide.specialties.map(tag => (
                                        <span key={tag} className="px-4 py-2 bg-secondary/50 text-secondary-foreground rounded-lg font-medium hover:bg-secondary transition-colors cursor-default">
                                            {tag}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Bio Section */}
                        <div className="bg-white p-6 md:p-8 rounded-2xl shadow-sm border border-gray-100">
                            <h3 className="font-bold text-gray-900 mb-2">About Me</h3>
                            <p className="text-gray-600 leading-relaxed mb-6">
                                {guide.bio}
                            </p>

                            {guide.itinerary && (
                                <div className="mb-8">
                                    <h3 className="font-bold text-gray-900 mb-4 text-lg">A Day with Me</h3>
                                    <div className="space-y-0 pl-2">
                                        {guide.itinerary.map((item, index) => {
                                            const IconComponent = iconMap[item.icon] || MapPin;
                                            return (
                                                <div key={index} className="flex gap-4 relative pb-6 last:pb-0">
                                                    {index !== guide.itinerary!.length - 1 && (
                                                        <div className="absolute left-[11px] top-6 bottom-0 w-0.5 bg-gray-200" />
                                                    )}
                                                    <div className="relative z-10 w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center shrink-0 border border-primary/20">
                                                        <IconComponent className="w-3 h-3 text-primary" />
                                                    </div>
                                                    <div>
                                                        <p className="text-xs font-bold text-primary uppercase tracking-wider mb-0.5">{item.time}</p>
                                                        <p className="text-gray-800 font-medium">{item.activity}</p>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            )}

                            {/* Hidden Gems (Locked Content) */}
                            {guide.hiddenGems && (
                                <div className="mb-8">
                                    <div className="flex items-center gap-2 mb-4">
                                        <h3 className="font-bold text-gray-900 text-lg">My Secret Spots</h3>
                                        <span className="px-2 py-0.5 bg-yellow-100 text-yellow-700 text-[10px] font-bold uppercase tracking-wider rounded-full">
                                            Exclusive
                                        </span>
                                    </div>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        {guide.hiddenGems.map((gem, index) => (
                                            <div key={index} className="group relative rounded-xl overflow-hidden h-40 border border-gray-100 shadow-sm cursor-pointer">
                                                {/* Blurred Image */}
                                                <img src={gem.image} className="w-full h-full object-cover blur-sm scale-110 group-hover:scale-100 transition-all duration-700" alt="Secret" />

                                                {/* Lock Overlay */}
                                                <div className="absolute inset-0 bg-black/40 flex flex-col items-center justify-center text-white p-4 text-center">
                                                    <Lock className="w-6 h-6 mb-2 text-white/80" />
                                                    <p className="font-bold text-sm">Book to Unlock</p>
                                                    <p className="text-xs text-white/70 mt-1">{gem.description}</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>


                        {/* City Vibes Gallery */}
                        {cityPhotos.length > 0 && (
                            <div className="bg-white p-6 md:p-8 rounded-2xl shadow-sm border border-gray-100">
                                <div className="flex items-center gap-2 mb-6">
                                    <ImageIcon className="w-6 h-6 text-indigo-600" />
                                    <h2 className="text-2xl font-bold font-heading text-gray-900">
                                        {guide.location.split(',')[0]} Vibes
                                    </h2>
                                </div>
                                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                    {cityPhotos.slice(0, 6).map((photo: any) => (
                                        <div key={photo.id} className="relative group overflow-hidden rounded-xl aspect-square">
                                            <img
                                                src={photo.image}
                                                alt={photo.city}
                                                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                                            />
                                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-3">
                                                <p className="text-white text-xs font-medium truncate">
                                                    by {photo.user_name}
                                                </p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                                <p className="text-sm text-gray-500 mt-4 text-center">
                                    Photos from our travel community
                                </p>
                            </div>
                        )}

                        {/* Reviews Section */}
                        <div className="bg-white p-6 md:p-8 rounded-2xl shadow-sm border border-gray-100">
                            <div className="flex items-center gap-3 mb-6">
                                <h2 className="text-2xl font-bold font-heading text-primary">Guest Reviews</h2>
                                <span className="bg-gray-100 text-gray-600 px-2 py-1 rounded-full text-sm font-bold">{reviews.length}</span>
                            </div>

                            <div className="grid gap-6">
                                {reviews.map(review => (
                                    <div key={review.id} className="pb-6 border-b border-gray-100 last:border-0 last:pb-0">
                                        <div className="flex items-start gap-4">
                                            <img src={review.userAvatar} alt={review.userName} className="w-12 h-12 rounded-full object-cover border border-gray-200" />
                                            <div className="flex-1">
                                                <div className="flex justify-between items-start mb-1">
                                                    <h4 className="font-bold text-gray-900">{review.userName}</h4>
                                                    <span className="text-xs text-gray-400">{review.date}</span>
                                                </div>
                                                <div className="flex items-center gap-2 mb-2">
                                                    <div className="flex text-yellow-400">
                                                        {[...Array(5)].map((_, i) => (
                                                            <Star key={i} className={`w - 3.5 h - 3.5 ${i < review.rating ? 'fill-current' : 'text-gray-200'} `} />
                                                        ))}
                                                    </div>
                                                    <span className="text-xs text-gray-500 font-medium px-2 py-0.5 bg-gray-50 rounded">{review.tourType}</span>
                                                </div>
                                                <p className="text-gray-600 leading-relaxed">{review.comment}</p>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                    </div>
                </div>
            </main>

            {/* Mobile Sticky Booking Bar */}
            <div className="fixed bottom-0 left-0 w-full bg-white border-t border-gray-200 p-4 z-30 lg:hidden flex items-center justify-between shadow-[0_-5px_20px_rgba(0,0,0,0.1)]">
                <div>
                    <p className="text-xs text-gray-500 font-medium">Starting from</p>
                    <p className="text-2xl font-bold text-primary">₹{guide.hourlyRate}<span className="text-sm text-gray-400 font-normal">/hr</span></p>
                </div>
                <Button
                    size="lg"
                    className="bg-accent hover:bg-accent/90 text-white font-bold px-8 rounded-xl shadow-lg shadow-accent/20"
                    onClick={() => setIsBookingOpen(true)}
                >
                    Book Now
                </Button>
            </div>

            <BookingModal
                guideId={guide.id}
                guideName={guide.name}
                ratePerPerson={guide.hourlyRate}
                isOpen={isBookingOpen}
                onClose={() => setIsBookingOpen(false)}
                currentUser={currentUser}
            />
        </div>
    );
}
