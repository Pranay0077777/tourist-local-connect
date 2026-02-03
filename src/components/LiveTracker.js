import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useState, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { socket } from '@/lib/socket';
import { Button } from './ui/button';
import { ArrowLeft, Loader2 } from 'lucide-react';
import L from 'leaflet';
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
export function LiveTracker({ bookingId, currentUser, targetName, onClose }) {
    const [myPosition, setMyPosition] = useState(null);
    const [targetPosition, setTargetPosition] = useState(null);
    const [error, setError] = useState(null);
    const watchIdRef = useRef(null);
    const mapRef = useRef(null);
    // 1. Setup Socket & Room
    useEffect(() => {
        if (!socket.connected)
            socket.connect();
        socket.emit('join_tracking_room', bookingId);
        socket.on('receive_location', (data) => {
            // Only update if it's the other person
            if (data.userId !== currentUser.id) {
                setTargetPosition([data.lat, data.lng]);
            }
        });
        return () => {
            socket.off('receive_location');
        };
    }, [bookingId, currentUser.id]);
    // 2. Start Geolocation Watch
    useEffect(() => {
        if (!navigator.geolocation) {
            setError("Geolocation is not supported by your browser.");
            return;
        }
        const success = (position) => {
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
        const errorFn = () => setError("Unable to retrieve your location.");
        watchIdRef.current = navigator.geolocation.watchPosition(success, errorFn, {
            enableHighAccuracy: true,
            timeout: 10000,
            maximumAge: 0
        });
        return () => {
            if (watchIdRef.current !== null)
                navigator.geolocation.clearWatch(watchIdRef.current);
        };
    }, [bookingId, currentUser.id, currentUser.role]);
    // 3. Auto-fit bounds logic
    useEffect(() => {
        if (myPosition && targetPosition && mapRef.current) {
            const bounds = L.latLngBounds([myPosition, targetPosition]);
            mapRef.current.fitBounds(bounds, { padding: [50, 50] });
        }
        else if (myPosition && mapRef.current && !targetPosition) {
            mapRef.current.setView(myPosition, 15);
        }
    }, [myPosition, targetPosition]);
    return (_jsxs("div", { className: "fixed inset-0 z-50 bg-white flex flex-col animate-in fade-in zoom-in-95 duration-200", children: [_jsxs("div", { className: "bg-white px-4 py-3 border-b flex items-center justify-between shadow-sm z-10", children: [_jsxs(Button, { variant: "ghost", size: "sm", onClick: onClose, children: [_jsx(ArrowLeft, { className: "w-5 h-5 mr-1" }), " Back"] }), _jsxs("div", { children: [_jsx("h2", { className: "font-bold text-lg text-center", children: "Live Tracking" }), _jsx("p", { className: "text-xs text-gray-500 text-center", children: targetPosition ? `Tracking ${targetName}` : `Waiting for ${targetName}...` })] }), _jsx("div", { className: "w-16" }), " "] }), _jsxs("div", { className: "flex-1 relative bg-gray-100", children: [error && (_jsx("div", { className: "absolute top-4 left-4 right-4 z-[1000] bg-red-100 text-red-700 p-3 rounded-lg text-sm text-center border border-red-200", children: error })), !myPosition && !error && (_jsxs("div", { className: "absolute inset-0 flex flex-col items-center justify-center z-[1000] bg-white/80 backdrop-blur-sm", children: [_jsx(Loader2, { className: "w-10 h-10 text-primary animate-spin mb-4" }), _jsx("p", { className: "text-gray-600 font-medium", children: "Acquiring GPS Signal..." })] })), myPosition && (_jsxs(MapContainer, { center: myPosition, zoom: 15, scrollWheelZoom: true, style: { height: '100%', width: '100%' }, ref: mapRef, children: [_jsx(TileLayer, { attribution: '\u00A9 <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors', url: "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" }), _jsx(Marker, { position: myPosition, icon: MyLocationIcon, children: _jsx(Popup, { children: "You" }) }), targetPosition && (_jsx(Marker, { position: targetPosition, icon: TargetLocationIcon, children: _jsx(Popup, { children: targetName }) }))] })), _jsx("div", { className: "absolute bottom-6 left-1/2 -translate-x-1/2 z-[400] flex gap-2", children: _jsxs("div", { className: "bg-white px-4 py-2 rounded-full shadow-lg flex items-center gap-2 text-sm font-medium text-gray-700", children: [_jsx("span", { className: "w-2 h-2 rounded-full bg-green-500 animate-pulse" }), "Live Shared"] }) })] })] }));
}
