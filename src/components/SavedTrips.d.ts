import { type LocalUser } from "@/lib/localStorage";
interface SavedTripsProps {
    user: LocalUser;
    onNavigate: (page: string) => void;
    onLogout: () => void;
}
export declare function SavedTrips({ user, onNavigate, onLogout }: SavedTripsProps): import("react/jsx-runtime").JSX.Element;
export {};
