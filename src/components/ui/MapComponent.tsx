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

interface MapComponentProps {
    center: [number, number]; // [lat, lng]
    zoom?: number;
    markers?: Array<{
        id: string | number;
        position: [number, number];
        title: string;
        description?: string;
    }>;
    className?: string;
}

// Component to handle map center updates
function MapUpdater({ center }: { center: [number, number] }) {
    const map = useMap();
    useEffect(() => {
        map.setView(center);
    }, [center, map]);
    return null;
}

export function MapComponent({ center, zoom = 13, markers = [], className = "h-[400px] w-full rounded-lg" }: MapComponentProps) {
    return (
        <MapContainer center={center} zoom={zoom} scrollWheelZoom={false} className={className} style={{ zIndex: 0 }}>
            <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            <MapUpdater center={center} />
            {markers.map((marker) => (
                <Marker key={marker.id} position={marker.position}>
                    <Popup>
                        <div className="text-sm">
                            <strong className="block font-bold">{marker.title}</strong>
                            {marker.description && <span>{marker.description}</span>}
                        </div>
                    </Popup>
                </Marker>
            ))}
        </MapContainer>
    );
}
