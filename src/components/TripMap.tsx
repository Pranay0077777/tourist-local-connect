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

interface TripMapProps {
    stops: { name: string; lat: number; lng: number; desc: string }[];
}

export function TripMap({ stops }: TripMapProps) {
    if (!stops || stops.length === 0) return null;

    // Calculate center
    const centerLat = stops.reduce((sum, stop) => sum + stop.lat, 0) / stops.length;
    const centerLng = stops.reduce((sum, stop) => sum + stop.lng, 0) / stops.length;

    // Create polyline positions
    const polylinePositions = stops.map(stop => [stop.lat, stop.lng] as [number, number]);

    // Calculate total distance (rough Haversine approximation or accumulative)
    const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
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

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <h3 className="text-xl font-bold text-gray-900">Trip Route Map</h3>
                <span className="bg-blue-100 text-blue-800 text-xs font-semibold mr-2 px-2.5 py-0.5 rounded">
                    Total Distance: ~{totalDistance.toFixed(1)} km
                </span>
            </div>

            <div className="h-[400px] w-full rounded-xl overflow-hidden shadow-lg border border-gray-100 z-0 relative">
                <MapContainer
                    center={[centerLat, centerLng]}
                    zoom={12}
                    scrollWheelZoom={false}
                    style={{ height: '100%', width: '100%' }}
                >
                    <TileLayer
                        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    />

                    {stops.map((stop, idx) => (
                        <Marker key={idx} position={[stop.lat, stop.lng]}>
                            <Popup>
                                <strong>{idx + 1}. {stop.name}</strong><br />
                                {stop.desc}
                            </Popup>
                        </Marker>
                    ))}

                    <Polyline
                        positions={polylinePositions}
                        pathOptions={{ color: 'blue', weight: 4, opacity: 0.7, dashArray: '10, 10' }}
                    />
                </MapContainer>
            </div>
        </div>
    );
}
