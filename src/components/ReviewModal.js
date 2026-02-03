import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "./ui/dialog";
import { Button } from "./ui/button";
import { Label } from "./ui/label";
import { Textarea } from "./ui/textarea";
import { Star, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { api } from "@/lib/api";
export function ReviewModal({ isOpen, onClose, guideId, guideName, userName, tourType, onSuccess }) {
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
        }
        catch (error) {
            toast.error("Failed to submit review");
        }
        finally {
            setIsLoading(false);
        }
    };
    return (_jsx(Dialog, { open: isOpen, onOpenChange: onClose, children: _jsxs(DialogContent, { className: "sm:max-w-[425px]", children: [_jsx(DialogHeader, { children: _jsx(DialogTitle, { className: "text-2xl font-bold font-heading", children: "Rate your experience" }) }), _jsxs("div", { className: "py-6 space-y-6", children: [_jsxs("div", { className: "text-center", children: [_jsxs("p", { className: "text-gray-500 mb-4", children: ["How was your trip with ", _jsx("span", { className: "text-primary font-bold", children: guideName }), "?"] }), _jsx("div", { className: "flex justify-center gap-2", children: [1, 2, 3, 4, 5].map((star) => (_jsx("button", { type: "button", onClick: () => setRating(star), onMouseEnter: () => setHoveredRating(star), onMouseLeave: () => setHoveredRating(0), className: "p-1 focus:outline-none transition-transform hover:scale-110", children: _jsx(Star, { className: `w-10 h-10 ${(hoveredRating || rating) >= star
                                                ? "fill-yellow-400 text-yellow-400"
                                                : "text-gray-300"}` }) }, star))) })] }), _jsxs("div", { className: "space-y-2", children: [_jsx(Label, { htmlFor: "review", className: "font-bold", children: "Your Review" }), _jsx(Textarea, { id: "review", placeholder: "Tell us about the best parts of your tour...", className: "h-32 rounded-xl resize-none", value: comment, onChange: (e) => setComment(e.target.value) })] })] }), _jsxs(DialogFooter, { className: "sm:justify-between gap-4", children: [_jsx(Button, { variant: "ghost", onClick: onClose, className: "rounded-xl", children: "Cancel" }), _jsx(Button, { onClick: handleSubmit, disabled: isLoading, className: "bg-accent hover:bg-accent/90 text-white font-bold h-12 px-8 rounded-xl min-w-[140px]", children: isLoading ? (_jsxs(_Fragment, { children: [_jsx(Loader2, { className: "w-4 h-4 mr-2 animate-spin" }), " Submitting..."] })) : ("Submit Review") })] })] }) }));
}
