'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { useAuthStore } from '@/lib/store';
import { Zap, Eye, EyeOff, Loader2, X, Plus } from 'lucide-react';

function getFirebaseErrorMessage(code: string): string {
  switch (code) {
    case 'auth/email-already-in-use': return 'This email is already registered. Try logging in instead.';
    case 'auth/invalid-email': return 'Please enter a valid email address.';
    case 'auth/weak-password': return 'Password must be at least 6 characters.';
    case 'auth/operation-not-allowed': return 'Email/password sign-up is not enabled. Please check Firebase console.';
    case 'auth/api-key-not-valid.-please-pass-a-valid-api-key.': return 'Firebase is not configured. Please add your Firebase config to .env.local';
    default: return 'Signup failed. Please try again.';
  }
}

export default function SignupPage() {
  const router = useRouter();
  const { signup } = useAuthStore();
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [skillTeachInput, setSkillTeachInput] = useState('');
  const [skillLearnInput, setSkillLearnInput] = useState('');
  const [skillsTeach, setSkillsTeach] = useState<string[]>([]);
  const [skillsLearn, setSkillsLearn] = useState<string[]>([]);

  const addSkill = (type: 'teach' | 'learn') => {
    const input = type === 'teach' ? skillTeachInput : skillLearnInput;
    const setSkills = type === 'teach' ? setSkillsTeach : setSkillsLearn;
    const skills = type === 'teach' ? skillsTeach : skillsLearn;
    const setInput = type === 'teach' ? setSkillTeachInput : setSkillLearnInput;

    if (input.trim() && !skills.includes(input.trim())) {
      setSkills([...skills, input.trim()]);
      setInput('');
    }
  };

  const removeSkill = (type: 'teach' | 'learn', skill: string) => {
    const setSkills = type === 'teach' ? setSkillsTeach : setSkillsLearn;
    const skills = type === 'teach' ? skillsTeach : skillsLearn;
    setSkills(skills.filter((s) => s !== skill));
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) { setError('Name is required'); return; }
    if (!email.trim()) { setError('Email is required'); return; }
    if (password.length < 6) { setError('Password must be at least 6 characters'); return; }
    if (password !== confirmPassword) { setError('Passwords do not match'); return; }
    if (skillsTeach.length === 0) { setError('Please add at least one skill to teach'); return; }
    if (skillsLearn.length === 0) { setError('Please add at least one skill to learn'); return; }

    setLoading(true);
    setError('');
    try {
      await signup({ name: name.trim(), email: email.trim(), password, skillsTeach, skillsLearn });
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
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}
        style={{ width: '100%', maxWidth: '512px' }}
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
            <h1 style={{ fontSize: '24px', fontWeight: 700, fontFamily: 'Outfit, sans-serif' }}>Create your account</h1>
            <p style={{ fontSize: '14px', color: 'var(--text-secondary)', marginTop: '4px' }}>Start exchanging skills today</p>
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
              <label style={{ display: 'block', fontSize: '14px', fontWeight: 500, marginBottom: '6px', color: 'var(--text-secondary)' }}>Full Name</label>
              <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="John Doe" style={inputStyle} />
            </div>

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

            <div>
              <label style={{ display: 'block', fontSize: '14px', fontWeight: 500, marginBottom: '6px', color: 'var(--text-secondary)' }}>Confirm Password</label>
              <input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} placeholder="••••••••" style={inputStyle} />
            </div>

            {/* Skills to Teach */}
            <div>
              <label style={{ display: 'block', fontSize: '14px', fontWeight: 500, marginBottom: '6px', color: 'var(--text-secondary)' }}>Skills you can teach</label>
              <div style={{ display: 'flex', gap: '8px' }}>
                <input value={skillTeachInput} onChange={(e) => setSkillTeachInput(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addSkill('teach'); } }}
                  placeholder="e.g. Python, Design" style={{ ...inputStyle, flex: 1 }} />
                <button type="button" onClick={() => addSkill('teach')}
                  style={{ padding: '12px', borderRadius: '12px', backgroundColor: 'rgba(99, 102, 241, 0.1)', border: '1px solid rgba(99, 102, 241, 0.2)', color: '#818cf8', cursor: 'pointer' }}>
                  <Plus style={{ width: 16, height: 16 }} />
                </button>
              </div>
              {skillsTeach.length > 0 && (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginTop: '8px' }}>
                  {skillsTeach.map((skill) => (
                    <span key={skill} style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', padding: '4px 12px', borderRadius: '9999px', fontSize: '12px', fontWeight: 500, backgroundColor: 'rgba(99, 102, 241, 0.1)', color: '#818cf8', border: '1px solid rgba(99, 102, 241, 0.2)' }}>
                      {skill}
                      <button type="button" onClick={() => removeSkill('teach', skill)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'inherit', padding: '2px' }}>
                        <X style={{ width: 12, height: 12 }} />
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Skills to Learn */}
            <div>
              <label style={{ display: 'block', fontSize: '14px', fontWeight: 500, marginBottom: '6px', color: 'var(--text-secondary)' }}>Skills you want to learn</label>
              <div style={{ display: 'flex', gap: '8px' }}>
                <input value={skillLearnInput} onChange={(e) => setSkillLearnInput(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addSkill('learn'); } }}
                  placeholder="e.g. Guitar, Marketing" style={{ ...inputStyle, flex: 1 }} />
                <button type="button" onClick={() => addSkill('learn')}
                  style={{ padding: '12px', borderRadius: '12px', backgroundColor: 'rgba(99, 102, 241, 0.1)', border: '1px solid rgba(99, 102, 241, 0.2)', color: '#818cf8', cursor: 'pointer' }}>
                  <Plus style={{ width: 16, height: 16 }} />
                </button>
              </div>
              {skillsLearn.length > 0 && (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginTop: '8px' }}>
                  {skillsLearn.map((skill) => (
                    <span key={skill} style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', padding: '4px 12px', borderRadius: '9999px', fontSize: '12px', fontWeight: 500, backgroundColor: 'rgba(16, 185, 129, 0.1)', color: '#34d399', border: '1px solid rgba(16, 185, 129, 0.2)' }}>
                      {skill}
                      <button type="button" onClick={() => removeSkill('learn', skill)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'inherit', padding: '2px' }}>
                        <X style={{ width: 12, height: 12 }} />
                      </button>
                    </span>
                  ))}
                </div>
              )}
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
                marginTop: '8px',
              }}
            >
              {loading ? <Loader2 style={{ width: 16, height: 16, animation: 'spin 1s linear infinite' }} /> : 'Create Account'}
            </button>
          </form>

          <p style={{ textAlign: 'center', fontSize: '14px', color: 'var(--text-secondary)', marginTop: '24px' }}>
            Already have an account?{' '}
            <Link href="/login" style={{ color: '#818cf8', textDecoration: 'none', fontWeight: 500 }}>Sign in</Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
}
