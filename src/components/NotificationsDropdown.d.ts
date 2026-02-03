import { type LocalUser } from "@/lib/localStorage";
interface NotificationsDropdownProps {
    user: LocalUser;
    onNavigate: (page: string) => void;
}
export declare function NotificationsDropdown({ user, onNavigate }: NotificationsDropdownProps): import("react/jsx-runtime").JSX.Element;
export {};
