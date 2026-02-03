import { type LocalUser } from "@/lib/localStorage";
interface CommunityFeedProps {
    user: LocalUser;
    onNavigate: (page: string) => void;
    onLogout: () => void;
}
export declare function CommunityFeed({ user, onNavigate, onLogout }: CommunityFeedProps): import("react/jsx-runtime").JSX.Element;
export {};
