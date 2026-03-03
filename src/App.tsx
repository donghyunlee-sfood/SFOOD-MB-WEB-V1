import { useEffect } from 'react';
import { Navigate, Route, Routes, useLocation } from 'react-router-dom';
import { me } from './api/auth.api';
import { LoginPage } from './pages/LoginPage';
import { MainPage } from './pages/MainPage';
import { useAuthStore } from './store/authStore';
import { useUiStore } from './store/uiStore';
import { toUserMessage } from './utils/errors';

const ProtectedRoute = ({ children }: { children: JSX.Element }) => {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const sessionChecked = useAuthStore((s) => s.sessionChecked);
  const location = useLocation();

  if (!sessionChecked) return <div className="booting">세션 확인 중...</div>;
  if (!isAuthenticated) return <Navigate to="/login" state={{ from: location }} replace />;
  return children;
};

export const App = () => {
  const setUser = useAuthStore((s) => s.setUser);
  const setSessionChecked = useAuthStore((s) => s.setSessionChecked);
  const setMessage = useUiStore((s) => s.setMessage);

  useEffect(() => {
    const bootstrap = async () => {
      try {
        const user = await me();
        setUser(user);
      } catch (error) {
        setUser(null);
        const msg = toUserMessage(error);
        if (!msg.includes('로그인')) setMessage(msg);
      } finally {
        setSessionChecked(true);
      }
    };
    void bootstrap();
  }, []);

  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <MainPage />
          </ProtectedRoute>
        }
      />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};
