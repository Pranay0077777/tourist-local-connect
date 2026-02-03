import { type LocalUser } from "@/lib/localStorage";
interface RoleAwareHeaderProps {
    user: LocalUser;
    currentPage: string;
    onNavigate: (page: string) => void;
    onLogout: () => void;
}
export declare function RoleAwareHeader({ user, currentPage, onNavigate, onLogout }: RoleAwareHeaderProps): import("react/jsx-runtime").JSX.Element;
export {};
