import 'leaflet/dist/leaflet.css';
interface LiveTrackerProps {
    bookingId: string;
    currentUser: {
        id: string;
        role: 'guide' | 'tourist';
    };
    targetName: string;
    onClose: () => void;
}
export declare function LiveTracker({ bookingId, currentUser, targetName, onClose }: LiveTrackerProps): import("react/jsx-runtime").JSX.Element;
export {};
