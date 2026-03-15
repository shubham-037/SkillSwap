'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { useAuthStore } from '@/lib/store';
import { Zap, Eye, EyeOff, Loader2 } from 'lucide-react';

function getFirebaseErrorMessage(code: string): string {
  switch (code) {
    case 'auth/user-not-found': return 'No account found with this email.';
    case 'auth/wrong-password': return 'Incorrect password. Please try again.';
    case 'auth/invalid-email': return 'Please enter a valid email address.';
    case 'auth/user-disabled': return 'This account has been disabled.';
    case 'auth/too-many-requests': return 'Too many attempts. Please try again later.';
    case 'auth/invalid-credential': return 'Invalid email or password.';
    case 'auth/api-key-not-valid.-please-pass-a-valid-api-key.': return 'Firebase is not configured. Please add your Firebase config to .env.local';
    default: return 'Login failed. Please check your credentials.';
  }
}

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuthStore();
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) { setError('Email is required'); return; }
    if (password.length < 6) { setError('Password must be at least 6 characters'); return; }

    setLoading(true);
    setError('');
    try {
      await login(email.trim(), password);
      router.push('/dashboard');
    } catch (err: any) {
      const code = err?.code || '';
      setError(getFirebaseErrorMessage(code));
    } finally {
      setLoading(false);
    }
  };

  const inputStyle: React.CSSProperties = {
    width: '100%', padding: '12px 16px', borderRadius: '12px',
    backgroundColor: 'var(--bg-tertiary)', border: '1px solid var(--border-color)',
    color: 'var(--text-primary)', fontSize: '14px', outline: 'none',
    transition: 'border-color 0.2s',
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '96px 16px 48px' }}>
      <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none' }}>
        <div style={{ position: 'absolute', top: '25%', left: '25%', width: '400px', height: '400px', background: 'rgba(99, 102, 241, 0.06)', borderRadius: '50%', filter: 'blur(120px)' }} />
        <div style={{ position: 'absolute', bottom: '25%', right: '25%', width: '300px', height: '300px', background: 'rgba(139, 92, 246, 0.06)', borderRadius: '50%', filter: 'blur(100px)' }} />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        style={{ position: 'relative', width: '100%', maxWidth: '448px' }}
      >
        <div style={{
          padding: '32px', borderRadius: '16px',
          border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-secondary)',
        }}>
          <div style={{ textAlign: 'center', marginBottom: '32px' }}>
            <div style={{
              width: '48px', height: '48px', borderRadius: '12px',
              background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              margin: '0 auto 16px',
            }}>
              <Zap style={{ width: 24, height: 24, color: 'white' }} />
            </div>
            <h1 style={{ fontSize: '24px', fontWeight: 700, fontFamily: 'Outfit, sans-serif' }}>Welcome back</h1>
            <p style={{ fontSize: '14px', color: 'var(--text-secondary)', marginTop: '4px' }}>Sign in to your SkillSwap account</p>
          </div>

          {error && (
            <div style={{
              marginBottom: '16px', padding: '12px', borderRadius: '8px',
              backgroundColor: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.2)',
              color: '#f87171', fontSize: '14px',
            }}>
              {error}
            </div>
          )}

          <form onSubmit={onSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '14px', fontWeight: 500, marginBottom: '6px', color: 'var(--text-secondary)' }}>Email</label>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" style={inputStyle} />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '14px', fontWeight: 500, marginBottom: '6px', color: 'var(--text-secondary)' }}>Password</label>
              <div style={{ position: 'relative' }}>
                <input type={showPassword ? 'text' : 'password'} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" style={{ ...inputStyle, paddingRight: '40px' }} />
                <button type="button" onClick={() => setShowPassword(!showPassword)}
                  style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', padding: '4px' }}>
                  {showPassword ? <EyeOff style={{ width: 16, height: 16 }} /> : <Eye style={{ width: 16, height: 16 }} />}
                </button>
              </div>
            </div>

            <button type="submit" disabled={loading}
              style={{
                width: '100%', padding: '14px', borderRadius: '12px',
                background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                color: 'white', fontWeight: 600, fontSize: '16px',
                border: 'none', cursor: loading ? 'not-allowed' : 'pointer',
                opacity: loading ? 0.5 : 1,
                boxShadow: '0 8px 25px rgba(99, 102, 241, 0.3)',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
              }}
            >
              {loading ? <Loader2 style={{ width: 16, height: 16, animation: 'spin 1s linear infinite' }} /> : 'Sign In'}
            </button>
          </form>

          <p style={{ textAlign: 'center', fontSize: '14px', color: 'var(--text-secondary)', marginTop: '24px' }}>
            Don&apos;t have an account?{' '}
            <Link href="/signup" style={{ color: '#818cf8', textDecoration: 'none', fontWeight: 500 }}>Sign up</Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
}
