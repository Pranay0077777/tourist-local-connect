import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import {} from "@/lib/localStorage";
import { RoleAwareHeader } from "./RoleAwareHeader";
import { Button } from "./ui/button";
import { Card, CardContent } from "./ui/card";
import { ArrowLeft, Star, Quote } from "lucide-react";
export function ReviewsPage({ user, onNavigate, onLogout }) {
    // Professional Mock Data - 15 Reviews
    const ALL_REVIEWS = [
        {
            id: 1,
            author: "Sarah Jenkins",
            rating: 5,
            date: "2 days ago",
            text: "Absolutely amazing experience! The guide was so knowledgeable about the local history and hidden gems. Highly recommended! We visited places I would have never found on my own.",
            tourName: "Heritage Temple Architecture Walk"
        },
        {
            id: 2,
            author: "Mike Chen",
            rating: 5,
            date: "1 week ago",
            text: "Great tour! We saw everything we wanted to see and more. Very friendly and professional. The pacing was perfect for my elderly parents.",
            tourName: "Sunrise Beach Yoga & Meditation"
        },
        {
            id: 3,
            author: "Priya Sharma",
            rating: 4,
            date: "2 weeks ago",
            text: "Very good experience. The food stops were the highlight. I wish we had a bit more time at the market, but overall a fantastic culinary journey.",
            tourName: "Authentic Street Food Crawler"
        },
        {
            id: 4,
            author: "Robert Wilson",
            rating: 5,
            date: "3 weeks ago",
            text: "An educational deep dive into the colonial history. The guide's storytelling skills are top-notch. It felt like traveling back in time.",
            tourName: "Colonial History of Madras"
        },
        {
            id: 5,
            author: "Emily Clark",
            rating: 5,
            date: "1 month ago",
            text: "Perfect morning activity. The yoga session was rejuvenating and the beach sunrise was breathtaking. A must-do in Chennai.",
            tourName: "Sunrise Beach Yoga & Meditation"
        },
        {
            id: 6,
            author: "David Kumar",
            rating: 4,
            date: "1 month ago",
            text: "Solid tour. Good value for money. The guide was punctual and polite.",
            tourName: "City Highlights Express"
        },
        {
            id: 7,
            author: "Jessica Lee",
            rating: 5,
            date: "2 months ago",
            text: "I loved every minute! The Kanjeevaram silk weaving demo was the highlight for me. Thank you for such a detailed explanation.",
            tourName: "Art & Crafts Heritage Tour"
        },
        {
            id: 8,
            author: "Ahmed Hassan",
            rating: 5,
            date: "2 months ago",
            text: "The best food tour I've been on. From idlis to jigarthanda, everything was delicious. Come hungry!",
            tourName: "Authentic Street Food Crawler"
        },
        {
            id: 9,
            author: "Sophie Martin",
            rating: 5,
            date: "3 months ago",
            text: "Wonderful guide! Adjusted the itinerary instantly when it started raining. Very flexible and accommodating.",
            tourName: "Mylapore Cultural Walk"
        },
        {
            id: 10,
            author: "Thomas Wright",
            rating: 4,
            date: "3 months ago",
            text: "Great insights into the local culture. The temple visit was very spiritual and serene.",
            tourName: "Heritage Temple Architecture Walk"
        },
        {
            id: 11,
            author: "Anita Desai",
            rating: 5,
            date: "4 months ago",
            text: "My family visited from the US and this was the perfect introduction to the city. Safe, fun, and informative.",
            tourName: "Chennai for Beginners"
        },
        {
            id: 12,
            author: "Liam O'Connor",
            rating: 5,
            date: "4 months ago",
            text: "Photographer's paradise! The guide knew all the best spots for golden hour shots. My portfolio looks amazing thanks to this tour.",
            tourName: "Photography Walk"
        },
        {
            id: 13,
            author: "Grace Zhang",
            rating: 5,
            date: "5 months ago",
            text: "Very professional. The car was clean and comfortable. The guide spoke fluent English and made us feel very welcome.",
            tourName: "Private Day Tour"
        },
        {
            id: 14,
            author: "Rahul Varma",
            rating: 4,
            date: "5 months ago",
            text: "Good historical context provided for every site. A bit focused on architecture, which I liked, but might be heavy for some.",
            tourName: "Colonial Architecture Walk"
        },
        {
            id: 15,
            author: "Elena Rossi",
            rating: 5,
            date: "6 months ago",
            text: "Unforgettable experience! The flower market visit was sensory overload in the best way possible. Highly recommend this guide.",
            tourName: "Markets & Bazaars of Chennai"
        }
    ];
    return (_jsxs("div", { className: "min-h-screen bg-gray-50/50", children: [_jsx(RoleAwareHeader, { user: user, currentPage: "home", onNavigate: onNavigate, onLogout: onLogout }), _jsxs("main", { className: "container mx-auto px-4 py-8 max-w-4xl", children: [_jsxs(Button, { variant: "ghost", size: "sm", onClick: () => onNavigate('home'), className: "mb-6 text-gray-600 hover:text-gray-900", children: [_jsx(ArrowLeft, { className: "w-4 h-4 mr-1" }), " Back to Dashboard"] }), _jsxs("div", { className: "mb-8 flex items-end justify-between", children: [_jsxs("div", { children: [_jsx("h1", { className: "text-3xl font-bold text-gray-900 tracking-tight", children: "Tourist Reviews" }), _jsx("p", { className: "text-gray-500 mt-2", children: "Feedback from travelers you have guided." })] }), _jsxs("div", { className: "bg-white px-4 py-2 rounded-lg border border-gray-200 shadow-sm text-sm font-medium text-gray-700", children: ["Total Reviews: ", _jsx("span", { className: "text-primary font-bold", children: ALL_REVIEWS.length })] })] }), _jsx("div", { className: "grid grid-cols-1 gap-6", children: ALL_REVIEWS.map((review) => (_jsx(Card, { className: "border-none shadow-sm hover:shadow-md transition-shadow bg-white overflow-hidden", children: _jsx(CardContent, { className: "p-6", children: _jsxs("div", { className: "flex flex-col md:flex-row gap-6", children: [_jsxs("div", { className: "md:w-48 flex-shrink-0 flex flex-row md:flex-col items-center md:items-start gap-4 md:gap-2", children: [_jsx("div", { className: "w-12 h-12 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-700 font-bold text-lg", children: review.author[0] }), _jsxs("div", { children: [_jsx("h3", { className: "font-bold text-gray-900", children: review.author }), _jsx("p", { className: "text-xs text-gray-500", children: review.date })] })] }), _jsxs("div", { className: "flex-1 space-y-3", children: [_jsxs("div", { className: "flex justify-between items-start", children: [_jsx("div", { className: "flex text-yellow-400 gap-0.5", children: Array.from({ length: 5 }).map((_, i) => (_jsx(Star, { className: `w-4 h-4 ${i < review.rating ? 'fill-current' : 'text-gray-200'}` }, i))) }), _jsx("span", { className: "text-xs font-medium text-gray-500 bg-gray-100 px-2 py-1 rounded-full", children: review.tourName })] }), _jsxs("div", { className: "relative", children: [_jsx(Quote, { className: "absolute -left-2 -top-2 w-6 h-6 text-gray-200 -z-10 opacity-50" }), _jsx("p", { className: "text-gray-700 leading-relaxed", children: review.text })] })] })] }) }) }, review.id))) })] })] }));
}
