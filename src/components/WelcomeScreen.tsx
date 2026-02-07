import { useState, useEffect } from "react";
import { Button } from "./ui/button";
import { Card, CardContent } from "./ui/card";
import { MapPin, User, ShieldCheck, Timer, ArrowRight, Map, Compass, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface WelcomeScreenProps {
    onRoleSelect: (role: 'guide' | 'tourist') => void;
}

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

export function WelcomeScreen({ onRoleSelect }: WelcomeScreenProps) {
    const [currentSlide, setCurrentSlide] = useState(0);
    const [showRoleSelection, setShowRoleSelection] = useState(false);
    const [settingUp, setSettingUp] = useState(false);

    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentSlide((prev) => (prev + 1) % SLIDES.length);
        }, 5000);
        return () => clearInterval(timer);
    }, []);

    return (
        <div className="relative h-screen w-full overflow-hidden flex items-center justify-center lg:justify-start">

            {/* BACKGROUND SLIDER (Full Screen) */}
            <div className="absolute inset-0 z-0 bg-gray-900">
                <AnimatePresence mode="wait">
                    <motion.div
                        key={currentSlide}
                        initial={{ opacity: 0, scale: 1.1 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 1.2, ease: "easeInOut" }}
                        className="absolute inset-0 bg-cover bg-center"
                        style={{ backgroundImage: `url(${SLIDES[currentSlide].url})` }}
                    >
                        {/* Dynamic Gradient Overlay */}
                        <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/50 to-transparent" />
                    </motion.div>
                </AnimatePresence>
            </div>

            {/* CONTENT OVERLAY */}
            <motion.div
                className={`relative z-10 w-full max-w-7xl mx-auto px-4 lg:px-12 h-screen flex flex-col lg:flex-row gap-8 lg:gap-12 items-center justify-center transition-all duration-500 ${showRoleSelection ? 'blur-md opacity-50 scale-95' : ''}`}
            >

                {/* Left Side: Main Content */}
                <div className="w-full lg:w-[45%] space-y-6 animate-in slide-in-from-left-10 duration-700 flex flex-col justify-center">
                    <div className="space-y-3">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-blue-100 text-xs font-medium">
                            <MapPin className="w-3 h-3" />
                            <span>Discover South India</span>
                        </div>
                        <h1 className="text-4xl lg:text-6xl font-bold text-white tracking-tight drop-shadow-lg leading-tight">
                            Local Hearts, <br />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-300 to-green-300">
                                Unforgettable Journeys.
                            </span>
                        </h1>
                        <p className="text-base text-gray-200 leading-relaxed max-w-lg drop-shadow-md">
                            Connect with verified local guides. Experience culture, food, and stories you won't find in guidebooks.
                        </p>
                    </div>

                    {/* Features Grid (Compact) */}
                    <div className="grid grid-cols-2 gap-3">
                        {FEATURES.map((feature, idx) => (
                            <Card key={idx} className="border-0 bg-white/5 backdrop-blur-md shadow-lg text-white">
                                <CardContent className="p-3 flex items-center gap-3">
                                    <div className={`p-1.5 rounded-lg ${feature.color.replace('bg-', 'bg-white text-')}`}>
                                        <feature.icon className="w-4 h-4" />
                                    </div>
                                    <div>
                                        <h3 className="font-semibold text-sm">{feature.title}</h3>
                                        <p className="text-[10px] text-blue-100 opacity-80 leading-tight">{feature.desc}</p>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>

                    <div className="pt-2">
                        <Button
                            size="lg"
                            className="w-full sm:w-auto h-12 px-8 text-base bg-blue-600 hover:bg-blue-700 text-white rounded-full shadow-[0_0_20px_rgba(37,99,235,0.5)] border border-white/20 transition-all hover:scale-105"
                            onClick={() => setShowRoleSelection(true)}
                        >
                            Start Your Journey
                            <ArrowRight className="w-4 h-4 ml-2" />
                        </Button>
                    </div>
                </div>

                {/* Right Side: Process Info (Floating Panel) */}
                <div className="hidden lg:flex w-[55%] lg:flex-col items-end justify-center space-y-6 pl-12">
                    {/* Location Badge (Synced with Slide) */}
                    <motion.div
                        key={currentSlide}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="bg-black/30 backdrop-blur-md p-4 rounded-xl border border-white/10 text-right max-w-sm ml-auto"
                    >
                        <h3 className="text-2xl font-bold text-white mb-0.5">{SLIDES[currentSlide].title}</h3>
                        <div className="flex items-center justify-end gap-1.5 text-blue-200">
                            <MapPin className="w-3 h-3" />
                            <span className="uppercase tracking-widest text-xs">{SLIDES[currentSlide].location}</span>
                        </div>
                    </motion.div>

                    {/* How It Works Steps (Horizontal) */}
                    <div className="w-full bg-black/40 backdrop-blur-lg rounded-2xl p-6 border border-white/10">
                        <h4 className="text-white/80 font-semibold mb-4 uppercase tracking-wider text-xs border-b border-white/10 pb-2">How It Works</h4>
                        <div className="grid grid-cols-3 gap-6">
                            {STEPS.map(((step, idx) => (
                                <div key={idx} className="text-center group">
                                    <div className="w-8 h-8 mx-auto bg-white/10 group-hover:bg-blue-600 rounded-full flex items-center justify-center text-white font-bold mb-2 transition-colors border border-white/20 text-sm">
                                        {step.num}
                                    </div>
                                    <h5 className="text-white font-medium mb-0.5 text-sm">{step.title}</h5>
                                    <p className="text-[10px] text-gray-400">{step.desc}</p>
                                </div>
                            )))}
                        </div>
                    </div>
                </div>
            </motion.div>

            {/* ROLE SELECTION POPUP OVERLAY */}
            <AnimatePresence>
                {showRoleSelection && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="absolute inset-0 z-50 flex items-center justify-center p-4 bg-black/20 backdrop-blur-[2px]"
                    >
                        <motion.div
                            initial={{ scale: 0.9, y: 20, opacity: 0 }}
                            animate={{ scale: 1, y: 0, opacity: 1 }}
                            exit={{ scale: 0.9, y: 20, opacity: 0 }}
                            transition={{ type: "spring", damping: 25, stiffness: 300 }}
                            className="bg-white/90 backdrop-blur-xl p-8 rounded-3xl shadow-2xl border border-white/40 max-w-4xl w-full relative"
                        >
                            {/* Close Button */}
                            <button
                                onClick={() => setShowRoleSelection(false)}
                                className="absolute top-4 right-4 p-2 rounded-full hover:bg-gray-100 text-gray-500 transition-colors"
                            >
                                <X className="w-6 h-6" />
                            </button>

                            <div className="text-center mb-8 space-y-2">
                                <h2 className="text-3xl font-bold text-gray-900">Choose Your Role</h2>
                                <p className="text-gray-600">Are you looking to explore or share your local expertise?</p>
                            </div>

                            <div className="grid md:grid-cols-2 gap-6">
                                {/* Tourist Card */}
                                <div
                                    className="group cursor-pointer rounded-2xl p-6 border-2 border-transparent bg-blue-50/50 hover:bg-blue-50 hover:border-blue-500 hover:shadow-xl transition-all duration-300"
                                    onClick={() => onRoleSelect('tourist')}
                                >
                                    <div className="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                                        <Map className="w-8 h-8 text-blue-600" />
                                    </div>
                                    <h3 className="text-xl font-bold text-gray-900 mb-2">I'm a Traveller</h3>
                                    <p className="text-sm text-gray-600 leading-relaxed mb-4">
                                        Discover authentic local experiences with verified guides across South India.
                                    </p>
                                    <ul className="text-sm text-gray-500 space-y-1.5 list-disc pl-4">
                                        <li>Browse verified local guides</li>
                                        <li>Book personalized tours</li>
                                        <li>Experience local culture</li>
                                    </ul>
                                </div>

                                {/* Guide Card */}
                                <div
                                    className="group cursor-pointer rounded-2xl p-6 border-2 border-transparent bg-green-50/50 hover:bg-green-50 hover:border-green-500 hover:shadow-xl transition-all duration-300"
                                    onClick={() => onRoleSelect('guide')}
                                >
                                    <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                                        <Compass className="w-8 h-8 text-green-600" />
                                    </div>
                                    <h3 className="text-xl font-bold text-gray-900 mb-2">I'm a Guide</h3>
                                    <p className="text-sm text-gray-600 leading-relaxed mb-4">
                                        Share your local knowledge and earn ₹250-500 per hour as a verified guide.
                                    </p>
                                    <ul className="text-sm text-gray-500 space-y-1.5 list-disc pl-4">
                                        <li>Earn flexible income</li>
                                        <li>Set your own schedule</li>
                                        <li>Meet travelers worldwide</li>
                                    </ul>
                                </div>
                            </div>

                            <div className="mt-8 pt-4 border-t border-gray-100 flex flex-col items-center gap-2">
                                <button
                                    disabled={settingUp}
                                    onClick={async () => {
                                        if (confirm("This will initialize/reset the production database. Continue?")) {
                                            try {
                                                setSettingUp(true);
                                                const { api } = await import("@/lib/api");
                                                await api.initializeDatabase();
                                                alert("Database setup successfully! 🚀");
                                            } catch (e: any) {
                                                alert(e.message || "Setup failed. Check if deployment is complete.");
                                            } finally {
                                                setSettingUp(false);
                                            }
                                        }
                                    }}
                                    className={`text-[10px] transition-colors ${settingUp ? 'text-blue-500 animate-pulse' : 'text-gray-400 hover:text-gray-600'}`}
                                >
                                    {settingUp ? "⚙️ Initializing Database (Please wait...)" : "Setup Production Database (Admin)"}
                                </button>
                                {settingUp && (
                                    <p className="text-[9px] text-gray-400 italic">This usually takes 10-15 seconds...</p>
                                )}
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
