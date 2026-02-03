interface RoleSelectionProps {
    onSelectRole: (role: 'guide' | 'tourist') => void;
    onBack: () => void;
}
export declare function RoleSelection({ onSelectRole, onBack }: RoleSelectionProps): import("react/jsx-runtime").JSX.Element;
export {};
