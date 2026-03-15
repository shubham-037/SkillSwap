'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuthStore } from '@/lib/store';
import { getFirestoreDb } from '@/lib/firebase';
import { 
  collection, query, where, doc, 
  updateDoc, getDoc, onSnapshot 
} from 'firebase/firestore';
import { Loader2, CheckCircle, XCircle, Clock, Users, MessageSquare, ArrowRight } from 'lucide-react';

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number = 0) => ({ 
    opacity: 1, y: 0, 
    transition: { delay: i * 0.05, duration: 0.4, ease: 'easeOut' as any } 
  }),
};

export default function MatchesPage() {
  const router = useRouter();
  const { user, isLoading } = useAuthStore();
  const [matches, setMatches] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<'all' | 'pending' | 'accepted'>('all');
  const [responding, setResponding] = useState<string | null>(null);

  useEffect(() => {
    if (!isLoading && !user) router.push('/login');

    if (user) {
      const db = getFirestoreDb();
      
      // Query matches where current user is either userA or userB
      const q1 = query(collection(db, 'matches'), where('userA', '==', user.uid));
      const q2 = query(collection(db, 'matches'), where('userB', '==', user.uid));

      const unsubscribe1 = onSnapshot(q1, async (snapshot) => {
        try {
          const matchesA = await Promise.all(snapshot.docs.map(async (d) => {
            const data = d.data();
            const partnerSnap = await getDoc(doc(db, 'users', data.userB));
            return { id: d.id, ...data, partner: partnerSnap.data(), partnerId: data.userB };
          }));
          
          setMatches(prev => {
            const otherMatches = prev.filter(m => m.userA !== user.uid);
            return [...otherMatches, ...matchesA];
          });
          setLoading(false);
        } catch (err) {
          console.error("Matches: q1 processing error:", err);
          setLoading(false);
        }
      }, (error) => {
        console.error("Matches: q1 snapshot error:", error);
        setLoading(false);
      });

      const unsubscribe2 = onSnapshot(q2, async (snapshot) => {
        try {
          const matchesB = await Promise.all(snapshot.docs.map(async (d) => {
            const data = d.data();
            const partnerSnap = await getDoc(doc(db, 'users', data.userA));
            return { id: d.id, ...data, partner: partnerSnap.data(), partnerId: data.userA };
          }));
          
          setMatches(prev => {
            const otherMatches = prev.filter(m => m.userB !== user.uid);
            return [...otherMatches, ...matchesB];
          });
          setLoading(false);
        } catch (err) {
          console.error("Matches: q2 processing error:", err);
          setLoading(false);
        }
      }, (error) => {
        console.error("Matches: q2 snapshot error:", error);
        setLoading(false);
      });

      return () => {
        unsubscribe1();
        unsubscribe2();
      };
    }
  }, [user, isLoading, router]);

  const respond = async (matchId: string, status: 'accepted' | 'rejected') => {
    setResponding(matchId);
    try {
      const db = getFirestoreDb();
      await updateDoc(doc(db, 'matches', matchId), { status });
    } catch (err) {
      console.error("Matches: Respond error:", err);
      alert("Failed to update match status. Check your connection.");
    } finally {
      setResponding(null);
    }
  };

  if (isLoading || !user) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Loader2 style={{ width: 32, height: 32, color: '#818cf8', animation: 'spin 1s linear infinite' }} />
      </div>
    );
  }

  const filtered = matches.filter((m) => {
    if (tab === 'pending') return m.status === 'pending';
    if (tab === 'accepted') return m.status === 'accepted';
    return true;
  });

  return (
    <div style={{ minHeight: '100vh', paddingTop: '96px', paddingBottom: '64px' }}>
      <div style={{ maxWidth: '800px', margin: '0 auto', padding: '0 24px' }}>
        
        <motion.div initial="hidden" animate="visible">
          {/* Header */}
          <motion.div variants={fadeUp} style={{ marginBottom: '32px' }}>
            <h1 style={{ fontSize: '32px', fontWeight: 700, fontFamily: 'Outfit, sans-serif' }}>
              <span className="gradient-text">Your Matches</span>
            </h1>
            <p style={{ fontSize: '15px', color: 'var(--text-secondary)', marginTop: '6px' }}>
              Manage your skill exchange connections and requests.
            </p>
          </motion.div>

          {/* Tab Navigation */}
          <motion.div variants={fadeUp} style={{ 
            display: 'flex', gap: '8px', marginBottom: '32px',
            backgroundColor: 'var(--bg-secondary)', padding: '6px',
            borderRadius: '14px', border: '1px solid var(--border-color)',
            width: 'fit-content'
          }}>
            {(['all', 'pending', 'accepted'] as const).map((t) => (
              <button 
                key={t} 
                onClick={() => setTab(t)}
                style={{
                  padding: '10px 24px', borderRadius: '10px', fontSize: '14px', fontWeight: 600,
                  backgroundColor: tab === t ? 'rgba(99, 102, 241, 0.1)' : 'transparent',
                  color: tab === t ? '#818cf8' : 'var(--text-secondary)',
                  border: 'none', cursor: 'pointer', transition: 'all 0.2s',
                }}
              >
                {t.charAt(0).toUpperCase() + t.slice(1)}
              </button>
            ))}
          </motion.div>

          {/* Matches List */}
          {loading ? (
            <div style={{ display: 'flex', justifyContent: 'center', padding: '64px 0' }}>
              <Loader2 style={{ width: 32, height: 32, color: '#818cf8', animation: 'spin 1s linear infinite' }} />
            </div>
          ) : filtered.length === 0 ? (
            <motion.div variants={fadeUp} style={{ 
              textAlign: 'center', padding: '80px 32px', 
              border: '1px dashed var(--border-color)', borderRadius: '24px' 
            }}>
              <Users style={{ width: 48, height: 48, color: 'var(--text-muted)', marginBottom: '16px', opacity: 0.5 }} />
              <p style={{ color: 'var(--text-muted)', marginBottom: '24px' }}>No matches found in this category.</p>
              <Link href="/search" style={{
                padding: '12px 24px', borderRadius: '12px', fontSize: '14px', fontWeight: 600,
                background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                color: 'white', textDecoration: 'none',
                boxShadow: '0 4px 15px rgba(99, 102, 241, 0.3)',
              }}>
                Find Partners
              </Link>
            </motion.div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <AnimatePresence>
                {filtered.map((m, i) => {
                  const partner = m.partner || { displayName: 'Unknown', email: '' };
                  const isReceiver = m.userB === user.uid;
                  
                  return (
                    <motion.div key={m.id} variants={fadeUp} custom={i}
                      initial="hidden" animate="visible" exit={{ opacity: 0, x: -20 }}
                      style={{
                        padding: '24px', borderRadius: '20px', border: '1px solid var(--border-color)',
                        backgroundColor: 'var(--bg-secondary)', transition: 'all 0.3s',
                        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                        flexWrap: 'wrap', gap: '20px'
                      }}
                      className="hover:border-indigo-500/20"
                    >
                      <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                        <div style={{
                          width: '56px', height: '56px', borderRadius: '16px',
                          background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          fontSize: '20px', fontWeight: 700, color: 'white',
                        }}>
                          {partner.displayName ? partner.displayName[0] : '?'}
                        </div>
                        <div>
                          <h3 style={{ fontSize: '18px', fontWeight: 600 }}>{partner.displayName || 'Skill Partner'}</h3>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '4px' }}>
                            <span style={{ fontSize: '13px', color: '#34d399', fontWeight: 500 }}>{m.skillExchange?.userATeaches}</span>
                            <ArrowRight style={{ width: 12, height: 12, color: 'var(--text-muted)' }} />
                            <span style={{ fontSize: '13px', color: '#a78bfa', fontWeight: 500 }}>{m.skillExchange?.userBTeaches}</span>
                          </div>
                        </div>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        {m.status === 'accepted' ? (
                          <div style={{ display: 'flex', gap: '8px' }}>
                            <span style={{
                              padding: '8px 16px', borderRadius: '10px', fontSize: '12px', fontWeight: 600,
                              backgroundColor: 'rgba(16, 185, 129, 0.1)', color: '#34d399',
                              display: 'flex', alignItems: 'center', gap: '6px'
                            }}>
                              <CheckCircle style={{ width: 14, height: 14 }} /> Accepted
                            </span>
                            <Link href={`/chat?matchId=${m.id}`} style={{
                              padding: '8px 16px', borderRadius: '10px', fontSize: '12px', fontWeight: 600,
                              backgroundColor: 'rgba(99, 102, 241, 0.1)', color: '#818cf8',
                              border: '1px solid rgba(99, 102, 241, 0.2)', textDecoration: 'none',
                              display: 'flex', alignItems: 'center', gap: '6px'
                            }}>
                              <MessageSquare style={{ width: 14, height: 14 }} /> Chat
                            </Link>
                          </div>
                        ) : m.status === 'pending' ? (
                          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                            <span style={{
                              padding: '8px 16px', borderRadius: '10px', fontSize: '12px', fontWeight: 600,
                              backgroundColor: 'rgba(245, 158, 11, 0.1)', color: '#f59e0b',
                              display: 'flex', alignItems: 'center', gap: '6px', marginRight: '8px'
                            }}>
                              <Clock style={{ width: 14, height: 14 }} /> Pending
                            </span>
                            
                            {isReceiver && (
                              <div style={{ display: 'flex', gap: '8px' }}>
                                <button 
                                  onClick={() => respond(m.id, 'accepted')}
                                  disabled={responding === m.id}
                                  style={{
                                    padding: '8px 20px', borderRadius: '10px', fontSize: '12px', fontWeight: 600,
                                    backgroundColor: '#34d399', color: 'white', border: 'none', cursor: 'pointer',
                                  }}
                                >
                                  {responding === m.id ? <Loader2 style={{ width: 12, height: 12, animation: 'spin 1s linear infinite' }} /> : 'Accept'}
                                </button>
                                <button 
                                  onClick={() => respond(m.id, 'rejected')}
                                  disabled={responding === m.id}
                                  style={{
                                    padding: '8px 20px', borderRadius: '10px', fontSize: '12px', fontWeight: 600,
                                    backgroundColor: 'rgba(239, 68, 68, 0.1)', color: '#f87171', border: 'none', cursor: 'pointer',
                                  }}
                                >
                                  Reject
                                </button>
                              </div>
                            )}
                          </div>
                        ) : (
                          <span style={{
                            padding: '8px 16px', borderRadius: '10px', fontSize: '12px', fontWeight: 600,
                            backgroundColor: 'rgba(239, 68, 68, 0.1)', color: '#f87171',
                            display: 'flex', alignItems: 'center', gap: '6px'
                          }}>
                            <XCircle style={{ width: 14, height: 14 }} /> Rejected
                          </span>
                        )}
                      </div>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </div>
          )}
        </motion.div>

      </div>
    </div>
  );
}
