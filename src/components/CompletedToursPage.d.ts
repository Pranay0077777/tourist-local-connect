import { type LocalUser } from "@/lib/localStorage";
interface CompletedToursPageProps {
    user: LocalUser;
    onNavigate: (page: string) => void;
    onLogout: () => void;
}
export declare function CompletedToursPage({ user, onNavigate, onLogout }: CompletedToursPageProps): import("react/jsx-runtime").JSX.Element;
export {};
