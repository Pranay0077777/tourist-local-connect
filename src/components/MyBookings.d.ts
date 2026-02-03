import { type LocalUser } from "@/lib/localStorage";
interface MyBookingsProps {
    user: LocalUser;
    onNavigate: (page: string) => void;
    onLogout: () => void;
}
export declare function MyBookings({ user, onNavigate }: MyBookingsProps): import("react/jsx-runtime").JSX.Element;
export {};
