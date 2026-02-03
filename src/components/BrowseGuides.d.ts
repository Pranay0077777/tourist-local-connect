import { type LocalUser } from "@/lib/localStorage";
interface BrowseGuidesProps {
    user: LocalUser;
    onNavigate: (page: string, params?: any) => void;
    onLogout: () => void;
    onViewProfile: (guideId: string) => void;
    initialCity?: string;
    initialBrowseMode?: 'guides' | 'cities';
}
export declare function BrowseGuides({ user, onNavigate, onLogout, onViewProfile, initialCity, initialBrowseMode }: BrowseGuidesProps): import("react/jsx-runtime").JSX.Element;
export {};
