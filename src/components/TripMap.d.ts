import 'leaflet/dist/leaflet.css';
interface TripMapProps {
    stops: {
        name: string;
        lat: number;
        lng: number;
        desc: string;
    }[];
}
export declare function TripMap({ stops }: TripMapProps): import("react/jsx-runtime").JSX.Element | null;
export {};
