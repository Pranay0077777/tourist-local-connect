import { type LocalUser } from "@/lib/localStorage";
interface EarningsPageProps {
    user: LocalUser;
    onNavigate: (page: string) => void;
    onLogout: () => void;
}
export declare function EarningsPage({ user, onNavigate, onLogout }: EarningsPageProps): import("react/jsx-runtime").JSX.Element;
export {};
