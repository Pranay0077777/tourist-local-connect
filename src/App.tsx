import { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
import { Toaster } from 'sonner';
import { getCurrentUser, type LocalUser } from './lib/localStorage';

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
  const [currentUser, setCurrentAppStateUser] = useState<LocalUser | null>(null);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const checkUser = () => {
      const user = getCurrentUser();
      setCurrentAppStateUser(user);
    };

    checkUser();

    const handleSessionUpdate = () => {
      const user = getCurrentUser();
      setCurrentAppStateUser(user);
      if (!user) navigate('/welcome');
    };

    window.addEventListener('user-session-updated', handleSessionUpdate);
    return () => window.removeEventListener('user-session-updated', handleSessionUpdate);
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('tlc_current_user');
    setCurrentAppStateUser(null);
    navigate('/welcome');
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

  return (
    <>
      <Routes>
        {/* Public Routes */}
        <Route path="/welcome" element={<WelcomeScreen onRoleSelect={(role) => navigate(role === 'guide' ? '/login/guide' : '/login/tourist')} />} />
        <Route path="/login/guide" element={<SignIn role="guide" onSuccess={() => navigate('/')} onBack={() => navigate('/welcome')} onSwitchToSignUp={() => navigate('/signup/guide')} />} />
        <Route path="/login/tourist" element={<SignIn role="tourist" onSuccess={() => navigate('/')} onBack={() => navigate('/welcome')} onSwitchToSignUp={() => navigate('/signup/tourist')} />} />
        <Route path="/signup/guide" element={<GuideSignUp onSuccess={() => navigate('/')} onBack={() => navigate('/login/guide')} />} />
        <Route path="/signup/tourist" element={<TouristSignUp onSuccess={() => navigate('/')} onBack={() => navigate('/login/tourist')} />} />

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
        <Route path="/browse" element={<ProtectedRoute role="tourist"><BrowseGuides user={currentUser!} onNavigate={handleNavigate} onLogout={handleLogout} onViewProfile={(id) => navigate(`/profile/${id}`)} /></ProtectedRoute>} />
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
