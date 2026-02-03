import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect } from "react";
import { Button } from "./ui/button";
import { Card, CardContent } from "./ui/card";
import { MapPin, User, ShieldCheck, Timer, ArrowRight, Map, Compass, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
const SLIDES = [
    {
        url: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?q=80&w=2000&auto=format&fit=crop",
        title: "Pristine Beaches",
        location: "Varkala, Kerala"
    },
    {
        url: "https://images.unsplash.com/photo-1582510003544-4d00b7f74220?q=80&w=2000&auto=format&fit=crop",
        title: "Ancient Temples",
        location: "Madurai, Tamil Nadu"
    },
    {
        url: "https://images.unsplash.com/photo-1516426122078-c23e76319801?q=80&w=2000&auto=format&fit=crop",
        title: "Deep Forests",
        location: "Wayanad, Kerala"
    },
    {
        url: "https://images.unsplash.com/photo-1596627691515-585a2ba3c38b?q=80&w=2000&auto=format&fit=crop",
        title: "Island Getaways",
        location: "Havelock Island"
    }
];
const FEATURES = [
    {
        icon: MapPin,
        color: "text-blue-600 bg-blue-50/80",
        title: "Local Expertise",
        desc: "Hidden gems & stories"
    },
    {
        icon: User,
        color: "text-green-600 bg-green-50/80",
        title: "Empowerment",
        desc: "Supporting local youth"
    },
    {
        icon: ShieldCheck,
        color: "text-purple-600 bg-purple-50/80",
        title: "Verified Guides",
        desc: "100% Safe & Secure"
    },
    {
        icon: Timer,
        color: "text-orange-600 bg-orange-50/80",
        title: "Flexible Tours",
        desc: "Your time, your way"
    }
];
const STEPS = [
    { num: 1, title: "Sign Up", desc: "Start in seconds" },
    { num: 2, title: "Connect", desc: "Find verified guides" },
    { num: 3, title: "Explore", desc: "Experience the real culture" }
];
export function WelcomeScreen({ onRoleSelect }) {
    const [currentSlide, setCurrentSlide] = useState(0);
    const [showRoleSelection, setShowRoleSelection] = useState(false);
    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentSlide((prev) => (prev + 1) % SLIDES.length);
        }, 5000);
        return () => clearInterval(timer);
    }, []);
    return (_jsxs("div", { className: "relative h-screen w-full overflow-hidden flex items-center justify-center lg:justify-start", children: [_jsx("div", { className: "absolute inset-0 z-0 bg-gray-900", children: _jsx(AnimatePresence, { mode: "wait", children: _jsx(motion.div, { initial: { opacity: 0, scale: 1.1 }, animate: { opacity: 1, scale: 1 }, exit: { opacity: 0 }, transition: { duration: 1.2, ease: "easeInOut" }, className: "absolute inset-0 bg-cover bg-center", style: { backgroundImage: `url(${SLIDES[currentSlide].url})` }, children: _jsx("div", { className: "absolute inset-0 bg-gradient-to-r from-black/90 via-black/50 to-transparent" }) }, currentSlide) }) }), _jsxs(motion.div, { className: `relative z-10 w-full max-w-7xl mx-auto px-4 lg:px-12 h-screen flex flex-col lg:flex-row gap-8 lg:gap-12 items-center justify-center transition-all duration-500 ${showRoleSelection ? 'blur-md opacity-50 scale-95' : ''}`, children: [_jsxs("div", { className: "w-full lg:w-[45%] space-y-6 animate-in slide-in-from-left-10 duration-700 flex flex-col justify-center", children: [_jsxs("div", { className: "space-y-3", children: [_jsxs("div", { className: "inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-blue-100 text-xs font-medium", children: [_jsx(MapPin, { className: "w-3 h-3" }), _jsx("span", { children: "Discover South India" })] }), _jsxs("h1", { className: "text-4xl lg:text-6xl font-bold text-white tracking-tight drop-shadow-lg leading-tight", children: ["Local Hearts, ", _jsx("br", {}), _jsx("span", { className: "text-transparent bg-clip-text bg-gradient-to-r from-blue-300 to-green-300", children: "Unforgettable Journeys." })] }), _jsx("p", { className: "text-base text-gray-200 leading-relaxed max-w-lg drop-shadow-md", children: "Connect with verified local guides. Experience culture, food, and stories you won't find in guidebooks." })] }), _jsx("div", { className: "grid grid-cols-2 gap-3", children: FEATURES.map((feature, idx) => (_jsx(Card, { className: "border-0 bg-white/5 backdrop-blur-md shadow-lg text-white", children: _jsxs(CardContent, { className: "p-3 flex items-center gap-3", children: [_jsx("div", { className: `p-1.5 rounded-lg ${feature.color.replace('bg-', 'bg-white text-')}`, children: _jsx(feature.icon, { className: "w-4 h-4" }) }), _jsxs("div", { children: [_jsx("h3", { className: "font-semibold text-sm", children: feature.title }), _jsx("p", { className: "text-[10px] text-blue-100 opacity-80 leading-tight", children: feature.desc })] })] }) }, idx))) }), _jsx("div", { className: "pt-2", children: _jsxs(Button, { size: "lg", className: "w-full sm:w-auto h-12 px-8 text-base bg-blue-600 hover:bg-blue-700 text-white rounded-full shadow-[0_0_20px_rgba(37,99,235,0.5)] border border-white/20 transition-all hover:scale-105", onClick: () => setShowRoleSelection(true), children: ["Start Your Journey", _jsx(ArrowRight, { className: "w-4 h-4 ml-2" })] }) })] }), _jsxs("div", { className: "hidden lg:flex w-[55%] lg:flex-col items-end justify-center space-y-6 pl-12", children: [_jsxs(motion.div, { initial: { opacity: 0, x: 20 }, animate: { opacity: 1, x: 0 }, className: "bg-black/30 backdrop-blur-md p-4 rounded-xl border border-white/10 text-right max-w-sm ml-auto", children: [_jsx("h3", { className: "text-2xl font-bold text-white mb-0.5", children: SLIDES[currentSlide].title }), _jsxs("div", { className: "flex items-center justify-end gap-1.5 text-blue-200", children: [_jsx(MapPin, { className: "w-3 h-3" }), _jsx("span", { className: "uppercase tracking-widest text-xs", children: SLIDES[currentSlide].location })] })] }, currentSlide), _jsxs("div", { className: "w-full bg-black/40 backdrop-blur-lg rounded-2xl p-6 border border-white/10", children: [_jsx("h4", { className: "text-white/80 font-semibold mb-4 uppercase tracking-wider text-xs border-b border-white/10 pb-2", children: "How It Works" }), _jsx("div", { className: "grid grid-cols-3 gap-6", children: STEPS.map(((step, idx) => (_jsxs("div", { className: "text-center group", children: [_jsx("div", { className: "w-8 h-8 mx-auto bg-white/10 group-hover:bg-blue-600 rounded-full flex items-center justify-center text-white font-bold mb-2 transition-colors border border-white/20 text-sm", children: step.num }), _jsx("h5", { className: "text-white font-medium mb-0.5 text-sm", children: step.title }), _jsx("p", { className: "text-[10px] text-gray-400", children: step.desc })] }, idx)))) })] })] })] }), _jsx(AnimatePresence, { children: showRoleSelection && (_jsx(motion.div, { initial: { opacity: 0 }, animate: { opacity: 1 }, exit: { opacity: 0 }, className: "absolute inset-0 z-50 flex items-center justify-center p-4 bg-black/20 backdrop-blur-[2px]", children: _jsxs(motion.div, { initial: { scale: 0.9, y: 20, opacity: 0 }, animate: { scale: 1, y: 0, opacity: 1 }, exit: { scale: 0.9, y: 20, opacity: 0 }, transition: { type: "spring", damping: 25, stiffness: 300 }, className: "bg-white/90 backdrop-blur-xl p-8 rounded-3xl shadow-2xl border border-white/40 max-w-4xl w-full relative", children: [_jsx("button", { onClick: () => setShowRoleSelection(false), className: "absolute top-4 right-4 p-2 rounded-full hover:bg-gray-100 text-gray-500 transition-colors", children: _jsx(X, { className: "w-6 h-6" }) }), _jsxs("div", { className: "text-center mb-8 space-y-2", children: [_jsx("h2", { className: "text-3xl font-bold text-gray-900", children: "Choose Your Role" }), _jsx("p", { className: "text-gray-600", children: "Are you looking to explore or share your local expertise?" })] }), _jsxs("div", { className: "grid md:grid-cols-2 gap-6", children: [_jsxs("div", { className: "group cursor-pointer rounded-2xl p-6 border-2 border-transparent bg-blue-50/50 hover:bg-blue-50 hover:border-blue-500 hover:shadow-xl transition-all duration-300", onClick: () => onRoleSelect('tourist'), children: [_jsx("div", { className: "w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform", children: _jsx(Map, { className: "w-8 h-8 text-blue-600" }) }), _jsx("h3", { className: "text-xl font-bold text-gray-900 mb-2", children: "I'm a Traveller" }), _jsx("p", { className: "text-sm text-gray-600 leading-relaxed mb-4", children: "Discover authentic local experiences with verified guides across South India." }), _jsxs("ul", { className: "text-sm text-gray-500 space-y-1.5 list-disc pl-4", children: [_jsx("li", { children: "Browse verified local guides" }), _jsx("li", { children: "Book personalized tours" }), _jsx("li", { children: "Experience local culture" })] })] }), _jsxs("div", { className: "group cursor-pointer rounded-2xl p-6 border-2 border-transparent bg-green-50/50 hover:bg-green-50 hover:border-green-500 hover:shadow-xl transition-all duration-300", onClick: () => onRoleSelect('guide'), children: [_jsx("div", { className: "w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform", children: _jsx(Compass, { className: "w-8 h-8 text-green-600" }) }), _jsx("h3", { className: "text-xl font-bold text-gray-900 mb-2", children: "I'm a Guide" }), _jsx("p", { className: "text-sm text-gray-600 leading-relaxed mb-4", children: "Share your local knowledge and earn \u20B9250-500 per hour as a verified guide." }), _jsxs("ul", { className: "text-sm text-gray-500 space-y-1.5 list-disc pl-4", children: [_jsx("li", { children: "Earn flexible income" }), _jsx("li", { children: "Set your own schedule" }), _jsx("li", { children: "Meet travelers worldwide" })] })] })] })] }) })) })] }));
}
