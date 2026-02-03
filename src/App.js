import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
import { Toaster } from 'sonner';
import { getCurrentUser } from './lib/localStorage';
// Auth Components
import { WelcomeScreen } from './components/WelcomeScreen';
import { SignIn } from './components/SignIn';
import { GuideSignUp } from './components/GuideSignUp';
import { TouristSignUp } from './components/TouristSignUp';
import { GuideHomePage } from './components/GuideHomePage';
import { TravellerHomePage } from './components/TravellerHomePage';
import { BrowseGuides } from './components/BrowseGuides';
import { GuideProfile } from './components/GuideProfile';
import { MyBookings } from './components/MyBookings';
import { Messages } from './components/Messages';
import { SavedGuides } from './components/SavedGuides';
import { ProfileSettings } from './components/ProfileSettings';
import { GuideAvailability } from './components/GuideAvailability';
import { AITripPlanner } from './components/AITripPlanner';
import { AdminDashboard } from './components/AdminDashboard';
import { SavedTrips } from './components/SavedTrips';
import { EarningsPage } from './components/EarningsPage';
import { CompletedToursPage } from './components/CompletedToursPage';
import { ProfileStatsPage } from './components/ProfileStatsPage';
import { ReviewsPage } from './components/ReviewsPage';
import { CommunityFeed } from './components/CommunityFeed';
function AppContent() {
    const [currentUser, setCurrentAppStateUser] = useState(null);
    const navigate = useNavigate();
    const location = useLocation();
    useEffect(() => {
        const checkUser = () => {
            const user = getCurrentUser();
            // SECURITY CHECK: If user is logged in but missing a token (stale session), 
            // they MUST re-login to work with the new backend.
            if (user && !user.token) {
                console.warn("[SECURITY] Stale session detected (No Token). Forcing logout.");
                handleLogout();
                return;
            }
            setCurrentAppStateUser(user);
        };
        checkUser();
        const handleSessionUpdate = () => {
            const user = getCurrentUser();
            setCurrentAppStateUser(user);
            if (!user)
                navigate('/welcome');
        };
        window.addEventListener('user-session-updated', handleSessionUpdate);
        return () => window.removeEventListener('user-session-updated', handleSessionUpdate);
    }, [navigate]);
    const handleLogout = () => {
        localStorage.removeItem('tlc_current_user');
        setCurrentAppStateUser(null);
        navigate('/welcome');
    };
    const handleNavigate = (page, params) => {
        // Basic mapping from old state-based navigation to routes
        const routeMap = {
            'home': '/',
            'browseGuides': '/browse',
            'guideProfile': `/profile/${params?.guideId || ''}`,
            'myBookings': '/bookings',
            'saved': '/saved',
            'calendar': '/availability',
            'messages': '/messages',
            'profile-settings': '/settings',
            'saved-trips': '/saved-trips',
            'earnings': '/earnings',
            'completed-tours': '/completed-tours',
            'profile-stats': '/stats',
            'reviews': '/reviews',
            'community': '/community',
            'admin': '/admin',
            'ai-planner': '/ai-planner'
        };
        const target = routeMap[page] || '/';
        navigate(target, { state: params });
    };
    const ProtectedRoute = ({ children, role }) => {
        if (!currentUser)
            return _jsx(Navigate, { to: "/welcome", replace: true });
        if (role && currentUser.role !== role)
            return _jsx(Navigate, { to: "/", replace: true });
        return _jsx("div", { className: "animate-fade-in w-full min-h-screen", children: children });
    };
    return (_jsxs(_Fragment, { children: [_jsxs(Routes, { children: [_jsx(Route, { path: "/welcome", element: _jsx(WelcomeScreen, { onRoleSelect: (role) => navigate(role === 'guide' ? '/login/guide' : '/login/tourist') }) }), _jsx(Route, { path: "/login/guide", element: _jsx(SignIn, { role: "guide", onSuccess: () => navigate('/'), onBack: () => navigate('/welcome'), onSwitchToSignUp: () => navigate('/signup/guide') }) }), _jsx(Route, { path: "/login/tourist", element: _jsx(SignIn, { role: "tourist", onSuccess: () => navigate('/'), onBack: () => navigate('/welcome'), onSwitchToSignUp: () => navigate('/signup/tourist') }) }), _jsx(Route, { path: "/signup/guide", element: _jsx(GuideSignUp, { onSuccess: () => navigate('/'), onBack: () => navigate('/login/guide') }) }), _jsx(Route, { path: "/signup/tourist", element: _jsx(TouristSignUp, { onSuccess: () => navigate('/'), onBack: () => navigate('/login/tourist') }) }), _jsx(Route, { path: "/", element: _jsx(ProtectedRoute, { children: currentUser?.role === 'guide' ? (_jsx(GuideHomePage, { user: currentUser, onNavigate: handleNavigate, onLogout: handleLogout })) : (_jsx(TravellerHomePage, { user: currentUser, onNavigate: handleNavigate, onLogout: handleLogout })) }) }), _jsx(Route, { path: "/browse", element: _jsx(ProtectedRoute, { role: "tourist", children: _jsx(BrowseGuides, { user: currentUser, onNavigate: handleNavigate, onLogout: handleLogout, onViewProfile: (id) => navigate(`/profile/${id}`), initialCity: location.state?.city, initialBrowseMode: location.state?.browseMode }) }) }), _jsx(Route, { path: "/profile/:id", element: _jsx(ProtectedRoute, { children: _jsx(GuideProfile, { guideId: location.pathname.split('/').pop(), onBack: () => navigate('/browse'), onNavigate: handleNavigate, currentUser: currentUser }) }) }), _jsx(Route, { path: "/bookings", element: _jsx(ProtectedRoute, { children: _jsx(MyBookings, { user: currentUser, onNavigate: handleNavigate, onLogout: handleLogout }) }) }), _jsx(Route, { path: "/messages", element: _jsx(ProtectedRoute, { children: _jsx(Messages, { currentUser: currentUser, onNavigate: handleNavigate, onLogout: handleLogout, onViewProfile: (id) => navigate(`/profile/${id}`), initialContactId: location.state?.guideId }) }) }), _jsx(Route, { path: "/saved", element: _jsx(ProtectedRoute, { role: "tourist", children: _jsx(SavedGuides, { user: currentUser, onNavigate: handleNavigate, onLogout: handleLogout, onViewProfile: (id) => navigate(`/profile/${id}`) }) }) }), _jsx(Route, { path: "/settings", element: _jsx(ProtectedRoute, { children: _jsx(ProfileSettings, { user: currentUser, onNavigate: handleNavigate, onLogout: handleLogout }) }) }), _jsx(Route, { path: "/community", element: _jsx(ProtectedRoute, { children: _jsx(CommunityFeed, { user: currentUser, onNavigate: handleNavigate, onLogout: handleLogout }) }) }), _jsx(Route, { path: "/ai-planner", element: _jsx(ProtectedRoute, { role: "tourist", children: _jsx(AITripPlanner, { user: currentUser, onNavigate: handleNavigate, onLogout: handleLogout, onViewProfile: (id) => navigate(`/profile/${id}`) }) }) }), _jsx(Route, { path: "/availability", element: _jsx(ProtectedRoute, { role: "guide", children: _jsx(GuideAvailability, { user: currentUser, onNavigate: handleNavigate, onLogout: handleLogout }) }) }), _jsx(Route, { path: "/earnings", element: _jsx(ProtectedRoute, { role: "guide", children: _jsx(EarningsPage, { user: currentUser, onNavigate: handleNavigate, onLogout: handleLogout }) }) }), _jsx(Route, { path: "/completed-tours", element: _jsx(ProtectedRoute, { role: "guide", children: _jsx(CompletedToursPage, { user: currentUser, onNavigate: handleNavigate, onLogout: handleLogout }) }) }), _jsx(Route, { path: "/stats", element: _jsx(ProtectedRoute, { role: "guide", children: _jsx(ProfileStatsPage, { user: currentUser, onNavigate: handleNavigate, onLogout: handleLogout }) }) }), _jsx(Route, { path: "/reviews", element: _jsx(ProtectedRoute, { role: "guide", children: _jsx(ReviewsPage, { user: currentUser, onNavigate: handleNavigate, onLogout: handleLogout }) }) }), _jsx(Route, { path: "/saved-trips", element: _jsx(ProtectedRoute, { role: "tourist", children: _jsx(SavedTrips, { user: currentUser, onNavigate: handleNavigate, onLogout: handleLogout }) }) }), _jsx(Route, { path: "/admin", element: _jsx(ProtectedRoute, { children: _jsx(AdminDashboard, { currentUser: currentUser, onNavigate: handleNavigate, onLogout: handleLogout }) }) }), _jsx(Route, { path: "*", element: _jsx(Navigate, { to: "/", replace: true }) })] }), _jsx(Toaster, { position: "top-center", richColors: true })] }));
}
function App() {
    return (_jsx(BrowserRouter, { children: _jsx(AppContent, {}) }));
}
export default App;
