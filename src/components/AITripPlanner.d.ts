import { type LocalUser } from "@/lib/localStorage";
interface AITripPlannerProps {
    user: LocalUser;
    onNavigate: (page: string) => void;
    onLogout: () => void;
    onViewProfile: (guideId: string) => void;
}
export declare function AITripPlanner({ user, onNavigate, onLogout, onViewProfile }: AITripPlannerProps): import("react/jsx-runtime").JSX.Element;
export {};
