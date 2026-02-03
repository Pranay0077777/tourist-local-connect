import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
// Fix for default marker icon missing in React Leaflet
// @ts-ignore
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});
// Component to handle map center updates
function MapUpdater({ center }) {
    const map = useMap();
    useEffect(() => {
        map.setView(center);
    }, [center, map]);
    return null;
}
export function MapComponent({ center, zoom = 13, markers = [], className = "h-[400px] w-full rounded-lg" }) {
    return (_jsxs(MapContainer, { center: center, zoom: zoom, scrollWheelZoom: false, className: className, style: { zIndex: 0 }, children: [_jsx(TileLayer, { attribution: '\u00A9 <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors', url: "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" }), _jsx(MapUpdater, { center: center }), markers.map((marker) => (_jsx(Marker, { position: marker.position, children: _jsx(Popup, { children: _jsxs("div", { className: "text-sm", children: [_jsx("strong", { className: "block font-bold", children: marker.title }), marker.description && _jsx("span", { children: marker.description })] }) }) }, marker.id)))] }));
}
