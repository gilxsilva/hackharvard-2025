import { LogIn } from 'lucide-react';
import { signInWithGoogle } from '../lib/googleAuth';

export default function LoginButton() {
  const handleLogin = async () => {
    try {
      await signInWithGoogle();
    } catch (error) {
      console.error('Login failed:', error);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50">
      <div className="bg-white p-8 rounded-lg shadow-lg text-center">
        <h1 className="text-3xl font-bold text-blue-600 mb-2">Scholarly</h1>
        <p className="text-gray-600 mb-6">Your intelligent academic dashboard</p>
        
        <button
          onClick={handleLogin}
          className="flex items-center space-x-2 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
        >
          <LogIn className="w-5 h-5" />
          <span>Sign in with Google</span>
        </button>
      </div>
    </div>
  );
}