import { useState, useCallback } from 'react';
import { Routes, Route, Navigate } from 'react-router';
import Home from './pages/Home';
import Login from './pages/Login';
import SplashScreen from './pages/SplashScreen';
import { useAuth } from './hooks/useAuth';

export default function App() {
  const { user, isLoading, login, register, logout } = useAuth();
  const [showSplash, setShowSplash] = useState(true);

  const handleSplashComplete = useCallback(() => {
    setShowSplash(false);
  }, []);

  if (showSplash) {
    return <SplashScreen onComplete={handleSplashComplete} />;
  }

  if (isLoading) {
    return (
      <div className="min-h-screen w-full bg-[#f1f5f6] flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-[#e1b2b2]/30 border-t-[#e1b2b2] rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <Routes>
      <Route path="/login" element={
        user ? <Navigate to="/" replace /> : <Login onLogin={login} onRegister={register} />
      } />
      <Route path="/" element={<Home user={user} onLogout={logout} />} />
    </Routes>
  );
}
