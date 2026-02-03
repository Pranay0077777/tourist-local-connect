import { type LocalUser } from "@/lib/localStorage";
interface AdminDashboardProps {
    currentUser: LocalUser;
    onNavigate: (page: string) => void;
    onLogout: () => void;
}
export declare function AdminDashboard({ currentUser, onNavigate, onLogout }: AdminDashboardProps): import("react/jsx-runtime").JSX.Element;
export {};
