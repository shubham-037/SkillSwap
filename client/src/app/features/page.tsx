'use client';

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  Users, MessageSquare, Calendar, Award, BookOpen, TrendingUp, Shield, Zap, Globe, ArrowRight, Sparkles,
} from 'lucide-react';

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (i: number = 0) => ({
    opacity: 1, y: 0,
    transition: { delay: i * 0.1, duration: 0.6, ease: 'easeOut' as const },
  }),
};

const stagger = { hidden: {}, visible: { transition: { staggerChildren: 0.08 } } };

const allFeatures = [
  { icon: Users, title: 'Smart Matching', desc: 'AI-powered algorithm matches you with the perfect skill exchange partner.', color: 'from-cyan-500 to-blue-600' },
  { icon: MessageSquare, title: 'Real-time Chat', desc: 'Instant messaging with typing indicators and online status.', color: 'from-indigo-500 to-purple-600' },
  { icon: Calendar, title: 'Session Scheduling', desc: 'Integrated calendar for booking and managing sessions.', color: 'from-purple-500 to-pink-600' },
  { icon: Award, title: 'Credit System', desc: '1 hour teaching = 1 credit. Use credits to learn new skills.', color: 'from-amber-500 to-orange-600' },
  { icon: BookOpen, title: 'Skill Profiles', desc: 'Showcase your expertise with detailed, searchable skill profiles.', color: 'from-emerald-500 to-teal-600' },
  { icon: TrendingUp, title: 'Progress Tracking', desc: 'Monitor your learning journey with detailed analytics.', color: 'from-rose-500 to-red-600' },
  { icon: Shield, title: 'Verified Users', desc: 'Trust and safety with verified profiles and ratings.', color: 'from-sky-500 to-cyan-600' },
  { icon: Globe, title: 'Global Community', desc: 'Connect with learners and teachers from around the world.', color: 'from-violet-500 to-indigo-600' },
  { icon: Sparkles, title: 'AI Recommendations', desc: 'Get personalized skill suggestions based on your interests.', color: 'from-fuchsia-500 to-purple-600' },
];

export default function FeaturesPage() {
  return (
    <div style={{ minHeight: '100vh', paddingTop: '100px', paddingBottom: '64px' }}>
      <div style={{ maxWidth: '1120px', margin: '0 auto', padding: '0 24px', textAlign: 'center' }}>
        <motion.div initial="hidden" animate="visible" variants={stagger}>
          <motion.p variants={fadeUp}
            style={{ color: '#818cf8', fontWeight: 500, fontSize: '13px', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '12px' }}
          >Platform Features</motion.p>
          <motion.h1 variants={fadeUp}
            style={{ fontSize: 'clamp(36px, 5vw, 60px)', fontWeight: 700, marginBottom: '24px', fontFamily: 'Outfit, sans-serif' }}
          >
            Built for <span className="gradient-text">real learning</span>
          </motion.h1>
          <motion.p variants={fadeUp}
            style={{ color: 'var(--text-secondary)', maxWidth: '640px', margin: '0 auto 60px', fontSize: '18px', lineHeight: 1.7 }}
          >
            Every feature is designed to make skill exchange seamless, safe, and rewarding.
          </motion.p>
        </motion.div>

        <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={stagger}
          style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px', marginBottom: '80px' }}
        >
          {allFeatures.map((f, i) => (
            <motion.div
              key={f.title}
              variants={fadeUp}
              custom={i}
              className="hover:border-indigo-500/30 hover:-translate-y-1 hover:shadow-lg"
              style={{
                padding: '32px', borderRadius: '16px',
                border: '1px solid var(--border-color)',
                backgroundColor: 'var(--bg-secondary)',
                textAlign: 'left', transition: 'all 0.3s',
              }}
            >
              <div className={`bg-gradient-to-br ${f.color}`} style={{
                width: '48px', height: '48px', borderRadius: '12px',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                marginBottom: '20px', boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
              }}>
                <f.icon style={{ width: 24, height: 24, color: 'white' }} />
              </div>
              <h3 style={{ fontSize: '18px', fontWeight: 600, marginBottom: '8px' }}>{f.title}</h3>
              <p style={{ fontSize: '14px', color: 'var(--text-secondary)', lineHeight: 1.7 }}>{f.desc}</p>
            </motion.div>
          ))}
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
          style={{
            textAlign: 'center', padding: '64px 40px', borderRadius: '24px',
            background: 'linear-gradient(135deg, rgba(99,102,241,0.08), rgba(139,92,246,0.08))',
            border: '1px solid rgba(99,102,241,0.2)',
          }}
        >
          <h2 style={{ fontSize: '32px', fontWeight: 700, marginBottom: '16px', fontFamily: 'Outfit, sans-serif' }}>Ready to get started?</h2>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '24px', fontSize: '16px' }}>Join SkillSwap today and start exchanging skills.</p>
          <Link href="/signup"
            style={{
              display: 'inline-flex', alignItems: 'center', gap: '8px',
              padding: '16px 32px', background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
              color: 'white', fontWeight: 600, borderRadius: '12px', textDecoration: 'none',
              boxShadow: '0 8px 25px rgba(99, 102, 241, 0.3)',
            }}
          >
            Create Free Account <ArrowRight style={{ width: 16, height: 16 }} />
          </Link>
        </motion.div>
      </div>
    </div>
  );
}
