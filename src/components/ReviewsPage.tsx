import { useState, useEffect } from "react";
import { type LocalUser } from "@/lib/localStorage";
import { api } from "@/lib/api";
import { RoleAwareHeader } from "./RoleAwareHeader";
import { Button } from "./ui/button";
import { Card, CardContent } from "./ui/card";
import { ArrowLeft, Star, Quote } from "lucide-react";

interface ReviewsPageProps {
    user: LocalUser;
    onNavigate: (page: string) => void;
    onLogout: () => void;
}

export function ReviewsPage({ user, onNavigate, onLogout }: ReviewsPageProps) {
    const [reviews, setReviews] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchReviews = async () => {
            try {
                const data = await api.getReviewsForGuide(user.id);
                setReviews(data);
            } catch (error) {
                console.error("Failed to fetch reviews", error);
            } finally {
                setLoading(false);
            }
        };
        fetchReviews();
    }, [user.id]);

    return (
        <div className="min-h-screen bg-gray-50/50">
            <RoleAwareHeader
                user={user}
                currentPage="home"
                onNavigate={onNavigate}
                onLogout={onLogout}
            />

            <main className="container mx-auto px-4 py-8 max-w-4xl">
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onNavigate('home')}
                    className="mb-6 text-gray-600 hover:text-gray-900"
                >
                    <ArrowLeft className="w-4 h-4 mr-1" /> Back to Dashboard
                </Button>

                <div className="mb-8 flex items-end justify-between">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Tourist Reviews</h1>
                        <p className="text-gray-500 mt-2">Feedback from travelers you have guided.</p>
                    </div>
                    <div className="bg-white px-4 py-2 rounded-lg border border-gray-200 shadow-sm text-sm font-medium text-gray-700">
                        Total Reviews: <span className="text-primary font-bold">{reviews.length}</span>
                    </div>
                </div>

                {loading ? (
                    <div className="flex justify-center items-center py-20">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                    </div>
                ) : reviews.length === 0 ? (
                    <div className="text-center py-20 bg-white border border-dashed border-gray-200 rounded-3xl">
                        <Star className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                        <h3 className="text-xl font-bold text-gray-900 mb-2">No reviews yet</h3>
                        <p className="text-gray-500 max-w-sm mx-auto">You haven't received any reviews yet. Complete more tours to build your reputation!</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 gap-6">
                        {reviews.map((review) => (
                            <Card key={review.id} className="border-none shadow-sm hover:shadow-md transition-shadow bg-white overflow-hidden">
                                <CardContent className="p-6">
                                    <div className="flex flex-col md:flex-row gap-6">
                                        {/* Author Info */}
                                        <div className="md:w-48 flex-shrink-0 flex flex-row md:flex-col items-center md:items-start gap-4 md:gap-2">
                                            <div className="w-12 h-12 rounded-full overflow-hidden bg-indigo-50 flex items-center justify-center text-indigo-700 font-bold text-lg border border-gray-100">
                                                {review.userAvatar ? (
                                                    <img src={api.getAssetUrl(review.userAvatar)} alt={review.userName} className="w-full h-full object-cover" />
                                                ) : (
                                                    review.userName?.[0] || '?'
                                                )}
                                            </div>
                                            <div>
                                                <h3 className="font-bold text-gray-900">{review.userName || 'Anonymous'}</h3>
                                                <p className="text-xs text-gray-500">{new Date(review.date).toLocaleDateString()}</p>
                                            </div>
                                        </div>

                                        {/* Content */}
                                        <div className="flex-1 space-y-3">
                                            <div className="flex justify-between items-start">
                                                <div className="flex text-yellow-400 gap-0.5">
                                                    {Array.from({ length: 5 }).map((_, i) => (
                                                        <Star
                                                            key={i}
                                                            className={`w-4 h-4 ${i < review.rating ? 'fill-current' : 'text-gray-200'}`}
                                                        />
                                                    ))}
                                                </div>
                                                <span className="text-xs font-medium text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                                                    {review.tourType || 'Standard Tour'}
                                                </span>
                                            </div>

                                            <div className="relative">
                                                <Quote className="absolute -left-2 -top-2 w-6 h-6 text-gray-200 -z-10 opacity-50" />
                                                <p className="text-gray-700 leading-relaxed">
                                                    {review.comment}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                )}
            </main>
        </div>
    );
}
