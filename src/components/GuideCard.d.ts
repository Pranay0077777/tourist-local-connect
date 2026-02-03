import { type Guide } from "@/types";
import { type LocalUser } from "@/lib/localStorage";
interface GuideCardProps {
    guide: Guide;
    user?: LocalUser | null;
    onViewProfile: (guideId: string) => void;
}
export declare function GuideCard({ guide, user, onViewProfile }: GuideCardProps): import("react/jsx-runtime").JSX.Element;
export default GuideCard;
