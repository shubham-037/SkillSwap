'use client';

import React, { useEffect, useState, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuthStore } from '@/lib/store';
import { getFirestoreDb } from '@/lib/firebase';
import { 
  collection, query, where, orderBy, onSnapshot, 
  addDoc, serverTimestamp, doc, getDoc, getDocs 
} from 'firebase/firestore';
import { Loader2, Send, MessageSquare, Plus, Video, Info, User, Check, CheckCheck } from 'lucide-react';
import { Suspense } from 'react';

function ChatContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const matchId = searchParams.get('matchId');
  const { user, isLoading } = useAuthStore();
  
  const [partners, setPartners] = useState<any[]>([]);
  const [selectedPartner, setSelectedPartner] = useState<any>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isLoading && !user) router.push('/login');

    if (user) {
      const db = getFirestoreDb();
      
      // Real-time matches listener to populate the sidebar
      const qMatchesA = query(collection(db, 'matches'), where('userA', '==', user.uid), where('status', '==', 'accepted'));
      const qMatchesB = query(collection(db, 'matches'), where('userB', '==', user.uid), where('status', '==', 'accepted'));

      const processMatches = async (docs: any[]) => {
        try {
          const partnerData = await Promise.all(docs.map(async (d) => {
            const m = d.data();
            const pId = m.userA === user.uid ? m.userB : m.userA;
            const pSnap = await getDoc(doc(db, 'users', pId));
            return { 
              matchId: d.id, 
              id: pId, 
              name: pSnap.data()?.displayName || 'Skill Partner',
              skill: (m.skillExchange?.userATeaches || '?') + ' ↔ ' + (m.skillExchange?.userBTeaches || '?'),
              lastMsg: 'Start chatting...',
              time: '',
              status: 'online' 
            };
          }));
          
          setPartners(prev => {
            const partnerMap = new Map(prev.map(p => [p.matchId, p]));
            partnerData.forEach(p => partnerMap.set(p.matchId, p));
            const combined = Array.from(partnerMap.values());
            
            // Auto-select if needed
            if (!selectedPartner && combined.length > 0) {
              if (matchId) {
                const s = combined.find(p => p.matchId === matchId);
                if (s) setSelectedPartner(s);
                else setSelectedPartner(combined[0]);
              } else {
                setSelectedPartner(combined[0]);
              }
            }
            return combined;
          });
          setLoading(false);
        } catch (err) {
          console.error("Chat: Partner processing error:", err);
        }
      };

      const unsubA = onSnapshot(qMatchesA, (snap) => processMatches(snap.docs), (err) => {
        console.error("Chat: MatchA listener error:", err);
        if (err.message.includes('index')) {
          alert("A database index is currently building. Chat partners will appear in a few minutes.");
        }
        setLoading(false);
      });

      const unsubB = onSnapshot(qMatchesB, (snap) => processMatches(snap.docs), (err) => {
        console.error("Chat: MatchB listener error:", err);
        setLoading(false);
      });

      return () => {
        unsubA();
        unsubB();
      };
    }
  }, [user, isLoading, router, matchId]);

  // Real-time message listener
  useEffect(() => {
    if (user && selectedPartner) {
      const db = getFirestoreDb();
      const q = query(
        collection(db, 'messages'),
        where('matchId', '==', selectedPartner.matchId),
        orderBy('timestamp', 'asc')
      );

      const unsubscribe = onSnapshot(q, (snapshot) => {
        try {
          const msgs = snapshot.docs.map(d => ({
            id: d.id,
            ...d.data(),
            sent: d.data().senderId === user.uid,
            time: d.data().timestamp ? new Date(d.data().timestamp.toDate()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Just now'
          }));
          setMessages(msgs);
        } catch (err) {
          console.error("Chat: Snapshot processing error:", err);
        }
      }, (error) => {
        console.error("Chat: Snapshot listener error:", error);
      });

      return () => unsubscribe();
    }
  }, [user, selectedPartner]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || !user || !selectedPartner) return;
    
    try {
      const db = getFirestoreDb();
      await addDoc(collection(db, 'messages'), {
        matchId: selectedPartner.matchId,
        senderId: user.uid,
        text: input,
        timestamp: serverTimestamp()
      });
      setInput('');
    } catch (err) {
      console.error("Chat: Send message error:", err);
      alert("Failed to send message. Check your connection.");
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
    <div style={{ height: '100vh', paddingTop: '64px', overflow: 'hidden', display: 'flex' }}>
      {/* Sidebar - Contacts */}
      <div style={{ 
        width: '360px', borderRight: '1px solid var(--border-color)', 
        backgroundColor: 'var(--bg-secondary)', display: 'flex', flexDirection: 'column' 
      }}>
        <div style={{ padding: '24px', borderBottom: '1px solid var(--border-color)' }}>
          <h2 style={{ fontSize: '20px', fontWeight: 700, fontFamily: 'Outfit, sans-serif' }}>Messages</h2>
        </div>

        <div style={{ flex: 1, overflowY: 'auto' }}>
          {loading ? (
            <div style={{ display: 'flex', justifyContent: 'center', padding: '24px' }}>
              <Loader2 size={24} style={{ color: '#818cf8', animation: 'spin 1s linear infinite' }} />
            </div>
          ) : partners.length === 0 ? (
            <div style={{ padding: '40px 24px', textAlign: 'center' }}>
              <p style={{ fontSize: '14px', color: 'var(--text-muted)' }}>No active matches yet. Head to the Search page to find partners!</p>
            </div>
          ) : (
            partners.map((p) => (
              <div 
                key={p.matchId} 
                onClick={() => setSelectedPartner(p)}
                style={{
                  padding: '16px 20px', display: 'flex', gap: '14px', alignItems: 'center',
                  cursor: 'pointer', borderBottom: '1px solid var(--border-color)',
                  backgroundColor: selectedPartner?.matchId === p.matchId ? 'rgba(99, 102, 241, 0.05)' : 'transparent',
                  borderLeft: selectedPartner?.matchId === p.matchId ? '3px solid #6366f1' : '3px solid transparent',
                  transition: 'all 0.2s'
                }}
              >
                <div style={{ position: 'relative' }}>
                  <div style={{
                    width: '48px', height: '48px', borderRadius: '14px',
                    background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '18px', fontWeight: 700, color: 'white'
                  }}>
                    {p.name[0]}
                  </div>
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                    <h4 style={{ fontSize: '15px', fontWeight: 600, margin: 0 }}>{p.name}</h4>
                    <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{p.time}</span>
                  </div>
                  <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '2px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {p.lastMsg}
                  </p>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Main Chat Area */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', backgroundColor: 'var(--bg-primary)' }}>
        {selectedPartner ? (
          <>
            {/* Chat Header */}
            <div style={{ 
              padding: '16px 24px', backgroundColor: 'var(--bg-secondary)', 
              borderBottom: '1px solid var(--border-color)',
              display: 'flex', justifyContent: 'space-between', alignItems: 'center' 
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{
                  width: '40px', height: '40px', borderRadius: '10px',
                  background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '16px', fontWeight: 700, color: 'white'
                }}>
                  {selectedPartner.name[0]}
                </div>
                <div>
                  <h4 style={{ fontSize: '16px', fontWeight: 700 }}>{selectedPartner.name}</h4>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{selectedPartner.skill}</span>
                  </div>
                </div>
              </div>
              <div style={{ display: 'flex', gap: '8px' }}>
                {[Video, Info].map((Icon, i) => (
                  <button key={i} style={{
                    width: '36px', height: '36px', borderRadius: '10px',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    backgroundColor: 'var(--bg-tertiary)', border: '1px solid var(--border-color)',
                    color: 'var(--text-secondary)', cursor: 'pointer'
                  }}>
                    <Icon size={18} />
                  </button>
                ))}
              </div>
            </div>

            {/* Message History */}
            <div style={{ flex: 1, overflowY: 'auto', padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <AnimatePresence>
                {messages.map((m) => (
                  <motion.div 
                    key={m.id}
                    initial={{ opacity: 0, scale: 0.95, y: 10 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    style={{
                      maxWidth: '75%', alignSelf: m.sent ? 'flex-end' : 'flex-start',
                      display: 'flex', flexDirection: 'column', alignItems: m.sent ? 'flex-end' : 'flex-start'
                    }}
                  >
                    <div style={{
                      padding: '12px 18px', fontSize: '14px',
                      ...(m.sent 
                        ? { background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', color: 'white', borderRadius: '18px 18px 2px 18px', boxShadow: '0 4px 12px rgba(99, 102, 241, 0.2)' }
                        : { backgroundColor: 'var(--bg-secondary)', color: 'var(--text-primary)', borderRadius: '18px 18px 18px 2px', border: '1px solid var(--border-color)' }
                      )
                    }}>
                      {m.text}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginTop: '4px' }}>
                      <span style={{ fontSize: '10px', color: 'var(--text-muted)' }}>{m.time}</span>
                      {m.sent && <CheckCheck size={12} color="#818cf8" />}
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
              <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div style={{ padding: '24px', backgroundColor: 'var(--bg-secondary)', borderTop: '1px solid var(--border-color)' }}>
              <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                <button style={{
                  width: '44px', height: '44px', borderRadius: '12px',
                  backgroundColor: 'var(--bg-tertiary)', border: '1px solid var(--border-color)',
                  color: 'var(--text-muted)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center'
                }}>
                  <Plus size={20} />
                </button>
                <div style={{ flex: 1, position: 'relative' }}>
                  <input 
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => { if (e.key === 'Enter') handleSend(); }}
                    placeholder="Type your message here..."
                    style={{
                      width: '100%', padding: '14px 20px', borderRadius: '16px',
                      backgroundColor: 'var(--bg-tertiary)', border: '1px solid var(--border-color)',
                      color: 'var(--text-primary)', fontSize: '14px', outline: 'none'
                    }}
                  />
                </div>
                <button 
                  onClick={handleSend}
                  disabled={!input.trim()}
                  style={{
                    width: '44px', height: '44px', borderRadius: '12px',
                    background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                    color: 'white', border: 'none', cursor: 'pointer',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    boxShadow: '0 4px 12px rgba(99, 102, 241, 0.3)',
                    opacity: !input.trim() ? 0.6 : 1
                  }}
                >
                  <Send size={18} />
                </button>
              </div>
            </div>
          </>
        ) : (
          <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
             <div style={{ textAlign: 'center', maxWidth: '300px' }}>
                <div style={{ 
                  width: '80px', height: '80px', borderRadius: '24px', 
                  backgroundColor: 'rgba(99, 102, 241, 0.05)', display: 'flex', 
                  alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px' 
                }}>
                  <MessageSquare size={32} color="var(--text-muted)" style={{ opacity: 0.5 }} />
                </div>
                <h3 style={{ fontSize: '20px', fontWeight: 700, marginBottom: '8px' }}>Select a chat</h3>
                <p style={{ fontSize: '14px', color: 'var(--text-muted)' }}>Choose a connection from the left to start exchanging skills.</p>
             </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function ChatPage() {
  return (
    <Suspense fallback={
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Loader2 style={{ width: 32, height: 32, color: '#818cf8', animation: 'spin 1s linear infinite' }} />
      </div>
    }>
      <ChatContent />
    </Suspense>
  );
}
