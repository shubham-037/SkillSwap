'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuthStore } from '@/lib/store';
import { getFirestoreDb } from '@/lib/firebase';
import { 
  collection, query, where, getDocs, addDoc, 
  serverTimestamp, doc, getDoc 
} from 'firebase/firestore';
import { 
  Search as SearchIcon, Filter, Zap, 
  Star, Loader2, CheckCircle, ShieldCheck
} from 'lucide-react';

interface SearchUser {
  id: string;
  displayName?: string;
  email?: string;
  bio?: string;
  skillsTeach?: string[];
  skillsLearn?: string[];
  skillVerifications?: {
    [key: string]: {
      status: string;
    }
  };
}

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number = 0) => ({ 
    opacity: 1, y: 0, 
    transition: { delay: i * 0.05, duration: 0.4, ease: 'easeOut' as any } 
  }),
};

export default function SearchPage() {
  const router = useRouter();
  const { user, isLoading } = useAuthStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [results, setResults] = useState<SearchUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [requesting, setRequesting] = useState<string | null>(null);
  const [requested, setRequested] = useState<string[]>([]);
  const [myProfile, setMyProfile] = useState<SearchUser | null>(null);

  useEffect(() => {
    if (!isLoading && !user) router.push('/login');
    
    if (user) {
      const fetchUsers = async () => {
        try {
          const db = getFirestoreDb();
          
          // Fetch my profile to know what I teach
          const meRef = doc(db, 'users', user.uid);
          const meSnap = await getDoc(meRef);
          if (meSnap.exists()) setMyProfile({ id: meSnap.id, ...meSnap.data() } as SearchUser);

          const q = query(collection(db, 'users'), where('email', '!=', user.email));
          const querySnapshot = await getDocs(q);
          const users: SearchUser[] = [];
          querySnapshot.forEach((doc) => {
            users.push({ id: doc.id, ...doc.data() });
          });
          setResults(users);
        } catch (err) {
          console.error("Search: Fetch error:", err);
          setLoading(false);
        } finally {
          setLoading(false);
        }
      };
      fetchUsers();
    }
  }, [user, isLoading, router]);

  const sendMatchRequest = async (targetUser: SearchUser) => {
    if (!user || !myProfile) return;
    setRequesting(targetUser.id);
    
    try {
      const db = getFirestoreDb();
      await addDoc(collection(db, 'matches'), {
        userA: user.uid,
        userB: targetUser.id,
        status: 'pending',
        skillExchange: {
          userATeaches: myProfile.skillsTeach?.[0] || 'Something',
          userBTeaches: targetUser.skillsTeach?.[0] || 'Something'
        },
        timestamp: serverTimestamp()
      });
      
      setRequested([...requested, targetUser.id]);
    } catch (err) {
      console.error("Search: Request error:", err);
      alert("Failed to send match request. Check your connection.");
    } finally {
      setRequesting(null);
    }
  };

  if (isLoading || !user) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Loader2 style={{ width: 32, height: 32, color: '#818cf8', animation: 'spin 1s linear infinite' }} />
      </div>
    );
  }

  const filtered = results.filter(u => 
    (u.displayName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (u.skillsTeach || []).some((s: string) => (s || '').toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div style={{ minHeight: '100vh', paddingTop: '96px', paddingBottom: '64px' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 24px' }}>
        
        {/* Search Header */}
        <div style={{ marginBottom: '48px', textAlign: 'center' }}>
          <motion.h1 
            initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
            style={{ fontSize: '36px', fontWeight: 800, marginBottom: '16px', fontFamily: 'Outfit, sans-serif' }}
          >
            Find your <span className="gradient-text">Skill Partner</span>
          </motion.h1>
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
            style={{ 
              maxWidth: '600px', margin: '0 auto', position: 'relative',
              display: 'flex', gap: '12px'
            }}
          >
            <div style={{ position: 'relative', flex: 1 }}>
              <SearchIcon style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} size={20} />
              <input 
                type="text" 
                placeholder="Search by skill (e.g. React, Spanish, Piano...)"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{
                  width: '100%', padding: '16px 16px 16px 52px', borderRadius: '16px',
                  backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border-color)',
                  color: 'var(--text-primary)', fontSize: '15px', outline: 'none', transition: 'all 0.3s'
                }}
                className="focus:border-indigo-500/50 focus:ring-4 focus:ring-indigo-500/10"
              />
            </div>
            <button style={{
              padding: '0 20px', borderRadius: '16px', backgroundColor: 'var(--bg-secondary)',
              border: '1px solid var(--border-color)', color: 'var(--text-primary)', cursor: 'pointer'
            }}>
              <Filter size={20} />
            </button>
          </motion.div>
        </div>

        {/* Results Grid */}
        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: '100px 0' }}>
            <Loader2 style={{ width: 48, height: 48, color: '#818cf8', animation: 'spin 1s linear infinite' }} />
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '24px' }}>
            <AnimatePresence>
              {filtered.map((u, i) => (
                <motion.div
                  key={u.id}
                  variants={fadeUp}
                  initial="hidden"
                  animate="visible"
                  custom={i}
                  style={{
                    backgroundColor: 'var(--bg-secondary)', borderRadius: '24px', padding: '24px',
                    border: '1px solid var(--border-color)', display: 'flex', flexDirection: 'column',
                    gap: '20px', transition: 'all 0.3s'
                  }}
                  className="hover:border-indigo-500/20 hover:shadow-xl hover:shadow-indigo-500/5"
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                      <div style={{
                        width: '56px', height: '56px', borderRadius: '18px',
                        background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: '22px', fontWeight: 800, color: 'white'
                      }}>
                        {u.displayName ? u.displayName[0] : '?'}
                      </div>
                      <div>
                        <h3 style={{ fontSize: '18px', fontWeight: 700 }}>{u.displayName}</h3>
                        <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>{u.bio ? u.bio.substring(0, 40) + '...' : 'Available for exchange'}</p>
                      </div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px', backgroundColor: 'rgba(245, 158, 11, 0.1)', padding: '4px 8px', borderRadius: '8px' }}>
                      <Star size={14} fill="#f59e0b" color="#f59e0b" />
                      <span style={{ fontSize: '13px', fontWeight: 700, color: '#f59e0b' }}>4.9</span>
                    </div>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    <div>
                      <p style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '8px' }}>Teaches</p>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                        {(u.skillsTeach || ['No skills added']).map((s: string) => {
                          const isVerified = u.skillVerifications?.[s]?.status === 'verified';
                          return (
                            <span 
                              key={s} 
                              style={{ 
                                display: 'flex', alignItems: 'center', gap: '4px',
                                padding: '6px 12px', borderRadius: '8px', 
                                backgroundColor: isVerified ? 'rgba(16, 185, 129, 0.1)' : 'rgba(52, 211, 153, 0.1)', 
                                color: isVerified ? '#34d399' : '#34d399', 
                                fontSize: '12px', fontWeight: 600,
                                border: isVerified ? '1px solid rgba(16, 185, 129, 0.3)' : 'none'
                              }}
                            >
                              {s}
                              {isVerified && <ShieldCheck size={12} />}
                            </span>
                          );
                        })}
                      </div>
                    </div>
                    <div>
                      <p style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '8px' }}>Wants to learn</p>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                        {(u.skillsLearn || ['Everything']).map((s: string) => (
                          <span key={s} style={{ padding: '6px 12px', borderRadius: '8px', backgroundColor: 'rgba(167, 139, 250, 0.1)', color: '#a78bfa', fontSize: '12px', fontWeight: 600 }}>{s}</span>
                        ))}
                      </div>
                    </div>
                  </div>

                  <button 
                    onClick={() => sendMatchRequest(u)}
                    disabled={requesting === u.id || requested.includes(u.id)}
                    style={{
                      width: '100%', padding: '14px', borderRadius: '16px', marginTop: 'auto',
                      background: requested.includes(u.id) ? 'rgba(52, 211, 153, 0.1)' : 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                      color: requested.includes(u.id) ? '#34d399' : 'white',
                      border: 'none', cursor: 'pointer', fontWeight: 700, fontSize: '14px',
                      display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                      transition: 'all 0.3s'
                    }}
                  >
                    {requesting === u.id ? <Loader2 size={18} style={{ animation: 'spin 1s linear infinite' }} /> : requested.includes(u.id) ? <><CheckCircle size={18} /> Request Sent</> : <><Zap size={18} /> Request Match</>}
                  </button>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}

        {!loading && filtered.length === 0 && (
          <div style={{ textAlign: 'center', padding: '100px 0' }}>
            <p style={{ fontSize: '18px', color: 'var(--text-muted)' }}>No partners found matching your search.</p>
          </div>
        )}
      </div>
    </div>
  );
}
