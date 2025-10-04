import { User, Settings, LogOut, Calendar, Home } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';

export default function Header() {
  const { user, logout } = useAuth();

  const navigateToPage = (path) => {
    window.location.href = path;
  };

  return (
    <header className="bg-white border-b border-gray-200 px-6 py-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-8">
          <div className="flex items-center space-x-4">
            <h1 className="text-2xl font-bold text-blue-600">Scholarly</h1>
            <span className="text-gray-500">Academic Dashboard</span>
          </div>
          
          {/* Navigation */}
          <nav className="flex items-center space-x-6">
            <button 
              onClick={() => navigateToPage('/')}
              className="flex items-center space-x-2 text-gray-600 hover:text-blue-600 transition-colors"
            >
              <Home className="w-4 h-4" />
              <span className="text-sm font-medium">Dashboard</span>
            </button>
            <button 
              onClick={() => navigateToPage('/calendar')}
              className="flex items-center space-x-2 text-gray-600 hover:text-blue-600 transition-colors"
            >
              <Calendar className="w-4 h-4" />
              <span className="text-sm font-medium">Smart Calendar</span>
            </button>
          </nav>
        </div>
        
        <div className="flex items-center space-x-4">
          {user && (
            <>
              <div className="flex items-center space-x-2">
                <User className="w-5 h-5 text-gray-600" />
                <span className="text-sm text-gray-700">{user.name}</span>
              </div>
              <button className="p-2 text-gray-600 hover:text-gray-800">
                <Settings className="w-5 h-5" />
              </button>
              <button 
                onClick={logout}
                className="p-2 text-gray-600 hover:text-red-600"
              >
                <LogOut className="w-5 h-5" />
              </button>
            </>
          )}
        </div>
      </div>
    </header>
  );
}