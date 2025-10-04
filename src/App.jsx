import { useAuth } from './hooks/useAuth';
import Dashboard from './pages/Dashboard';
import LoginButton from './components/LoginButton';

function App() {
  // For development: bypass authentication and go straight to dashboard
  const BYPASS_AUTH = true;
  
  const { user, loading } = useAuth();

  if (loading && !BYPASS_AUTH) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading Scholarly...</p>
        </div>
      </div>
    );
  }

  // Show dashboard directly when bypassing auth
  if (BYPASS_AUTH) {
    return <Dashboard />;
  }

  return user ? <Dashboard /> : <LoginButton />;
}

export default App;