import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "./ui/dialog";
import { Button } from "./ui/button";
import { Label } from "./ui/label";
import { Textarea } from "./ui/textarea";
import { Star, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { api } from "@/lib/api";

interface ReviewModalProps {
    isOpen: boolean;
    onClose: () => void;
    guideId: string;
    guideName: string;
    userName: string;
    tourType: string;
    onSuccess: () => void;
}

export function ReviewModal({ isOpen, onClose, guideId, guideName, userName, tourType, onSuccess }: ReviewModalProps) {
    const [rating, setRating] = useState(5);
    const [comment, setComment] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [hoveredRating, setHoveredRating] = useState(0);

    const handleSubmit = async () => {
        if (!comment.trim()) {
            toast.error("Please write a short review");
            return;
        }

        setIsLoading(true);
        try {
            await api.addReview({
                guideId,
                userName,
                userAvatar: "https://github.com/shadcn.png", // Default avatar
                rating,
                comment,
                tourType
            });
            toast.success("Review submitted! Thank you.");
            onSuccess();
            onClose();
        } catch (error) {
            toast.error("Failed to submit review");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle className="text-2xl font-bold font-heading">Rate your experience</DialogTitle>
                </DialogHeader>
                <div className="py-6 space-y-6">
                    <div className="text-center">
                        <p className="text-gray-500 mb-4">How was your trip with <span className="text-primary font-bold">{guideName}</span>?</p>
                        <div className="flex justify-center gap-2">
                            {[1, 2, 3, 4, 5].map((star) => (
                                <button
                                    key={star}
                                    type="button"
                                    onClick={() => setRating(star)}
                                    onMouseEnter={() => setHoveredRating(star)}
                                    onMouseLeave={() => setHoveredRating(0)}
                                    className="p-1 focus:outline-none transition-transform hover:scale-110"
                                >
                                    <Star
                                        className={`w-10 h-10 ${(hoveredRating || rating) >= star
                                            ? "fill-yellow-400 text-yellow-400"
                                            : "text-gray-300"
                                            }`}
                                    />
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="review" className="font-bold">Your Review</Label>
                        <Textarea
                            id="review"
                            placeholder="Tell us about the best parts of your tour..."
                            className="h-32 rounded-xl resize-none"
                            value={comment}
                            onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setComment(e.target.value)}
                        />
                    </div>
                </div>
                <DialogFooter className="sm:justify-between gap-4">
                    <Button variant="ghost" onClick={onClose} className="rounded-xl">Cancel</Button>
                    <Button
                        onClick={handleSubmit}
                        disabled={isLoading}
                        className="bg-accent hover:bg-accent/90 text-white font-bold h-12 px-8 rounded-xl min-w-[140px]"
                    >
                        {isLoading ? (
                            <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Submitting...</>
                        ) : (
                            "Submit Review"
                        )}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
