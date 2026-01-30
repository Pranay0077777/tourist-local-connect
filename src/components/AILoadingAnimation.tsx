import { useState, useEffect } from "react";
import { Bus, Sun, Cloud } from "lucide-react";

interface AILoadingAnimationProps {
    onComplete?: () => void;
    isDataReady: boolean;
}

export function AILoadingAnimation({ onComplete, isDataReady }: AILoadingAnimationProps) {
    const [progress, setProgress] = useState(0);
    const [loadingText, setLoadingText] = useState("Starting engine...");

    useEffect(() => {
        const interval = setInterval(() => {
            setProgress((prev) => {
                if (prev >= 100) {
                    clearInterval(interval);
                    if (onComplete) onComplete();
                    return 100;
                }

                let increment = 0;

                if (isDataReady) {
                    // Data is here! Zoom to finish!
                    increment = 3.0;
                } else {
                    // Simulating work...
                    if (prev < 30) increment = 1.0;        // Fast start
                    else if (prev < 60) increment = 0.5;   // Normal pace
                    else if (prev < 90) increment = 0.2;   // Slowing down...
                    else increment = 0.05;                 // Crawl very slowly
                }

                // If data isn't ready, cap at 99% so we don't finish prematurely
                const target = isDataReady ? 100 : 99;
                const next = Math.min(prev + increment, target);

                // Thematic text updates
                if (next > 10 && next < 30) setLoadingText("Starting the engine...");
                else if (next > 30 && next < 60) setLoadingText("Cruising through the city...");
                else if (next > 60 && next < 90) setLoadingText("Enjoying the scenic interactions...");
                else if (next > 90) setLoadingText("Arriving at your destination...");

                return next;
            });
        }, 30); // Faster tick for smooth animation

        return () => clearInterval(interval);
    }, [onComplete, isDataReady]);

    return (
        <div className="relative h-64 w-full overflow-hidden rounded-xl shadow-inner border border-gray-200">
            {/* Dynamic Sky Background: Dawn (Orange) -> Day (Blue) */}
            <div
                className="absolute inset-0 transition-colors duration-1000 ease-linear"
                style={{
                    background: `linear-gradient(to bottom, 
                        ${progress < 50 ? '#fdba74' : '#60a5fa'} 0%, 
                        ${progress < 50 ? '#fed7aa' : '#93c5fd'} 100%)`
                }}
            ></div>

            {/* Sun Movement (Left -> Right, Arc) */}
            <div
                className="absolute transition-all duration-300 ease-linear"
                style={{
                    left: `${progress}%`,
                    top: `${20 + Math.sin(progress / 100 * Math.PI) * -10}%`, // Slight arc
                    transform: 'translateX(-50%)'
                }}
            >
                <Sun className="w-12 h-12 text-yellow-400 fill-yellow-400 animate-spin-slow" />
            </div>

            {/* Moving Clouds (Parallax effect) */}
            <div className="absolute top-10 left-10 opacity-60 animate-[pulse_4s_infinite]">
                <Cloud className="w-8 h-8 text-white fill-white" />
            </div>
            <div className="absolute top-8 right-20 opacity-40 animate-[pulse_5s_infinite]">
                <Cloud className="w-6 h-6 text-white fill-white" />
            </div>
            <div className="absolute top-16 left-1/3 opacity-30 animate-[pulse_6s_infinite]">
                <Cloud className="w-10 h-10 text-white fill-white" />
            </div>


            {/* Percentage in the Sky */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center">
                <div className="text-5xl font-bold text-white drop-shadow-md font-heading tabular-nums">
                    {Math.round(progress)}%
                </div>
                <div className="text-white/90 font-medium text-sm mt-1 drop-shadow-sm">
                    {loadingText}
                </div>
            </div>

            {/* Road & Ground */}
            <div className="absolute bottom-0 w-full h-16 bg-emerald-500 border-t-4 border-emerald-600 flex items-end overflow-hidden">
                {/* Road Strip */}
                <div className="w-full h-8 bg-gray-700 relative">
                    {/* Road Markings */}
                    <div className="absolute top-1/2 w-full h-0.5 border-t border-dashed border-white/50"></div>
                </div>

                {/* Moving Bus */}
                <div
                    className="absolute bottom-2 transition-all duration-75 ease-linear z-10"
                    style={{ left: `calc(${progress}% - 24px)` }}
                >
                    <div className="relative">
                        <Bus className="w-12 h-12 text-white fill-indigo-600 stroke-2 drop-shadow-lg" />
                        {/* Exhaust Fumes */}
                        <div className="absolute -left-2 bottom-1 w-2 h-2 bg-gray-400 rounded-full animate-ping opacity-50"></div>
                    </div>
                </div>
            </div>
        </div>
    );
}
