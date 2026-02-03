import { type LocalUser } from "@/lib/localStorage";
interface GuideHomePageProps {
    user: LocalUser;
    onNavigate: (page: string) => void;
    onLogout: () => void;
}
export declare function GuideHomePage({ user, onNavigate, onLogout }: GuideHomePageProps): import("react/jsx-runtime").JSX.Element;
export {};
