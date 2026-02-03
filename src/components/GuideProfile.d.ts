import { type LocalUser } from "@/lib/localStorage";
interface GuideProfileProps {
    guideId: string;
    onBack: () => void;
    currentUser: LocalUser;
    onNavigate: (page: string, params?: any) => void;
}
export declare function GuideProfile({ guideId, onBack, currentUser, onNavigate }: GuideProfileProps): import("react/jsx-runtime").JSX.Element;
export {};
