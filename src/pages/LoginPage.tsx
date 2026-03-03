import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { me } from '../api/auth.api';
import { login } from '../api/auth.api';
import { useAuthStore } from '../store/authStore';
import { useUiStore } from '../store/uiStore';
import { toUserMessage } from '../utils/errors';
import type { User } from '../types/domain';

export const LoginPage = () => {
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);
  const setUser = useAuthStore((s) => s.setUser);
  const setMessage = useUiStore((s) => s.setMessage);
  const googleButtonRef = useRef<HTMLDivElement | null>(null);
  const [localError, setLocalError] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isCheckingSession, setIsCheckingSession] = useState(true);
  const [linkedUser, setLinkedUser] = useState<User | null>(null);
  const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID ?? '';

  const decodeJwtPayload = (jwt: string): { email?: string; name?: string; picture?: string } | null => {
    try {
      const payload = jwt.split('.')[1];
      if (!payload) return null;
      const normalized = payload.replace(/-/g, '+').replace(/_/g, '/');
      const padded = normalized.padEnd(Math.ceil(normalized.length / 4) * 4, '=');
      const binary = atob(padded);
      const bytes = Uint8Array.from(binary, (char) => char.charCodeAt(0));
      const json = new TextDecoder().decode(bytes);
      return JSON.parse(json) as { email?: string; name?: string; picture?: string };
    } catch {
      return null;
    }
  };

  useEffect(() => {
    const checkSession = async () => {
      try {
        const sessionUser = await me();
        setUser(sessionUser);
        setLinkedUser(sessionUser);
      } catch {
        setLinkedUser(null);
      } finally {
        setIsCheckingSession(false);
      }
    };
    void checkSession();
  }, [setUser]);

  useEffect(() => {
    if (isCheckingSession) return;
    if (linkedUser) return;
    if (!clientId) {
      setLocalError('Google Client ID가 설정되지 않았습니다.');
      return;
    }

    const init = () => {
      if (!window.google?.accounts?.id || !googleButtonRef.current) return;
      window.google.accounts.id.initialize({
        client_id: clientId,
        callback: async ({ credential }) => {
          if (!credential) {
            setLocalError('Google 인증 토큰을 받지 못했습니다.');
            return;
          }

          const payload = decodeJwtPayload(credential);
          const googleAccount = payload?.email;
          const displayName = payload?.name;
          const picture = payload?.picture;

          if (!googleAccount) {
            setLocalError('Google 계정(email) 정보를 확인할 수 없습니다.');
            return;
          }

          setIsProcessing(true);
          setLocalError('');
          try {
            const user = await login({
              googleAccount,
              token: credential,
              name: displayName || googleAccount,
              profileImage: picture,
            });
            setUser(user);
            navigate('/');
          } catch (error) {
            const next = toUserMessage(error);
            setLocalError(next);
            setMessage(next);
          } finally {
            setIsProcessing(false);
          }
        },
      });

      googleButtonRef.current.innerHTML = '';
      window.google.accounts.id.renderButton(googleButtonRef.current, {
        theme: 'outline',
        size: 'large',
        text: 'signin_with',
        shape: 'pill',
        width: 320,
      });
    };

    const existing = document.getElementById('google-gsi-sdk') as HTMLScriptElement | null;
    if (existing) {
      init();
      return;
    }

    const script = document.createElement('script');
    script.id = 'google-gsi-sdk';
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.defer = true;
    script.onload = init;
    script.onerror = () => setLocalError('Google 로그인 스크립트를 불러오지 못했습니다.');
    document.head.appendChild(script);
  }, [clientId, isCheckingSession, linkedUser, navigate, setMessage, setUser]);

  if (isCheckingSession) {
    return (
      <main className="login-page">
        <section className="login-box">
          <div className="login-badge">Personal Workspace</div>
          <h1>Post-it Board</h1>
          <p>세션 확인 중...</p>
        </section>
      </main>
    );
  }

  return (
    <main className="login-page">
      <section className="login-box">
        <div className="login-badge">Personal Workspace</div>
        <h1>Post-it Board</h1>
        {linkedUser || user ? (
          <>
            <p>연결된 계정으로 계속 진행합니다.</p>
            <div className="linked-user">
              <span>{(linkedUser ?? user)?.name ?? (linkedUser ?? user)?.userId}</span>
              <small>{(linkedUser ?? user)?.userId}</small>
            </div>
            <button className="go-main-btn" onClick={() => navigate('/')}>
              메인으로 들어가기
            </button>
          </>
        ) : (
          <>
            <p>정돈된 아이디어 보드를 바로 시작하세요.</p>
            <div className="google-btn-wrap" ref={googleButtonRef} />
          </>
        )}
        {isProcessing && <p className="login-meta">로그인 처리 중...</p>}
        {localError && <p className="login-error">{localError}</p>}
        <div className="login-footnote">Google 계정 인증 후 자동으로 개인 보드가 연결됩니다.</div>
      </section>
    </main>
  );
};
