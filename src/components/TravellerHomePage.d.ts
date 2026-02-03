import { type LocalUser } from "@/lib/localStorage";
interface TravellerHomePageProps {
    user: LocalUser;
    onNavigate: (page: string, params?: unknown) => void;
    onLogout: () => void;
}
export declare function TravellerHomePage({ user, onNavigate, onLogout }: TravellerHomePageProps): import("react/jsx-runtime").JSX.Element;
export {};
