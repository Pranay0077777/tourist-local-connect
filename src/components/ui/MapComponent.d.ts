import 'leaflet/dist/leaflet.css';
interface MapComponentProps {
    center: [number, number];
    zoom?: number;
    markers?: Array<{
        id: string | number;
        position: [number, number];
        title: string;
        description?: string;
    }>;
    className?: string;
}
export declare function MapComponent({ center, zoom, markers, className }: MapComponentProps): import("react/jsx-runtime").JSX.Element;
export {};
