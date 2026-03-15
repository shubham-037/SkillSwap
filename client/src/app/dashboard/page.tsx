'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { useAuthStore } from '@/lib/store';
import { getFirestoreDb } from '@/lib/firebase';
import { 
  collection, query, where, getDocs, doc, onSnapshot, getCountFromServer 
} from 'firebase/firestore';
import { 
  BookOpen, Users, MessageSquare, Calendar, 
  Zap, ArrowRight, CheckCircle2, Star, Loader2, Sparkles, Plus, Search
} from 'lucide-react';

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number = 0) => ({ 
    opacity: 1, y: 0, 
    transition: { delay: i * 0.05, duration: 0.4, ease: 'easeOut' as any } 
  }),
};

export default function DashboardPage() {
  const router = useRouter();
  const { user, isLoading } = useAuthStore();
  
  const [profile, setProfile] = useState<any>(null);
  const [stats, setStats] = useState({ matches: 0, sessions: 0, skills: 0, credits: 5 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isLoading && !user) router.push('/login');

    if (user) {
      const db = getFirestoreDb();
      
      // 1. Listen to Profile Changes
      const unsubscribeProfile = onSnapshot(doc(db, 'users', user.uid), (doc) => {
        if (doc.exists()) {
          const data = doc.data();
          setProfile(data);
          setStats(prev => ({ ...prev, skills: (data.skillsTeach?.length || 0) + (data.skillsLearn?.length || 0) }));
        }
      }, (error) => {
        console.error("Dashboard: Profile snapshot error:", error);
        setLoading(false); // Stop loading even if snapshot fails
      });

      // 2. Fetch Stats
      const fetchStats = async () => {
        try {
          const qMatches = query(collection(db, 'matches'), where('userA', '==', user.uid), where('status', '==', 'accepted'));
          const qMatchesB = query(collection(db, 'matches'), where('userB', '==', user.uid), where('status', '==', 'accepted'));
          const [s1, s2] = await Promise.all([getDocs(qMatches), getDocs(qMatchesB)]);
          
          const qSessions = query(collection(db, 'sessions'), where('participants', 'array-contains', user.uid), where('status', '==', 'upcoming'));
          const s3 = await getDocs(qSessions);

          setStats(prev => ({ ...prev, matches: s1.size + s2.size, sessions: s3.size }));
        } catch (err) {
          console.error("Dashboard: Fetch stats error:", err);
        } finally {
          setLoading(false);
        }
      };

      fetchStats();
      return () => unsubscribeProfile();
    }
  }, [user, isLoading, router]);

  if (isLoading || !user) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Loader2 style={{ width: 32, height: 32, color: '#818cf8', animation: 'spin 1s linear infinite' }} />
      </div>
    );
  }

  const displayName = profile?.displayName || user.displayName || 'Learner';

  return (
    <div style={{ minHeight: '100vh', paddingTop: '96px', paddingBottom: '64px' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 24px' }}>
        
        {/* Welcome Section */}
        <motion.div initial="hidden" animate="visible" variants={fadeUp} style={{ marginBottom: '48px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
             <div style={{
               width: '80px', height: '80px', borderRadius: '28px',
               background: 'linear-gradient(135deg, #6366f1, #a855f7)',
               display: 'flex', alignItems: 'center', justifyContent: 'center',
               fontSize: '32px', fontWeight: 800, color: 'white',
               boxShadow: '0 20px 40px rgba(99, 102, 241, 0.2)'
             }}>
               {displayName[0].toUpperCase()}
             </div>
             <div>
               <h1 style={{ fontSize: '36px', fontWeight: 800, letterSpacing: '-0.5px', fontFamily: 'Outfit, sans-serif' }}>
                 Welcome back, <span className="gradient-text">{(displayName || 'Learner')}!</span>
               </h1>
               <p style={{ color: 'var(--text-secondary)', fontSize: '16px', marginTop: '4px' }}>
                 You have <strong style={{color: '#818cf8'}}>{stats.sessions} upcoming</strong> learning sessions this week.
               </p>
             </div>
          </div>
        </motion.div>

        {/* Stats Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '24px', marginBottom: '48px' }}>
          {[
            { label: 'Active Matches', value: stats.matches, icon: Users, color: '#6366f1', bg: 'rgba(99, 102, 241, 0.1)' },
            { label: 'Total Skills', value: stats.skills, icon: BookOpen, color: '#10b981', bg: 'rgba(16, 185, 129, 0.1)' },
            { label: 'Skill Credits', value: stats.credits, icon: Zap, color: '#f59e0b', bg: 'rgba(245, 158, 11, 0.1)' },
            { label: 'Upcoming', value: stats.sessions, icon: Calendar, color: '#a855f7', bg: 'rgba(168, 85, 247, 0.1)' },
          ].map((stat, i) => (
            <motion.div key={i} initial="hidden" animate="visible" variants={fadeUp} custom={i}
              style={{
                backgroundColor: 'var(--bg-secondary)', padding: '24px', borderRadius: '28px',
                border: '1px solid var(--border-color)', position: 'relative', overflow: 'hidden'
              }}
            >
              <div style={{ width: '48px', height: '48px', borderRadius: '14px', backgroundColor: stat.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '16px' }}>
                <stat.icon size={24} color={stat.color} />
              </div>
              <h3 style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1px' }}>{stat.label}</h3>
              <p style={{ fontSize: '32px', fontWeight: 800, marginTop: '4px' }}>{stat.value}</p>
            </motion.div>
          ))}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: '32px' }}>
          {/* Main Content */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
            {/* Your Skills Card */}
            <motion.div initial="hidden" animate="visible" variants={fadeUp} custom={4}
              style={{ padding: '32px', borderRadius: '32px', backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border-color)' }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                 <h2 style={{ fontSize: '20px', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '10px' }}>
                   <Sparkles size={22} color="#f59e0b" /> Your Skill Profile
                 </h2>
                 <Link href="/profile" style={{ fontSize: '14px', color: '#818cf8', fontWeight: 600, textDecoration: 'none' }}>Edit Profile</Link>
              </div>
              
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
                <div style={{ padding: '20px', borderRadius: '20px', backgroundColor: 'var(--bg-tertiary)', border: '1px solid var(--border-color)' }}>
                  <p style={{ fontSize: '11px', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '12px' }}>Teaching</p>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                    {(profile?.skillsTeach || []).length > 0 ? profile.skillsTeach.map((s: string) => (
                      <span key={s} style={{ padding: '6px 12px', borderRadius: '10px', backgroundColor: 'rgba(52, 211, 153, 0.1)', color: '#34d399', fontSize: '13px', fontWeight: 600 }}>{s}</span>
                    )) : <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>No skills added yet.</p>}
                  </div>
                </div>
                <div style={{ padding: '20px', borderRadius: '20px', backgroundColor: 'var(--bg-tertiary)', border: '1px solid var(--border-color)' }}>
                  <p style={{ fontSize: '11px', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '12px' }}>Learning</p>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                    {(profile?.skillsLearn || []).length > 0 ? profile.skillsLearn.map((s: string) => (
                      <span key={s} style={{ padding: '6px 12px', borderRadius: '10px', backgroundColor: 'rgba(167, 139, 250, 0.1)', color: '#a78bfa', fontSize: '13px', fontWeight: 600 }}>{s}</span>
                    )) : <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>No targets added yet.</p>}
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Quick Actions */}
            <motion.div initial="hidden" animate="visible" variants={fadeUp} custom={5}>
               <h2 style={{ fontSize: '20px', fontWeight: 700, marginBottom: '20px' }}>Quick Actions</h2>
               <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }}>
                  {[
                    { label: 'Find Partner', icon: Search, path: '/search', color: '#6366f1' },
                    { label: 'Schedule', icon: Plus, path: '/sessions', color: '#10b981' },
                    { label: 'Active Chats', icon: MessageSquare, path: '/chat', color: '#f59e0b' },
                  ].map((action, i) => (
                    <Link key={i} href={action.path} style={{ textDecoration: 'none' }}>
                      <div style={{
                        padding: '24px', borderRadius: '24px', backgroundColor: 'var(--bg-secondary)',
                        border: '1px solid var(--border-color)', textAlign: 'center', transition: 'all 0.3s'
                      }} className="hover:border-indigo-500/30 hover:bg-indigo-500/5 group">
                         <div style={{ 
                           width: '44px', height: '44px', borderRadius: '12px', 
                           backgroundColor: 'var(--bg-tertiary)', display: 'flex', 
                           alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px'
                         }}>
                            <action.icon size={22} color={action.color} />
                         </div>
                         <p style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text-primary)' }}>{action.label}</p>
                      </div>
                    </Link>
                  ))}
               </div>
            </motion.div>
          </div>

          {/* Sidebar */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
             <motion.div initial="hidden" animate="visible" variants={fadeUp} custom={6}
               style={{ padding: '28px', borderRadius: '32px', background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.05), rgba(168, 85, 247, 0.05))', border: '1px solid rgba(99, 102, 241, 0.1)' }}
             >
                <h3 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '20px' }}>Matching Activity</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                   {[1, 2, 3].map(i => (
                     <div key={i} style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                        <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#34d399' }} />
                        <p style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>New match request from <strong>User {i}</strong></p>
                     </div>
                   ))}
                </div>
                <Link href="/matches" style={{ display: 'block', marginTop: '24px', fontSize: '13px', color: '#818cf8', fontWeight: 700, textDecoration: 'none' }}>View all matches →</Link>
             </motion.div>
          </div>
        </div>

      </div>
    </div>
  );
}

// Local fallback component if needed, renamed to avoid collision
function CustomSearchIcon({ size, color }: { size: number, color: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="11" cy="11" r="8"></circle>
      <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
    </svg>
  );
}
