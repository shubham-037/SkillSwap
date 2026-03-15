'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuthStore } from '@/lib/store';
import { getFirestoreDb } from '@/lib/firebase';
import { 
  collection, query, where, getDocs, addDoc, 
  serverTimestamp, onSnapshot, orderBy, Timestamp 
} from 'firebase/firestore';
import { 
  Loader2, Calendar, Clock, Video, 
  Plus, X, Zap
} from 'lucide-react';

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number = 0) => ({ 
    opacity: 1, y: 0, 
    transition: { delay: i * 0.05, duration: 0.4, ease: 'easeOut' as any } 
  }),
};

export default function SessionsPage() {
  const router = useRouter();
  const { user, isLoading } = useAuthStore();
  
  const [sessions, setSessions] = useState<any[]>([]);
  const [partners, setPartners] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    partnerId: '',
    skill: '',
    date: '',
    time: ''
  });

  useEffect(() => {
    if (!isLoading && !user) router.push('/login');

    if (user) {
      const db = getFirestoreDb();
      
      // Load upcoming sessions
      const q = query(
        collection(db, 'sessions'), 
        where('participants', 'array-contains', user.uid),
        orderBy('date', 'asc')
      );

      const unsubscribe = onSnapshot(q, (snapshot) => {
        try {
          const sessionData = snapshot.docs.map(d => {
            const data = d.data();
            const dateObj = data.date?.toDate ? data.date.toDate() : new Date();
            return { 
              id: d.id, 
              ...data, 
              dateStr: dateObj.toLocaleDateString() || '', 
              timeStr: dateObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) || '' 
            };
          });
          setSessions(sessionData);
          setLoading(false);
        } catch (err) {
          console.error("Sessions: Snapshot processing error:", err);
          setLoading(false);
        }
      }, (error) => {
        console.error("Sessions: Snapshot listener error:", error);
        if (error.message.includes('index')) {
          alert("The sessions view requires a database index which may still be building. Please check back in a few minutes.");
        }
        setLoading(false);
      });

      // Load accepted matches to populate partner dropdown
      const fetchMatches = async () => {
        try {
          const qMatches = query(collection(db, 'matches'), where('userA', '==', user.uid), where('status', '==', 'accepted'));
          const qMatchesB = query(collection(db, 'matches'), where('userB', '==', user.uid), where('status', '==', 'accepted'));
          const [s1, s2] = await Promise.all([getDocs(qMatches), getDocs(qMatchesB)]);
          const all = [...s1.docs, ...s2.docs].map(d => ({ id: d.id, ...d.data() }));
          setPartners(all);
        } catch (err) {
          console.error("Sessions: Fetch matches error:", err);
        }
      };

      fetchMatches();
      return () => unsubscribe();
    }
  }, [user, isLoading, router]);

  const scheduleSession = async () => {
    if (!user || !formData.partnerId || !formData.date || !formData.time) return;
    setSubmitting(true);
    
    try {
      const db = getFirestoreDb();
      const combinedDate = new Date(`${formData.date}T${formData.time}`);
      
      const match = partners.find(p => p.id === formData.partnerId);
      const partnerId = match.userA === user.uid ? match.userB : match.userA;

      await addDoc(collection(db, 'sessions'), {
        participants: [user.uid, partnerId],
        partnerName: 'Skill Partner', // In a real app we'd fetch the name
        skill: formData.skill,
        date: Timestamp.fromDate(combinedDate),
        status: 'upcoming',
        type: 'Virtual',
        createdAt: serverTimestamp()
      });
      
      setShowModal(false);
      setFormData({ partnerId: '', skill: '', date: '', time: '' });
    } catch (err) {
      console.error("Sessions: Schedule error:", err);
      alert("Failed to schedule session. Check your connection.");
    } finally {
      setSubmitting(false);
    }
  };

  if (isLoading || !user) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Loader2 style={{ width: 32, height: 32, color: '#818cf8', animation: 'spin 1s linear infinite' }} />
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', paddingTop: '96px', paddingBottom: '64px' }}>
      <div style={{ maxWidth: '900px', margin: '0 auto', padding: '0 24px' }}>
        
        {/* Header Section */}
        <motion.div initial="hidden" animate="visible" style={{ marginBottom: '40px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: '20px' }}>
            <div>
              <motion.h1 variants={fadeUp} style={{ fontSize: '32px', fontWeight: 700, fontFamily: 'Outfit, sans-serif' }}>
                 <span className="gradient-text">Learning Sessions</span>
              </motion.h1>
              <motion.p variants={fadeUp} custom={1} style={{ fontSize: '15px', color: 'var(--text-secondary)', marginTop: '6px' }}>
                Track your upcoming lessons and past learning achievements.
              </motion.p>
            </div>
            <motion.button 
              variants={fadeUp} custom={2}
              onClick={() => setShowModal(true)}
              style={{
                padding: '12px 24px', borderRadius: '12px', fontSize: '14px', fontWeight: 600,
                background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                color: 'white', border: 'none', cursor: 'pointer',
                display: 'flex', alignItems: 'center', gap: '8px',
                boxShadow: '0 4px 15px rgba(99, 102, 241, 0.3)',
              }}
            >
              <Plus size={18} /> Schedule New
            </motion.button>
          </div>
        </motion.div>

        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) 300px', gap: '32px' }}>
          {/* Main List */}
          <div>
            <motion.div initial="hidden" animate="visible">
              <h2 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Clock size={18} color="#818cf8" /> Upcoming Sessions
              </h2>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {loading ? (
                   <div style={{ display: 'flex', justifyContent: 'center', padding: '40px' }}>
                      <Loader2 size={32} style={{ color: '#818cf8', animation: 'spin 1s linear infinite' }} />
                   </div>
                ) : sessions.length === 0 ? (
                  <div style={{ padding: '60px 40px', textAlign: 'center', border: '1px dashed var(--border-color)', borderRadius: '24px' }}>
                    <Calendar size={40} style={{ color: 'var(--text-muted)', marginBottom: '16px', opacity: 0.5 }} />
                    <p style={{ color: 'var(--text-muted)' }}>No upcoming sessions. Time to schedule one!</p>
                  </div>
                ) : sessions.map((s, i) => (
                  <motion.div key={s.id} variants={fadeUp} custom={i}
                    style={{
                      padding: '24px', borderRadius: '24px', position: 'relative', overflow: 'hidden',
                      backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border-color)',
                      transition: 'all 0.3s'
                    }}
                  >
                    <div style={{ position: 'absolute', top: 0, right: 0, padding: '12px 20px' }}>
                       <span style={{ 
                         fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', 
                         letterSpacing: '0.5px', color: '#818cf8', backgroundColor: 'rgba(99, 102, 241, 0.1)',
                         padding: '4px 10px', borderRadius: '6px'
                       }}>{s.status}</span>
                    </div>
                    
                    <div style={{ display: 'flex', gap: '20px' }}>
                      <div style={{
                        width: '64px', height: '64px', borderRadius: '18px',
                        backgroundColor: 'var(--bg-tertiary)', border: '1px solid var(--border-color)',
                        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center'
                      }}>
                        <span style={{ fontSize: '10px', fontWeight: 600, color: 'var(--text-muted)' }}>
                          {(s.dateStr || '').split('/')[0] || ''} / {(s.dateStr || '').split('/')[1] || ''}
                        </span>
                        <span style={{ fontSize: '16px', fontWeight: 800 }}>{s.timeStr}</span>
                      </div>
                      
                      <div style={{ flex: 1 }}>
                        <h4 style={{ fontSize: '18px', fontWeight: 700 }}>{s.skill}</h4>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginTop: '6px' }}>
                          <span style={{ fontSize: '13px', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <Video size={14} /> Virtual
                          </span>
                        </div>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center' }}>
                         <button style={{
                           padding: '10px 16px', borderRadius: '10px', backgroundColor: 'var(--bg-tertiary)',
                           border: '1px solid var(--border-color)', color: 'var(--text-secondary)',
                           fontSize: '13px', fontWeight: 600, cursor: 'not-allowed'
                         }}>
                           Launch
                         </button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </div>

          {/* Sidebar - Stats */}
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
            <h2 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Zap size={18} color="#f59e0b" /> Stats
            </h2>
            <div style={{ 
              backgroundColor: 'var(--bg-secondary)', borderRadius: '24px', 
              padding: '24px', border: '1px solid var(--border-color)' 
            }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <div style={{ textAlign: 'center' }}>
                  <p style={{ fontSize: '32px', fontWeight: 800, margin: 0 }}>{sessions.length}</p>
                  <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Upcoming Lessons</p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Schedule Modal */}
        <AnimatePresence>
          {showModal && (
            <div style={{
              position: 'fixed', inset: 0, zIndex: 100,
              display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px'
            }}>
              <motion.div 
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                onClick={() => setShowModal(false)}
                style={{ position: 'absolute', inset: 0, backgroundColor: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)' }} 
              />
              <motion.div 
                initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
                style={{
                  width: '100%', maxWidth: '440px', backgroundColor: 'var(--bg-primary)',
                  borderRadius: '24px', padding: '32px', position: 'relative', zIndex: 1,
                  boxShadow: '0 20px 50px rgba(0,0,0,0.3)', border: '1px solid var(--border-color)'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                  <h3 style={{ fontSize: '24px', fontWeight: 700, fontFamily: 'Outfit, sans-serif' }}>New Session</h3>
                  <X size={20} color="var(--text-muted)" style={{ cursor: 'pointer' }} onClick={() => setShowModal(false)} />
                </div>
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <div>
                    <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '8px', display: 'block' }}>EXCHANGE PARTNER</label>
                    <select 
                      value={formData.partnerId}
                      onChange={(e) => setFormData({...formData, partnerId: e.target.value})}
                      style={{
                        width: '100%', padding: '12px 16px', borderRadius: '12px', backgroundColor: 'var(--bg-secondary)',
                        border: '1px solid var(--border-color)', color: 'var(--text-primary)', outline: 'none'
                      }}
                    >
                      <option value="">Select a connection</option>
                      {partners.map(p => (
                        <option key={p.id} value={p.id}>Match: {p.skillExchange?.userATeaches} ↔ {p.skillExchange?.userBTeaches}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '8px', display: 'block' }}>SKILL TO LEARN</label>
                    <input 
                      value={formData.skill}
                      onChange={(e) => setFormData({...formData, skill: e.target.value})}
                      placeholder="e.g. Spanish Basics"
                      style={{
                        width: '100%', padding: '12px 16px', borderRadius: '12px', backgroundColor: 'var(--bg-secondary)',
                        border: '1px solid var(--border-color)', color: 'var(--text-primary)', outline: 'none'
                      }}
                    />
                  </div>
                  
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                    <div>
                      <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '8px', display: 'block' }}>DATE</label>
                      <input 
                        type="date" 
                        value={formData.date}
                        onChange={(e) => setFormData({...formData, date: e.target.value})}
                        style={{
                          width: '100%', padding: '12px 16px', borderRadius: '12px', backgroundColor: 'var(--bg-secondary)',
                          border: '1px solid var(--border-color)', color: 'var(--text-primary)', outline: 'none'
                        }} 
                      />
                    </div>
                    <div>
                      <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '8px', display: 'block' }}>TIME</label>
                      <input 
                        type="time" 
                        value={formData.time}
                        onChange={(e) => setFormData({...formData, time: e.target.value})}
                        style={{
                          width: '100%', padding: '12px 16px', borderRadius: '12px', backgroundColor: 'var(--bg-secondary)',
                          border: '1px solid var(--border-color)', color: 'var(--text-primary)', outline: 'none'
                        }} 
                      />
                    </div>
                  </div>
                  
                  <button 
                    onClick={scheduleSession}
                    disabled={submitting}
                    style={{
                      width: '100%', padding: '14px', borderRadius: '14px', fontSize: '15px', fontWeight: 700,
                      background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', color: 'white',
                      border: 'none', cursor: 'pointer', marginTop: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center'
                    }}
                  >
                    {submitting ? <Loader2 size={20} style={{ animation: 'spin 1s linear infinite' }} /> : 'Confirm & Schedule'}
                  </button>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

      </div>
    </div>
  );
}
