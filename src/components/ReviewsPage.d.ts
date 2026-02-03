import { type LocalUser } from "@/lib/localStorage";
interface ReviewsPageProps {
    user: LocalUser;
    onNavigate: (page: string) => void;
    onLogout: () => void;
}
export declare function ReviewsPage({ user, onNavigate, onLogout }: ReviewsPageProps): import("react/jsx-runtime").JSX.Element;
export {};
