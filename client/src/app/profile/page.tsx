'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { useAuthStore } from '@/lib/store';
import { getFirestoreDb } from '@/lib/firebase';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { Loader2, Camera, User, BookOpen, Save, LogOut, ShieldCheck, Brain } from 'lucide-react';
import AITestModal from '@/components/AITestModal';

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number = 0) => ({ 
    opacity: 1, y: 0, 
    transition: { delay: i * 0.05, duration: 0.4, ease: 'easeOut' as any } 
  }),
};

export default function ProfilePage() {
  const router = useRouter();
  const { user, isLoading, logout } = useAuthStore();
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [success, setSuccess] = useState(false);
  const [activeVerifySkill, setActiveVerifySkill] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    skillsTeach: '',
    skillsLearn: '',
    bio: ''
  });

  useEffect(() => {
    if (!isLoading && !user) router.push('/login');
    
    if (user) {
      setFormData(prev => ({
        ...prev,
        name: user.displayName || '',
        email: user.email || ''
      }));

      // Fetch additional profile data from Firestore
      const fetchProfile = async () => {
        try {
          const db = getFirestoreDb();
          const docRef = doc(db, 'users', user.uid);
          const docSnap = await getDoc(docRef);
          
          if (docSnap.exists()) {
            const data = docSnap.data();
            setFormData(prev => ({
              ...prev,
              skillsTeach: (data.skillsTeach || []).join(', '),
              skillsLearn: (data.skillsLearn || []).join(', '),
              bio: data.bio || ''
            }));
          }
        } catch (err) {
          console.error("Profile: Fetch error:", err);
          // Don't keep user in infinite loading if fetch fails (could be rules or offline)
          setFetching(false); 
        } finally {
          setFetching(false);
        }
      };

      fetchProfile();
    }
  }, [user, isLoading, router]);

  const handleLogout = async () => {
    await logout();
    router.push('/login');
  };

  const handleSave = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const db = getFirestoreDb();
      const docRef = doc(db, 'users', user.uid);
      
      await setDoc(docRef, {
        displayName: formData.name,
        email: formData.email,
        skillsTeach: formData.skillsTeach.split(',').map(s => s.trim()).filter(s => s),
        skillsLearn: formData.skillsLearn.split(',').map(s => s.trim()).filter(s => s),
        bio: formData.bio,
        updatedAt: serverTimestamp()
      }, { merge: true });

      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      console.error("Profile: Save error:", err);
      alert("Failed to save profile. Check your connection.");
    } finally {
      setLoading(false);
    }
  };

  if (isLoading || !user || fetching) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Loader2 style={{ width: 32, height: 32, color: '#818cf8', animation: 'spin 1s linear infinite' }} />
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', paddingTop: '96px', paddingBottom: '64px' }}>
      <div style={{ maxWidth: '800px', margin: '0 auto', padding: '0 24px' }}>
        
        <motion.div initial="hidden" animate="visible">
          {/* Profile Header */}
          <motion.div variants={fadeUp} style={{ marginBottom: '40px', textAlign: 'center' }}>
            <div style={{ position: 'relative', display: 'inline-block' }}>
              <div style={{
                width: '120px', height: '120px', borderRadius: '40px',
                background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '48px', fontWeight: 800, color: 'white',
                boxShadow: '0 20px 40px rgba(99, 102, 241, 0.2)',
                margin: '0 auto'
              }}>
                {formData.name[0] || '?'}
              </div>
              <button style={{
                position: 'absolute', bottom: '0', right: '0',
                width: '36px', height: '36px', borderRadius: '12px',
                backgroundColor: 'var(--bg-primary)', border: '1px solid var(--border-color)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: 'var(--text-secondary)', cursor: 'pointer',
                boxShadow: '0 4px 10px rgba(0,0,0,0.1)'
              }}>
                <Camera size={18} />
              </button>
            </div>
            <h1 style={{ fontSize: '28px', fontWeight: 700, marginTop: '24px', fontFamily: 'Outfit, sans-serif' }}>{formData.name}</h1>
            <p style={{ fontSize: '14px', color: 'var(--text-muted)' }}>{formData.email}</p>
          </motion.div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '24px' }}>
            {/* Account Settings */}
            <motion.div variants={fadeUp} custom={1} style={{ 
              padding: '32px', borderRadius: '24px', backgroundColor: 'var(--bg-secondary)',
              border: '1px solid var(--border-color)'
            }}>
              <h2 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                <User size={20} color="#818cf8" /> Account Information
              </h2>
              
              <div style={{ display: 'grid', gap: '20px' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                  <div>
                    <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '8px', display: 'block' }}>FULL NAME</label>
                    <input 
                      value={formData.name}
                      onChange={(e) => setFormData({...formData, name: e.target.value})}
                      placeholder="Your Name"
                      style={{
                        width: '100%', padding: '12px 16px', borderRadius: '12px', backgroundColor: 'var(--bg-tertiary)',
                        border: '1px solid var(--border-color)', color: 'var(--text-primary)', fontSize: '14px', outline: 'none'
                      }}
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '8px', display: 'block' }}>EMAIL ADDRESS</label>
                    <input 
                      value={formData.email}
                      disabled
                      style={{
                        width: '100%', padding: '12px 16px', borderRadius: '12px', backgroundColor: 'var(--bg-tertiary)',
                        border: '1px solid var(--border-color)', color: 'var(--text-muted)', fontSize: '14px', outline: 'none', cursor: 'not-allowed'
                      }}
                    />
                  </div>
                </div>

                <div>
                  <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '8px', display: 'block' }}>BIO</label>
                  <textarea 
                    value={formData.bio}
                    onChange={(e) => setFormData({...formData, bio: e.target.value})}
                    rows={3}
                    style={{
                      width: '100%', padding: '12px 16px', borderRadius: '12px', backgroundColor: 'var(--bg-tertiary)',
                      border: '1px solid var(--border-color)', color: 'var(--text-primary)', fontSize: '14px', outline: 'none', resize: 'none'
                    }}
                  />
                </div>
              </div>
            </motion.div>

            {/* Skills Mapping */}
            <motion.div variants={fadeUp} custom={2} style={{ 
              padding: '32px', borderRadius: '24px', backgroundColor: 'var(--bg-secondary)',
              border: '1px solid var(--border-color)'
            }}>
              <h2 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                <BookOpen size={20} color="#10b981" /> Skills & Expertise
              </h2>
              
              <div style={{ display: 'grid', gap: '20px' }}>
                <div>
                  <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '8px', display: 'block' }}>SKILLS YOU TEACH</label>
                  <input 
                    value={formData.skillsTeach}
                    onChange={(e) => setFormData({...formData, skillsTeach: e.target.value})}
                    placeholder="e.g. React, Photography, Spanish"
                    style={{
                      width: '100%', padding: '12px 16px', borderRadius: '12px', backgroundColor: 'var(--bg-tertiary)',
                      border: '1px solid var(--border-color)', color: 'var(--text-primary)', fontSize: '14px', outline: 'none'
                    }}
                  />
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginTop: '12px' }}>
                    {formData.skillsTeach.split(',').map(s => s.trim()).filter(s => s).map(skill => {
                      const verification = user.skillVerifications?.[skill];
                      const isVerified = verification?.status === 'verified';
                      
                      return (
                        <div key={skill} style={{ 
                          display: 'flex', alignItems: 'center', gap: '8px', 
                          padding: '6px 12px', borderRadius: '10px', 
                          backgroundColor: isVerified ? 'rgba(16, 185, 129, 0.1)' : 'rgba(255, 255, 255, 0.05)',
                          border: `1px solid ${isVerified ? 'rgba(16, 185, 129, 0.2)' : 'rgba(255, 255, 255, 0.1)'}`
                        }}>
                          <span style={{ fontSize: '13px', fontWeight: 600, color: isVerified ? '#34d399' : 'var(--text-primary)' }}>{skill}</span>
                          {isVerified ? (
                            <ShieldCheck size={14} color="#34d399" />
                          ) : (
                            <button 
                              onClick={() => { setActiveVerifySkill(skill); setIsModalOpen(true); }}
                              style={{ 
                                background: 'rgba(99, 102, 241, 0.1)', border: 'none', 
                                padding: '2px 8px', borderRadius: '6px', 
                                color: '#818cf8', fontSize: '11px', fontWeight: 700, 
                                cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px'
                              }}
                            >
                              <Brain size={12} /> Verify
                            </button>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
                <div>
                  <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '8px', display: 'block' }}>SKILLS YOU WANT TO LEARN</label>
                  <input 
                    value={formData.skillsLearn}
                    onChange={(e) => setFormData({...formData, skillsLearn: e.target.value})}
                    placeholder="e.g. Piano, French, Marketing"
                    style={{
                      width: '100%', padding: '12px 16px', borderRadius: '12px', backgroundColor: 'var(--bg-tertiary)',
                      border: '1px solid var(--border-color)', color: 'var(--text-primary)', fontSize: '14px', outline: 'none'
                    }}
                  />
                </div>
              </div>
            </motion.div>

            {/* Actions */}
            <motion.div variants={fadeUp} custom={3} style={{ display: 'flex', gap: '16px', justifyContent: 'space-between' }}>
              <button 
                onClick={handleLogout}
                style={{
                  padding: '14px 24px', borderRadius: '16px', fontSize: '15px', fontWeight: 700,
                  backgroundColor: 'rgba(239, 68, 68, 0.1)', color: '#f87171', border: '1px solid rgba(239, 68, 68, 0.2)',
                  cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '10px'
                }}
              >
                <LogOut size={18} /> Logout
              </button>
              
              <button 
                onClick={handleSave}
                disabled={loading}
                style={{
                  padding: '14px 40px', borderRadius: '16px', fontSize: '15px', fontWeight: 700,
                  background: success ? '#10b981' : 'linear-gradient(135deg, #6366f1, #8b5cf6)', 
                  color: 'white', border: 'none', cursor: 'pointer',
                  display: 'flex', alignItems: 'center', gap: '10px',
                  boxShadow: '0 4px 15px rgba(99, 102, 241, 0.3)',
                  transition: 'all 0.3s'
                }}
              >
                {loading ? <Loader2 size={18} style={{ animation: 'spin 1s linear infinite' }} /> : success ? 'Settings Saved!' : <><Save size={18} /> Save Profile</>}
              </button>
            </motion.div>
          </div>
        </motion.div>

        {activeVerifySkill && (
          <AITestModal 
            skill={activeVerifySkill} 
            isOpen={isModalOpen} 
            onClose={() => setIsModalOpen(false)} 
          />
        )}
      </div>
    </div>
  );
}
