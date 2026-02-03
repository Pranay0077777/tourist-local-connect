import { type LocalUser } from "@/lib/localStorage";
interface ProfileSettingsProps {
    user: LocalUser;
    onNavigate: (page: string) => void;
    onLogout: () => void;
}
export declare function ProfileSettings({ user, onNavigate, onLogout }: ProfileSettingsProps): import("react/jsx-runtime").JSX.Element;
export {};
