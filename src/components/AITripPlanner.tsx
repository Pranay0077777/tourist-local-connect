import { useState } from "react";
import ReactMarkdown from 'react-markdown';
import { RoleAwareHeader } from "./RoleAwareHeader";
import { type LocalUser } from "@/lib/localStorage";
import { GuideCard } from "./GuideCard";
import { type Guide } from "@/types";
import { Button } from "./ui/button";
import { Card, CardContent } from "./ui/card";
import { Loader2, Sparkles, MapPin, Calendar, ArrowLeft, Bookmark, Map as MapIcon, X } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { toast } from "sonner";
import { TripMap } from "./TripMap";
import { api } from "@/lib/api";
import { AILoadingAnimation } from "./AILoadingAnimation";
import { Dialog, DialogContent } from "./ui/dialog";

interface AITripPlannerProps {
    user: LocalUser;
    onNavigate: (page: string) => void;
    onLogout: () => void;
    onViewProfile: (guideId: string) => void;
}

export function AITripPlanner({ user, onNavigate, onLogout, onViewProfile }: AITripPlannerProps) {
    const [city, setCity] = useState("Chennai");
    const [days, setDays] = useState("1");
    const [interests, setInterests] = useState<string[]>([]);

    // Loading State Management
    const [isLoading, setIsLoading] = useState(false);
    const [isDataReady, setIsDataReady] = useState(false);
    const [isMapFullscreen, setIsMapFullscreen] = useState(false);
    const [showExitConfirm, setShowExitConfirm] = useState(false);

    const [result, setResult] = useState<{ itinerary: string, guides: Guide[], stops?: any[] } | null>(null);
    const [isSaving, setIsSaving] = useState(false);

    const interestOptions = ["Food", "Culture", "History", "Nature", "Shopping"];

    const toggleInterest = (interest: string) => {
        if (interests.includes(interest)) {
            setInterests(interests.filter(i => i !== interest));
        } else {
            setInterests([...interests, interest]);
        }
    };

    const handleSave = async () => {
        if (!result) return;
        setIsSaving(true);
        try {
            await api.saveItinerary({
                userId: user.id,
                city,
                title: `${days} Day Trip to ${city}`,
                content: result
            });
            toast.success("Itinerary saved to your trips!");
        } catch (error) {
            toast.error("Failed to save itinerary");
        } finally {
            setIsSaving(false);
        }
    };

    const handleGenerate = async () => {
        setIsLoading(true);
        setIsDataReady(false);
        setResult(null);

        try {
            const data = await api.planTrip({
                city,
                days: parseInt(days),
                interests
            });
            if (data.itinerary) {
                setResult(data);
                setIsDataReady(true);
                toast.success("Itinerary Generated!");
            } else {
                toast.error("Failed to generate itinerary");
                setIsLoading(false);
            }

        } catch (error: any) {
            console.error(error);
            toast.error(error.message || "Failed to generate itinerary. Please try again.");
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50">
            <RoleAwareHeader
                user={user}
                currentPage="ai-planner"
                onNavigate={onNavigate}
                onLogout={onLogout}
            />

            <main className="container mx-auto px-4 py-8 max-w-5xl">
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onNavigate('home')}
                    className="mb-4 text-gray-600 hover:text-gray-900"
                >
                    <ArrowLeft className="w-4 h-4 mr-1" /> Back to Dashboard
                </Button>

                <div className="text-center mb-10">
                    <h1 className="text-4xl font-heading font-bold text-gray-900 mb-3 flex items-center justify-center gap-3">
                        <Sparkles className="w-8 h-8 text-primary animate-pulse" />
                        AI Trip Planner
                    </h1>
                    <p className="text-gray-600 max-w-2xl mx-auto text-lg">
                        Not sure what to do? Let our AI curate the perfect itinerary for you based on your interests and time.
                    </p>
                </div>

                <div className="grid lg:grid-cols-3 gap-8">
                    {/* Controls */}
                    <Card className="lg:col-span-1 h-fit">
                        <CardContent className="p-6 space-y-6">
                            <div className="space-y-3">
                                <label className="text-sm font-bold text-gray-700 flex items-center gap-2">
                                    <MapPin className="w-4 h-4" /> Destination
                                </label>
                                <Select value={city} onValueChange={setCity}>
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="Chennai">Chennai</SelectItem>
                                        <SelectItem value="Bengaluru">Bengaluru</SelectItem>
                                        <SelectItem value="Hyderabad">Hyderabad</SelectItem>
                                        <SelectItem value="Kochi">Kochi</SelectItem>
                                        <SelectItem value="Mysuru">Mysuru</SelectItem>
                                        <SelectItem value="Madurai">Madurai</SelectItem>
                                        <SelectItem value="Pondicherry">Pondicherry</SelectItem>
                                        <SelectItem value="Coimbatore">Coimbatore</SelectItem>
                                        <SelectItem value="Thiruvananthapuram">Thiruvananthapuram</SelectItem>
                                        <SelectItem value="Visakhapatnam">Visakhapatnam</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-3">
                                <label className="text-sm font-bold text-gray-700 flex items-center gap-2">
                                    <Calendar className="w-4 h-4" /> Duration (Days)
                                </label>
                                <Select value={days} onValueChange={setDays}>
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="1">1 Day</SelectItem>
                                        <SelectItem value="2">2 Days</SelectItem>
                                        <SelectItem value="3">3 Days</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-3">
                                <label className="text-sm font-bold text-gray-700">Interests</label>
                                <div className="flex flex-wrap gap-2">
                                    {interestOptions.map(interest => (
                                        <button
                                            key={interest}
                                            onClick={() => toggleInterest(interest)}
                                            className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors border ${interests.includes(interest)
                                                ? "bg-primary text-white border-primary"
                                                : "bg-white text-gray-600 border-gray-200 hover:border-primary hover:text-primary"
                                                }`}
                                        >
                                            {interest}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <Button
                                onClick={handleGenerate}
                                disabled={isLoading}
                                className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-bold h-12 rounded-xl"
                            >
                                {isLoading ? (
                                    <><Loader2 className="w-5 h-5 mr-2 animate-spin" /> Generating Plan...</>
                                ) : (
                                    <><Sparkles className="w-5 h-5 mr-2" /> Generate Itinerary</>
                                )}
                            </Button>
                        </CardContent>
                    </Card>

                    {/* Results */}
                    <div className="lg:col-span-2 space-y-8">
                        {isLoading && (
                            <div className="h-fit">
                                <AILoadingAnimation
                                    isDataReady={isDataReady}
                                    onComplete={() => setIsLoading(false)}
                                />
                            </div>
                        )}

                        {!isLoading && !result && (
                            <div className="h-96 flex flex-col items-center justify-center bg-white/50 border-2 border-dashed border-gray-200 rounded-2xl">
                                <Sparkles className="w-12 h-12 text-gray-300 mb-4" />
                                <p className="text-gray-400 font-medium max-w-xs text-center">
                                    Select your preferences and click generate to see the magic.
                                </p>
                            </div>
                        )}

                        {!isLoading && result && (
                            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                                {/* Itinerary Content - PRIMARY VIEW */}
                                <Card className="border-none shadow-none bg-transparent">
                                    <CardContent className="p-0 space-y-8">
                                        <div className="flex items-center justify-between px-1">
                                            <div>
                                                <h2 className="text-3xl font-heading font-bold text-gray-900 leading-tight">Your Itinerary</h2>
                                                <p className="text-gray-500 text-sm mt-1">Personalized guide for your trip</p>
                                            </div>
                                            <div className="flex flex-col items-end gap-3">
                                                <div className="flex gap-2">
                                                    <Button
                                                        variant="outline"
                                                        onClick={handleSave}
                                                        disabled={isSaving}
                                                        className="h-10 px-4 rounded-xl border-gray-200 shadow-sm"
                                                    >
                                                        {isSaving ? (
                                                            <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> ...</>
                                                        ) : (
                                                            <><Bookmark className="w-4 h-4 mr-2" /> Save</>
                                                        )}
                                                    </Button>
                                                    <Button
                                                        onClick={() => setIsMapFullscreen(true)}
                                                        className="h-10 px-4 rounded-xl bg-gray-900 hover:bg-black text-white shadow-lg"
                                                    >
                                                        <MapIcon className="w-4 h-4 mr-2" /> View Map
                                                    </Button>
                                                </div>
                                            </div>
                                        </div>

                                        <Card className="border-blue-100 shadow-md">
                                            <CardContent className="p-6">
                                                {result.itinerary ? (
                                                    <div className="prose prose-blue max-w-none prose-headings:font-heading prose-a:text-blue-600">
                                                        <ReactMarkdown>{result.itinerary}</ReactMarkdown>
                                                    </div>
                                                ) : (
                                                    <div className="text-center py-10 text-gray-500">
                                                        <p>No written itinerary available.</p>
                                                    </div>
                                                )}
                                            </CardContent>
                                        </Card>
                                    </CardContent>
                                </Card>

                                {/* Mini Map */}
                                {result.stops && (
                                    <div className="space-y-2">
                                        <div className="flex items-center justify-between px-1">
                                            <h3 className="font-heading font-bold text-lg">Route Map Preview</h3>
                                            <Button variant="link" size="sm" onClick={() => setIsMapFullscreen(true)}>
                                                Expand Map
                                            </Button>
                                        </div>
                                        <TripMap stops={result.stops} />
                                    </div>
                                )}

                                {/* Fullscreen Map Dialog */}
                                <Dialog open={isMapFullscreen} onOpenChange={(open) => {
                                    if (!open) setShowExitConfirm(true);
                                }}>
                                    <DialogContent className="max-w-[100vw] w-screen h-screen p-0 m-0 overflow-hidden bg-white border-none rounded-none shadow-none z-[1500]">
                                        <div className="relative w-full h-full">
                                            {/* Square Back Button */}
                                            <div className="absolute top-6 left-6 z-[2000]">
                                                <Button
                                                    variant="secondary"
                                                    onClick={() => setShowExitConfirm(true)}
                                                    className="w-12 h-12 p-0 bg-white hover:bg-gray-100 text-gray-900 shadow-2xl border-2 border-gray-100 rounded-lg flex items-center justify-center transition-all hover:scale-105 active:scale-95"
                                                >
                                                    <ArrowLeft className="w-6 h-6" />
                                                </Button>
                                            </div>

                                            {/* Actual Map */}
                                            <div className="w-full h-full">
                                                {result.stops && (
                                                    <TripMap stops={result.stops} maximized={true} />
                                                )}
                                            </div>
                                        </div>
                                    </DialogContent>
                                </Dialog>

                                {/* Exit Confirmation Dialog */}
                                <Dialog open={showExitConfirm} onOpenChange={setShowExitConfirm}>
                                    <DialogContent className="max-w-md p-6 rounded-2xl z-[2100]">
                                        <div className="text-center space-y-4">
                                            <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto">
                                                <X className="w-8 h-8 text-red-500" />
                                            </div>
                                            <div className="space-y-2">
                                                <h3 className="text-xl font-bold text-gray-900">Exit Map View?</h3>
                                                <p className="text-gray-500">Are you sure you want to stop exploring the map and return to your itinerary?</p>
                                            </div>
                                            <div className="flex gap-3 pt-2">
                                                <Button
                                                    variant="outline"
                                                    className="flex-1 font-bold h-12 rounded-xl"
                                                    onClick={() => setShowExitConfirm(false)}
                                                >
                                                    No, Stay
                                                </Button>
                                                <Button
                                                    variant="destructive"
                                                    className="flex-1 font-bold h-12 rounded-xl bg-red-600 hover:bg-red-700"
                                                    onClick={() => {
                                                        setShowExitConfirm(false);
                                                        setIsMapFullscreen(false);
                                                    }}
                                                >
                                                    Yes, Exit
                                                </Button>
                                            </div>
                                        </div>
                                    </DialogContent>
                                </Dialog>

                                {/* Guides */}
                                {result.guides && result.guides.length > 0 && (
                                    <div className="space-y-4">
                                        <div className="flex items-center justify-between px-1">
                                            <h2 className="text-xl font-heading font-bold text-gray-900">Recommended Guides</h2>
                                        </div>
                                        <div className="grid sm:grid-cols-2 gap-4">
                                            {result.guides.map(guide => (
                                                <GuideCard
                                                    key={guide.id}
                                                    guide={guide}
                                                    onViewProfile={onViewProfile}
                                                />
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </main>
        </div>
    );
}
