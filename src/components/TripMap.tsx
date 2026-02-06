import { MapContainer, TileLayer, Marker, Popup, Polyline, LayersControl, ZoomControl } from 'react-leaflet';
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
    maximized?: boolean;
}

export function TripMap({ stops, maximized = false }: TripMapProps) {
    if (!stops || stops.length === 0) return null;

    // Calculate center
    const centerLat = stops.reduce((sum, stop) => sum + stop.lat, 0) / stops.length;
    const centerLng = stops.reduce((sum, stop) => sum + stop.lng, 0) / stops.length;

    // Create polyline positions
    const polylinePositions = stops.map(stop => [stop.lat, stop.lng] as [number, number]);

    // Calculate total distance (rough Haversine approximation)
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
        <div className="space-y-4 h-full flex flex-col">
            {!maximized && (
                <div className="flex items-center justify-between shrink-0">
                    <h3 className="text-xl font-bold text-gray-900">Trip Route Map</h3>
                    <span className="bg-primary/10 text-primary text-xs font-bold mr-2 px-3 py-1 rounded-full border border-primary/20">
                        Total Distance: ~{totalDistance.toFixed(1)} km
                    </span>
                </div>
            )}

            <div className={`w-full rounded-2xl overflow-hidden shadow-2xl border-4 border-white z-0 relative flex-1 ${maximized ? 'h-full border-none rounded-none shadow-none' : 'h-[400px]'}`}>
                {/* Global CSS to shift zoom controls in maximized mode */}
                {maximized && (
                    <style>{`
                        .leaflet-top.leaflet-left {
                            top: 88px !important;
                            left: 14px !important;
                        }
                    `}</style>
                )}
                <MapContainer
                    center={[centerLat, centerLng]}
                    zoom={maximized ? 14 : 12}
                    scrollWheelZoom={true}
                    zoomControl={false}
                    style={{ height: '100%', width: '100%' }}
                >
                    <ZoomControl position="topleft" />
                    <LayersControl position="topright">
                        <LayersControl.BaseLayer checked name="Street View">
                            <TileLayer
                                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                            />
                        </LayersControl.BaseLayer>
                        <LayersControl.BaseLayer name="Satellite View">
                            <TileLayer
                                attribution='Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community'
                                url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
                            />
                        </LayersControl.BaseLayer>
                    </LayersControl>

                    {stops.map((stop, idx) => (
                        <Marker key={idx} position={[stop.lat, stop.lng]}>
                            <Popup minWidth={200}>
                                <div className="p-1">
                                    <p className="text-primary font-bold text-sm mb-1">{idx + 1}. {stop.name}</p>
                                    <p className="text-gray-600 text-xs leading-tight m-0">{stop.desc}</p>
                                </div>
                            </Popup>
                        </Marker>
                    ))}

                    <Polyline
                        positions={polylinePositions}
                        pathOptions={{ color: '#4f46e5', weight: 5, opacity: 0.8, dashArray: '12, 12' }}
                    />
                </MapContainer>
            </div>
        </div>
    );
}
