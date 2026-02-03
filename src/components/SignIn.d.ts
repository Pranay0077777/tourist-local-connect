interface SignInProps {
    role: 'guide' | 'tourist';
    onSuccess: () => void;
    onBack: () => void;
    onSwitchToSignUp: () => void;
}
export declare function SignIn({ role, onSuccess, onBack, onSwitchToSignUp }: SignInProps): import("react/jsx-runtime").JSX.Element;
export {};
