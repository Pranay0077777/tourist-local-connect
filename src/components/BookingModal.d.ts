import { type LocalUser } from "@/lib/localStorage";
interface BookingModalProps {
    isOpen: boolean;
    onClose: () => void;
    guideId: string;
    guideName: string;
    ratePerPerson: number;
    currentUser: LocalUser;
}
export declare function BookingModal({ isOpen, onClose, guideId, guideName, ratePerPerson, currentUser }: BookingModalProps): import("react/jsx-runtime").JSX.Element;
export {};
