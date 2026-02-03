import { type LocalUser } from "@/lib/localStorage";
interface MessagesProps {
    currentUser: LocalUser;
    onNavigate: (page: string) => void;
    onLogout: () => void;
    onViewProfile: (guideId: string) => void;
    initialContactId?: string | null;
}
export declare function Messages({ currentUser, onNavigate, onLogout, onViewProfile, initialContactId }: MessagesProps): import("react/jsx-runtime").JSX.Element;
export {};
