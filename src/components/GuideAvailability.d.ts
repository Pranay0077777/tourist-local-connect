import { type LocalUser } from "@/lib/localStorage";
interface GuideAvailabilityProps {
    user: LocalUser;
    onNavigate: (page: string) => void;
    onLogout: () => void;
}
export declare function GuideAvailability({ user, onNavigate, onLogout }: GuideAvailabilityProps): import("react/jsx-runtime").JSX.Element;
export {};
