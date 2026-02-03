import { type LocalUser } from "@/lib/localStorage";
interface ProfileStatsPageProps {
    user: LocalUser;
    onNavigate: (page: string) => void;
    onLogout: () => void;
}
export declare function ProfileStatsPage({ user, onNavigate, onLogout }: ProfileStatsPageProps): import("react/jsx-runtime").JSX.Element;
export {};
