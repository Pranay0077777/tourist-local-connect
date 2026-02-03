import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { MapContainer, TileLayer, Marker, Popup, Polyline } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
// Fix for default marker icon in React Leaflet
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';
let DefaultIcon = L.icon({
    iconUrl: icon,
    shadowUrl: iconShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41]
});
L.Marker.prototype.options.icon = DefaultIcon;
export function TripMap({ stops }) {
    if (!stops || stops.length === 0)
        return null;
    // Calculate center
    const centerLat = stops.reduce((sum, stop) => sum + stop.lat, 0) / stops.length;
    const centerLng = stops.reduce((sum, stop) => sum + stop.lng, 0) / stops.length;
    // Create polyline positions
    const polylinePositions = stops.map(stop => [stop.lat, stop.lng]);
    // Calculate total distance (rough Haversine approximation or accumulative)
    const calculateDistance = (lat1, lon1, lat2, lon2) => {
        const R = 6371; // km
        const dLat = (lat2 - lat1) * Math.PI / 180;
        const dLon = (lon2 - lon1) * Math.PI / 180;
        const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
                Math.sin(dLon / 2) * Math.sin(dLon / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return R * c;
    };
    let totalDistance = 0;
    for (let i = 0; i < stops.length - 1; i++) {
        totalDistance += calculateDistance(stops[i].lat, stops[i].lng, stops[i + 1].lat, stops[i + 1].lng);
    }
    return (_jsxs("div", { className: "space-y-4", children: [_jsxs("div", { className: "flex items-center justify-between", children: [_jsx("h3", { className: "text-xl font-bold text-gray-900", children: "Trip Route Map" }), _jsxs("span", { className: "bg-blue-100 text-blue-800 text-xs font-semibold mr-2 px-2.5 py-0.5 rounded", children: ["Total Distance: ~", totalDistance.toFixed(1), " km"] })] }), _jsx("div", { className: "h-[400px] w-full rounded-xl overflow-hidden shadow-lg border border-gray-100 z-0 relative", children: _jsxs(MapContainer, { center: [centerLat, centerLng], zoom: 12, scrollWheelZoom: false, style: { height: '100%', width: '100%' }, children: [_jsx(TileLayer, { attribution: '\u00A9 <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors', url: "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" }), stops.map((stop, idx) => (_jsx(Marker, { position: [stop.lat, stop.lng], children: _jsxs(Popup, { children: [_jsxs("strong", { children: [idx + 1, ". ", stop.name] }), _jsx("br", {}), stop.desc] }) }, idx))), _jsx(Polyline, { positions: polylinePositions, pathOptions: { color: 'blue', weight: 4, opacity: 0.7, dashArray: '10, 10' } })] }) })] }));
}
