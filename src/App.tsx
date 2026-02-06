import { useState, useEffect, Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
import { Toaster } from 'sonner';
import { getCurrentUser, type LocalUser } from './lib/localStorage';
import { Loader2 } from 'lucide-react';

// Lazy load components for code splitting
const WelcomeScreen = lazy(() => import('./components/WelcomeScreen').then(m => ({ default: m.WelcomeScreen })));
const SignIn = lazy(() => import('./components/SignIn').then(m => ({ default: m.SignIn })));
const GuideSignUp = lazy(() => import('./components/GuideSignUp').then(m => ({ default: m.GuideSignUp })));
const TouristSignUp = lazy(() => import('./components/TouristSignUp').then(m => ({ default: m.TouristSignUp })));
const GuideHomePage = lazy(() => import('./components/GuideHomePage').then(m => ({ default: m.GuideHomePage })));
const TravellerHomePage = lazy(() => import('./components/TravellerHomePage').then(m => ({ default: m.TravellerHomePage })));
const BrowseGuides = lazy(() => import('./components/BrowseGuides').then(m => ({ default: m.BrowseGuides })));
const GuideProfile = lazy(() => import('./components/GuideProfile').then(m => ({ default: m.GuideProfile })));
const MyBookings = lazy(() => import('./components/MyBookings').then(m => ({ default: m.MyBookings })));
const Messages = lazy(() => import('./components/Messages').then(m => ({ default: m.Messages })));
const SavedGuides = lazy(() => import('./components/SavedGuides').then(m => ({ default: m.SavedGuides })));
const ProfileSettings = lazy(() => import('./components/ProfileSettings').then(m => ({ default: m.ProfileSettings })));
const GuideAvailability = lazy(() => import('./components/GuideAvailability').then(m => ({ default: m.GuideAvailability })));
const AITripPlanner = lazy(() => import('./components/AITripPlanner').then(m => ({ default: m.AITripPlanner })));
const AdminDashboard = lazy(() => import('./components/AdminDashboard').then(m => ({ default: m.AdminDashboard })));
const SavedTrips = lazy(() => import('./components/SavedTrips').then(m => ({ default: m.SavedTrips })));
const EarningsPage = lazy(() => import('./components/EarningsPage').then(m => ({ default: m.EarningsPage })));
const CompletedToursPage = lazy(() => import('./components/CompletedToursPage').then(m => ({ default: m.CompletedToursPage })));
const ProfileStatsPage = lazy(() => import('./components/ProfileStatsPage').then(m => ({ default: m.ProfileStatsPage })));
const ReviewsPage = lazy(() => import('./components/ReviewsPage').then(m => ({ default: m.ReviewsPage })));
const CommunityFeed = lazy(() => import('./components/CommunityFeed').then(m => ({ default: m.CommunityFeed })));

const LoadingFallback = () => (
  <div className="flex items-center justify-center min-h-screen bg-gray-50">
    <Loader2 className="w-8 h-8 animate-spin text-primary" />
  </div>
);

function AppContent() {
  const [currentUser, setCurrentAppStateUser] = useState<LocalUser | null>(null);
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
      // If user just logged in and we are on an auth page, the PublicRoute will handle the redirect.
      // If user just logged out and is not on an auth page, go to welcome.
      if (!user && !['/welcome', '/login/guide', '/login/tourist', '/signup/guide', '/signup/tourist'].includes(window.location.pathname)) {
        navigate('/welcome');
      }
    };

    window.addEventListener('user-session-updated', handleSessionUpdate);
    return () => window.removeEventListener('user-session-updated', handleSessionUpdate);
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('tlc_current_user');
    setCurrentAppStateUser(null);
    navigate('/welcome', { replace: true });
  };

  const handleNavigate = (page: string, params?: any) => {
    // Basic mapping from old state-based navigation to routes
    const routeMap: Record<string, string> = {
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

  const ProtectedRoute = ({ children, role }: { children: React.ReactNode, role?: 'guide' | 'tourist' }) => {
    if (!currentUser) return <Navigate to="/welcome" replace />;
    if (role && currentUser.role !== role) return <Navigate to="/" replace />;
    return <div className="animate-fade-in w-full min-h-screen">{children}</div>;
  };

  const PublicRoute = ({ children }: { children: React.ReactNode }) => {
    if (currentUser) return <Navigate to="/" replace />;
    return <>{children}</>;
  };

  return (
    <>
      <Suspense fallback={<LoadingFallback />}>
        <Routes>
          {/* Public Routes */}
          <Route path="/welcome" element={<PublicRoute><WelcomeScreen onRoleSelect={(role) => navigate(role === 'guide' ? '/login/guide' : '/login/tourist')} /></PublicRoute>} />
          <Route path="/login/guide" element={<PublicRoute><SignIn role="guide" onSuccess={() => navigate('/')} onBack={() => navigate('/welcome')} onSwitchToSignUp={() => navigate('/signup/guide')} /></PublicRoute>} />
          <Route path="/login/tourist" element={<PublicRoute><SignIn role="tourist" onSuccess={() => navigate('/')} onBack={() => navigate('/welcome')} onSwitchToSignUp={() => navigate('/signup/tourist')} /></PublicRoute>} />
          <Route path="/signup/guide" element={<PublicRoute><GuideSignUp onSuccess={() => navigate('/')} onBack={() => navigate('/login/guide')} /></PublicRoute>} />
          <Route path="/signup/tourist" element={<PublicRoute><TouristSignUp onSuccess={() => navigate('/')} onBack={() => navigate('/login/tourist')} /></PublicRoute>} />

          {/* Home Route (Dynamic based on role) */}
          <Route path="/" element={
            <ProtectedRoute>
              {currentUser?.role === 'guide' ? (
                <GuideHomePage user={currentUser!} onNavigate={handleNavigate} onLogout={handleLogout} />
              ) : (
                <TravellerHomePage user={currentUser!} onNavigate={handleNavigate} onLogout={handleLogout} />
              )}
            </ProtectedRoute>
          } />

          {/* Shared Protected Routes */}
          <Route path="/browse" element={<ProtectedRoute role="tourist"><BrowseGuides user={currentUser!} onNavigate={handleNavigate} onLogout={handleLogout} onViewProfile={(id) => navigate(`/profile/${id}`)} initialCity={location.state?.city} initialBrowseMode={location.state?.browseMode} /></ProtectedRoute>} />
          <Route path="/profile/:id" element={<ProtectedRoute><GuideProfile guideId={location.pathname.split('/').pop()!} onBack={() => navigate('/browse')} onNavigate={handleNavigate} currentUser={currentUser!} /></ProtectedRoute>} />
          <Route path="/bookings" element={<ProtectedRoute><MyBookings user={currentUser!} onNavigate={handleNavigate} onLogout={handleLogout} /></ProtectedRoute>} />
          <Route path="/messages" element={<ProtectedRoute><Messages currentUser={currentUser!} onNavigate={handleNavigate} onLogout={handleLogout} onViewProfile={(id) => navigate(`/profile/${id}`)} initialContactId={location.state?.guideId} /></ProtectedRoute>} />
          <Route path="/saved" element={<ProtectedRoute role="tourist"><SavedGuides user={currentUser!} onNavigate={handleNavigate} onLogout={handleLogout} onViewProfile={(id) => navigate(`/profile/${id}`)} /></ProtectedRoute>} />
          <Route path="/settings" element={<ProtectedRoute><ProfileSettings user={currentUser!} onNavigate={handleNavigate} onLogout={handleLogout} /></ProtectedRoute>} />
          <Route path="/community" element={<ProtectedRoute><CommunityFeed user={currentUser!} onNavigate={handleNavigate} onLogout={handleLogout} /></ProtectedRoute>} />
          <Route path="/ai-planner" element={<ProtectedRoute role="tourist"><AITripPlanner user={currentUser!} onNavigate={handleNavigate} onLogout={handleLogout} onViewProfile={(id) => navigate(`/profile/${id}`)} /></ProtectedRoute>} />

          {/* Guide Specific Routes */}
          <Route path="/availability" element={<ProtectedRoute role="guide"><GuideAvailability user={currentUser!} onNavigate={handleNavigate} onLogout={handleLogout} /></ProtectedRoute>} />
          <Route path="/earnings" element={<ProtectedRoute role="guide"><EarningsPage user={currentUser!} onNavigate={handleNavigate} onLogout={handleLogout} /></ProtectedRoute>} />
          <Route path="/completed-tours" element={<ProtectedRoute role="guide"><CompletedToursPage user={currentUser!} onNavigate={handleNavigate} onLogout={handleLogout} /></ProtectedRoute>} />
          <Route path="/stats" element={<ProtectedRoute role="guide"><ProfileStatsPage user={currentUser!} onNavigate={handleNavigate} onLogout={handleLogout} /></ProtectedRoute>} />
          <Route path="/reviews" element={<ProtectedRoute role="guide"><ReviewsPage user={currentUser!} onNavigate={handleNavigate} onLogout={handleLogout} /></ProtectedRoute>} />

          {/* Tourist Specific Routes */}
          <Route path="/saved-trips" element={<ProtectedRoute role="tourist"><SavedTrips user={currentUser!} onNavigate={handleNavigate} onLogout={handleLogout} /></ProtectedRoute>} />

          {/* Admin Route */}
          <Route path="/admin" element={<ProtectedRoute><AdminDashboard currentUser={currentUser!} onNavigate={handleNavigate} onLogout={handleLogout} /></ProtectedRoute>} />

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Suspense>
      <Toaster position="top-center" richColors />
    </>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  );
}

export default App;
