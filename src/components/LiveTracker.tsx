
import { useEffect, useState, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { socket } from '@/lib/socket';
import { Button } from './ui/button';
import { ArrowLeft, Loader2, Share2, StopCircle, Battery, Timer, MapPin } from 'lucide-react';
import L from 'leaflet';
import { toast } from 'sonner';

// Fix Leaflet icons
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
    iconUrl: icon,
    shadowUrl: iconShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41]
});
L.Marker.prototype.options.icon = DefaultIcon;

// Custom Icons
const MyLocationIcon = new L.Icon({
    iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
});

const TargetLocationIcon = new L.Icon({
    iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
});

interface LiveTrackerProps {
    bookingId: string;
    currentUser: { id: string; role: 'guide' | 'tourist'; name: string };
    targetName: string; // The person we are tracking
    onClose: () => void;
}

export function LiveTracker({ bookingId, currentUser, targetName, onClose }: LiveTrackerProps) {
    const isGuide = currentUser.role === 'guide';
    const [myPosition, setMyPosition] = useState<[number, number] | null>(null);
    const [targetPosition, setTargetPosition] = useState<[number, number] | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [isSharing, setIsSharing] = useState(false);
    const [timeLeft, setTimeLeft] = useState<number>(1800); // 30 minutes in seconds
    const watchIdRef = useRef<number | null>(null);
    const mapRef = useRef<L.Map | null>(null);
    const timerRef = useRef<any>(null);

    // 1. Setup Socket & Room
    useEffect(() => {
        if (!socket.connected) socket.connect();
        socket.emit('join_tracking_room', bookingId);

        // Only guides track the other person
        if (isGuide) {
            socket.on('receive_location', (data: any) => {
                if (data.userId !== currentUser.id) {
                    setTargetPosition([data.lat, data.lng]);
                }
            });
        }

        return () => {
            socket.off('receive_location');
        };
    }, [bookingId, currentUser.id, isGuide]);

    // 2. Timer Logic (30-minute share limit)
    useEffect(() => {
        if (isSharing && timeLeft > 0) {
            timerRef.current = setInterval(() => {
                setTimeLeft(prev => prev - 1);
            }, 1000);
        } else if (timeLeft <= 0) {
            handleStopSharing();
            toast.info("Location sharing auto-stopped after 30 minutes to save battery.");
        }

        return () => {
            if (timerRef.current) clearInterval(timerRef.current);
        };
    }, [isSharing, timeLeft]);

    // 3. Geolocation Watch
    const handleStartSharing = () => {
        if (!navigator.geolocation) {
            setError("Geolocation is not supported by your browser.");
            return;
        }

        setIsSharing(true);
        setTimeLeft(1800); // Reset timer

        const success = (position: GeolocationPosition) => {
            const { latitude, longitude } = position.coords;
            setMyPosition([latitude, longitude]);

            // Emit my location
            socket.emit('update_location', {
                bookingId,
                userId: currentUser.id,
                role: currentUser.role,
                lat: latitude,
                lng: longitude,
                timestamp: Date.now()
            });
        };

        const errorFn = (err: any) => {
            console.error(err);
            setError("Unable to retrieve your location. Ensure GPS is enabled.");
        };

        watchIdRef.current = navigator.geolocation.watchPosition(success, errorFn, {
            enableHighAccuracy: true,
            timeout: 10000,
            maximumAge: 0
        });

        toast.success("Location sharing enabled for 30 minutes.");
    };

    const handleStopSharing = () => {
        setIsSharing(false);
        if (watchIdRef.current !== null) {
            navigator.geolocation.clearWatch(watchIdRef.current);
            watchIdRef.current = null;
        }
        if (timerRef.current) clearInterval(timerRef.current);
    };

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            if (watchIdRef.current !== null) navigator.geolocation.clearWatch(watchIdRef.current);
            if (timerRef.current) clearInterval(timerRef.current);
        };
    }, []);

    // 4. Auto-fit bounds logic
    useEffect(() => {
        if (myPosition && targetPosition && mapRef.current) {
            const bounds = L.latLngBounds([myPosition, targetPosition]);
            mapRef.current.fitBounds(bounds, { padding: [50, 50] });
        } else if (myPosition && mapRef.current && !targetPosition) {
            mapRef.current.setView(myPosition, 15);
        }
    }, [myPosition, targetPosition]);

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    return (
        <div className="fixed inset-0 z-50 bg-white flex flex-col animate-in fade-in zoom-in-95 duration-200">
            {/* Header */}
            <div className="bg-white px-4 py-3 border-b flex items-center justify-between shadow-sm z-10">
                <Button variant="ghost" size="sm" onClick={onClose}>
                    <ArrowLeft className="w-5 h-5 mr-1" /> Back
                </Button>
                <div>
                    <h2 className="font-bold text-lg text-center">{isGuide ? "Tracking Tourist" : "Location Sharing"}</h2>
                    <p className="text-[10px] text-gray-500 text-center uppercase tracking-wider font-bold">
                        {isSharing ? (
                            <span className="text-indigo-600 flex items-center justify-center gap-1">
                                <Timer className="w-3 h-3" /> {formatTime(timeLeft)} Remaining
                            </span>
                        ) : (
                            <span className="flex items-center justify-center gap-1 text-gray-400">
                                <Battery className="w-3 h-3" /> Battery Optimized Mode
                            </span>
                        )}
                    </p>
                </div>
                <div className="w-20 flex justify-end">
                    {isSharing && (
                        <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(34,197,94,0.6)]"></div>
                    )}
                </div>
            </div>

            {/* Map Area */}
            <div className="flex-1 relative bg-gray-100">
                {error && (
                    <div className="absolute top-4 left-4 right-4 z-[1000] bg-red-50 text-red-700 p-4 rounded-xl text-sm font-medium border border-red-100 flex items-center gap-3">
                        <div className="bg-red-100 p-2 rounded-full">!</div>
                        {error}
                    </div>
                )}

                {isSharing && !myPosition && !error && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center z-[1000] bg-white/80 backdrop-blur-sm">
                        <Loader2 className="w-10 h-10 text-primary animate-spin mb-4" />
                        <p className="text-gray-600 font-medium">Calibrating Location...</p>
                    </div>
                )}

                {!isSharing && !isGuide && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center z-[1000] bg-white/95 p-8 text-center">
                        <div className="w-24 h-24 bg-indigo-50 rounded-full flex items-center justify-center mb-6 text-indigo-600">
                            <Share2 className="w-10 h-10" />
                        </div>
                        <h3 className="text-2xl font-bold text-gray-900 mb-2">Share Location</h3>
                        <p className="text-gray-500 max-w-xs mb-8">
                            Help {targetName} find you by sharing your live coordinates. This will auto-stop after 30 minutes to save battery.
                        </p>
                        <Button
                            onClick={handleStartSharing}
                            size="lg"
                            className="w-full max-w-sm bg-indigo-600 hover:bg-indigo-700 text-white font-bold h-14 rounded-2xl shadow-xl shadow-indigo-100 transition-all hover:scale-[1.02]"
                        >
                            <MapPin className="w-5 h-5 mr-2" /> Start 30-Min Sharing
                        </Button>
                    </div>
                )}

                {isGuide && !targetPosition && !error && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center z-[1000] bg-white/95 p-8 text-center">
                        <div className="w-24 h-24 bg-blue-50 rounded-full flex items-center justify-center mb-6 text-blue-600">
                            <MapPin className="w-10 h-10" />
                        </div>
                        <h3 className="text-2xl font-bold text-gray-900 mb-2">Waiting for Tourist</h3>
                        <p className="text-gray-500 max-w-xs mb-8">
                            {targetName} hasn't started sharing their location yet. You'll see them on the map once they enable sharing.
                        </p>
                        <div className="flex items-center gap-2 text-sm text-gray-400 font-medium animate-pulse">
                            <Loader2 className="w-4 h-4 animate-spin" /> Listening for signal...
                        </div>
                    </div>
                )}

                {(myPosition || targetPosition) && (
                    <MapContainer
                        center={myPosition || targetPosition || [13.0827, 80.2707]}
                        zoom={15}
                        scrollWheelZoom={true}
                        style={{ height: '100%', width: '100%' }}
                        ref={mapRef}
                    >
                        <TileLayer
                            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                        />

                        {/* Me */}
                        {myPosition && (
                            <Marker position={myPosition} icon={MyLocationIcon}>
                                <Popup>Your shared location</Popup>
                            </Marker>
                        )}

                        {/* Target (Only for guides) */}
                        {isGuide && targetPosition && (
                            <Marker position={targetPosition} icon={TargetLocationIcon}>
                                <Popup>{targetName}</Popup>
                            </Marker>
                        )}
                    </MapContainer>
                )}

                {/* Overlay Controls */}
                <div className="absolute bottom-10 left-1/2 -translate-x-1/2 z-[400] flex flex-col items-center gap-3 w-full px-8">
                    {isSharing && !isGuide && (
                        <Button
                            variant="destructive"
                            onClick={handleStopSharing}
                            className="w-full max-w-sm h-14 rounded-2xl font-bold shadow-2xl transition-all hover:scale-[1.02]"
                        >
                            <StopCircle className="w-5 h-5 mr-2" /> Stop Sharing
                        </Button>
                    )}

                    {isSharing && (
                        <div className="bg-white/90 backdrop-blur-md px-6 py-3 rounded-full shadow-2xl border border-white/20 flex items-center gap-4 text-sm font-bold text-gray-800">
                            <div className="flex items-center gap-2 text-indigo-600">
                                <div className="w-2 h-2 rounded-full bg-indigo-600 animate-pulse"></div>
                                Shared ({formatTime(timeLeft)})
                            </div>
                            <div className="h-4 w-[1px] bg-gray-300"></div>
                            <div className="flex items-center gap-2 text-gray-500">
                                <Battery className="w-4 h-4" /> Battery Safe
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
