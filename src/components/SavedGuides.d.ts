import { type LocalUser } from "@/lib/localStorage";
interface SavedGuidesProps {
    user: LocalUser;
    onNavigate: (page: string) => void;
    onLogout: () => void;
    onViewProfile: (guideId: string) => void;
}
export declare function SavedGuides({ user, onNavigate, onLogout, onViewProfile }: SavedGuidesProps): import("react/jsx-runtime").JSX.Element;
export {};
