'use client';

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  Zap, ArrowRight, Users, BookOpen, MessageSquare, Calendar, Award, TrendingUp,
  Star, ChevronRight, Sparkles, Globe,
} from 'lucide-react';

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (i: number = 0) => ({
    opacity: 1, y: 0,
    transition: { delay: i * 0.1, duration: 0.6, ease: 'easeOut' as const },
  }),
};

const staggerContainer = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.1 } },
};

const features = [
  { icon: Users, title: 'Smart Matching', desc: 'Our algorithm finds perfect skill exchange partners based on what you teach and want to learn.' },
  { icon: MessageSquare, title: 'Real-time Chat', desc: 'Connect instantly with matched partners through our built-in messaging system.' },
  { icon: Calendar, title: 'Session Scheduling', desc: 'Book and manage skill exchange sessions with an integrated calendar.' },
  { icon: Award, title: 'Credit System', desc: 'Earn credits by teaching skills and spend them to learn new ones.' },
  { icon: BookOpen, title: 'Skill Profiles', desc: 'Showcase your expertise and learning goals with rich, detailed profiles.' },
  { icon: TrendingUp, title: 'Track Progress', desc: 'Monitor your learning journey with stats, ratings, and session history.' },
];

const howItWorks = [
  { step: '01', title: 'Create Your Profile', desc: 'List the skills you can teach and the ones you want to learn.', color: 'from-cyan-500 to-blue-600' },
  { step: '02', title: 'Get Matched', desc: 'Our algorithm finds users whose skills complement yours perfectly.', color: 'from-indigo-500 to-purple-600' },
  { step: '03', title: 'Start Learning', desc: 'Schedule sessions, chat, and exchange knowledge with your matches.', color: 'from-purple-500 to-pink-600' },
];


export default function LandingPage() {
  return (
    <div className="relative overflow-hidden" style={{ textAlign: 'center' }}>
      {/* Background effects */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-indigo-500/10 rounded-full blur-[120px]" />
        <div className="absolute top-1/3 right-1/4 w-[400px] h-[400px] bg-purple-500/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-1/4 left-1/3 w-[300px] h-[300px] bg-cyan-500/8 rounded-full blur-[100px]" />
      </div>

      {/* ===== HERO ===== */}
      <section className="relative min-h-screen flex items-center justify-center" style={{ padding: '120px 24px 80px' }}>
        <div style={{ maxWidth: '960px', margin: '0 auto', textAlign: 'center' }}>
          <motion.div variants={staggerContainer} initial="hidden" animate="visible">
            <motion.div variants={fadeUp} custom={0} style={{ marginBottom: '32px' }}>
              <span
                style={{
                  display: 'inline-flex', alignItems: 'center', gap: '8px',
                  padding: '8px 20px', borderRadius: '9999px',
                  backgroundColor: 'rgba(99, 102, 241, 0.1)', border: '1px solid rgba(99, 102, 241, 0.2)',
                  color: '#818cf8', fontSize: '14px', fontWeight: 500,
                }}
              >
                <Sparkles style={{ width: 16, height: 16 }} />
                Peer-to-Peer Skill Exchange
                <ChevronRight style={{ width: 12, height: 12 }} />
              </span>
            </motion.div>

            <motion.h1 variants={fadeUp} custom={1}
              style={{
                fontSize: 'clamp(40px, 6vw, 72px)', fontWeight: 800,
                lineHeight: 1.1, letterSpacing: '-0.02em',
                marginBottom: '24px', fontFamily: 'Outfit, sans-serif',
              }}
            >
              Learn anything by{' '}
              <span className="gradient-text">teaching</span>{' '}
              what you know
            </motion.h1>

            <motion.p variants={fadeUp} custom={2}
              style={{
                fontSize: '18px', color: 'var(--text-secondary)',
                maxWidth: '640px', margin: '0 auto 40px',
                lineHeight: 1.7,
              }}
            >
              Exchange skills with peers worldwide. No money needed — just your knowledge.
              Teach Python, learn Guitar. Teach Design, learn Marketing.
            </motion.p>

            <motion.div variants={fadeUp} custom={3}
              style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '16px', flexWrap: 'wrap', marginBottom: '64px' }}
            >
              <Link href="/signup"
                style={{
                  display: 'inline-flex', alignItems: 'center', gap: '8px',
                  padding: '16px 32px', background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                  color: 'white', fontWeight: 600, borderRadius: '12px',
                  textDecoration: 'none', fontSize: '16px',
                  boxShadow: '0 8px 25px rgba(99, 102, 241, 0.3)',
                }}
              >
                Start Exchanging Skills
                <ArrowRight style={{ width: 16, height: 16 }} />
              </Link>
              <Link href="/features"
                style={{
                  display: 'inline-flex', alignItems: 'center', gap: '8px',
                  padding: '16px 32px', border: '1px solid var(--border-color)',
                  color: 'var(--text-primary)', fontWeight: 600, borderRadius: '12px',
                  textDecoration: 'none', fontSize: '16px', background: 'transparent',
                }}
              >
                Learn More
              </Link>
            </motion.div>

          </motion.div>
        </div>

        {/* Scroll indicator */}
        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ repeat: Infinity, duration: 2 }}
          style={{ position: 'absolute', bottom: '32px', left: '50%', transform: 'translateX(-50%)' }}
        >
          <div style={{
            width: '20px', height: '32px', borderRadius: '9999px',
            border: '2px solid var(--text-muted)', display: 'flex',
            justifyContent: 'center', paddingTop: '6px',
          }}>
            <div style={{ width: '4px', height: '8px', background: 'var(--text-muted)', borderRadius: '9999px' }} />
          </div>
        </motion.div>
      </section>

      {/* ===== FEATURES ===== */}
      <section style={{ padding: '100px 24px', position: 'relative' }} id="features">
        <div style={{ maxWidth: '1120px', margin: '0 auto' }}>
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.2 }} variants={staggerContainer}>
            <motion.p variants={fadeUp}
              style={{ color: '#818cf8', fontWeight: 500, fontSize: '13px', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '12px' }}
            >Features</motion.p>
            <motion.h2 variants={fadeUp}
              style={{ fontSize: 'clamp(32px, 4vw, 48px)', fontWeight: 700, marginBottom: '16px', fontFamily: 'Outfit, sans-serif' }}
            >
              Everything you need to{' '}<span className="gradient-text">exchange skills</span>
            </motion.h2>
            <motion.p variants={fadeUp}
              style={{ color: 'var(--text-secondary)', maxWidth: '560px', margin: '0 auto 60px', fontSize: '16px', lineHeight: 1.6 }}
            >
              A complete platform for finding partners, chatting, scheduling sessions, and growing your skillset.
            </motion.p>
          </motion.div>

          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.1 }} variants={staggerContainer}
            style={{
              display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
              gap: '24px',
            }}
          >
            {features.map((f, i) => (
              <motion.div
                key={f.title}
                variants={fadeUp}
                custom={i}
                style={{
                  padding: '32px', borderRadius: '16px',
                  border: '1px solid var(--border-color)',
                  backgroundColor: 'var(--bg-secondary)',
                  textAlign: 'left',
                  transition: 'all 0.3s',
                }}
                className="hover:border-indigo-500/30 hover:-translate-y-1 hover:shadow-lg"
              >
                <div style={{
                  width: '48px', height: '48px', borderRadius: '12px',
                  backgroundColor: 'rgba(99, 102, 241, 0.1)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  marginBottom: '20px',
                }}>
                  <f.icon style={{ width: 24, height: 24, color: '#818cf8' }} />
                </div>
                <h3 style={{ fontSize: '18px', fontWeight: 600, marginBottom: '8px' }}>{f.title}</h3>
                <p style={{ fontSize: '14px', color: 'var(--text-secondary)', lineHeight: 1.7 }}>{f.desc}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ===== HOW IT WORKS ===== */}
      <section style={{ padding: '100px 24px', position: 'relative' }}>
        <div style={{ maxWidth: '960px', margin: '0 auto' }}>
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={staggerContainer}>
            <motion.p variants={fadeUp}
              style={{ color: '#818cf8', fontWeight: 500, fontSize: '13px', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '12px' }}
            >How It Works</motion.p>
            <motion.h2 variants={fadeUp}
              style={{ fontSize: 'clamp(32px, 4vw, 48px)', fontWeight: 700, marginBottom: '60px', fontFamily: 'Outfit, sans-serif' }}
            >
              Three simple steps
            </motion.h2>
          </motion.div>

          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={staggerContainer}
            style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '40px' }}
          >
            {howItWorks.map((item, i) => (
              <motion.div key={item.step} variants={fadeUp} custom={i} style={{ textAlign: 'center' }}>
                <div
                  className={`bg-gradient-to-br ${item.color}`}
                  style={{
                    width: '64px', height: '64px', borderRadius: '16px',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    margin: '0 auto 24px', color: 'white', fontWeight: 700, fontSize: '20px',
                    boxShadow: '0 8px 20px rgba(0,0,0,0.2)',
                  }}
                >
                  {item.step}
                </div>
                <h3 style={{ fontSize: '20px', fontWeight: 600, marginBottom: '12px' }}>{item.title}</h3>
                <p style={{ fontSize: '14px', color: 'var(--text-secondary)', lineHeight: 1.7 }}>{item.desc}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>


      {/* ===== CTA ===== */}
      <section style={{ padding: '80px 24px 100px' }}>
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          style={{
            maxWidth: '800px', margin: '0 auto', textAlign: 'center',
            padding: '64px 40px', borderRadius: '24px',
            background: 'linear-gradient(135deg, rgba(99,102,241,0.08), rgba(139,92,246,0.08))',
            border: '1px solid rgba(99,102,241,0.2)',
          }}
        >
          <div style={{
            width: '64px', height: '64px', borderRadius: '16px',
            background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 24px',
          }}>
            <Globe style={{ width: 32, height: 32, color: 'white' }} />
          </div>
          <h2 style={{ fontSize: 'clamp(28px, 3.5vw, 40px)', fontWeight: 700, marginBottom: '16px', fontFamily: 'Outfit, sans-serif' }}>
            Ready to start exchanging skills?
          </h2>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '32px', maxWidth: '480px', margin: '0 auto 32px', fontSize: '16px', lineHeight: 1.6 }}>
            Join thousands of learners and teachers. It&apos;s free to get started.
          </p>
          <Link href="/signup"
            style={{
              display: 'inline-flex', alignItems: 'center', gap: '8px',
              padding: '16px 32px',
              background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
              color: 'white', fontWeight: 600, borderRadius: '12px',
              textDecoration: 'none', fontSize: '16px',
              boxShadow: '0 8px 25px rgba(99, 102, 241, 0.3)',
            }}
          >
            Create Free Account
            <ArrowRight style={{ width: 16, height: 16 }} />
          </Link>
        </motion.div>
      </section>

      {/* ===== FOOTER ===== */}
      <footer style={{
        borderTop: '1px solid var(--border-color)',
        padding: '48px 24px',
      }}>
        <div style={{
          maxWidth: '1120px', margin: '0 auto',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          flexWrap: 'wrap', gap: '16px',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{
              width: '28px', height: '28px', borderRadius: '8px',
              background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <Zap style={{ width: 14, height: 14, color: 'white' }} />
            </div>
            <span style={{ fontWeight: 700, fontFamily: 'Outfit, sans-serif' }}>SkillSwap</span>
          </div>
          <p style={{ fontSize: '14px', color: 'var(--text-muted)' }}>&copy; 2026 SkillSwap. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
