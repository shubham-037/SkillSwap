'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuthStore } from '@/lib/store';
import {
  Menu, X, Zap, User, LogOut, LayoutDashboard, Search, MessageSquare, Calendar, Sun, Moon,
} from 'lucide-react';

type NavLink = { href: string; label: string; icon?: React.ComponentType<{ className?: string; style?: React.CSSProperties }> };

export default function Navbar() {
  const pathname = usePathname();
  const { user, logout } = useAuthStore();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [dark, setDark] = useState(true);

  useEffect(() => {
    document.documentElement.classList.add('dark');
  }, []);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const toggleDark = () => {
    setDark(!dark);
    document.documentElement.classList.toggle('dark');
  };

  const publicLinks: NavLink[] = [
    { href: '/', label: 'Home' },
    { href: '/features', label: 'Features' },
    { href: '/login', label: 'Login' },
    { href: '/signup', label: 'Get Started' },
  ];

  const authLinks: NavLink[] = [
    { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/search', label: 'Search', icon: Search },
    { href: '/matches', label: 'Matches', icon: Zap },
    { href: '/chat', label: 'Chat', icon: MessageSquare },
    { href: '/sessions', label: 'Sessions', icon: Calendar },
    { href: '/profile', label: 'Profile', icon: User },
  ];

  const links: NavLink[] = user ? authLinks : publicLinks;

  return (
    <motion.nav
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      style={{
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 50,
        transition: 'all 0.3s',
        background: scrolled ? 'rgba(10, 10, 15, 0.85)' : 'transparent',
        backdropFilter: scrolled ? 'blur(20px)' : 'none',
        borderBottom: scrolled ? '1px solid var(--border-color)' : '1px solid transparent',
      }}
    >
      <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '0 24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: '64px' }}>
          {/* Logo */}
          <Link href={user ? '/dashboard' : '/'} style={{ display: 'flex', alignItems: 'center', gap: '10px', textDecoration: 'none', color: 'inherit' }}>
            <div style={{
              width: '32px', height: '32px', borderRadius: '8px',
              background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <Zap style={{ width: 16, height: 16, color: 'white' }} />
            </div>
            <span style={{ fontWeight: 700, fontSize: '18px', fontFamily: 'Outfit, sans-serif' }}>
              Skill<span className="gradient-text">Swap</span>
            </span>
          </Link>

          {/* Desktop links */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }} className="hidden md:flex">
            {links.map((link) => {
              const isActive = pathname === link.href;
              const Icon = link.icon;
              const isGetStarted = link.label === 'Get Started';
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  style={{
                    display: 'flex', alignItems: 'center', gap: '6px',
                    padding: '8px 16px', borderRadius: '8px',
                    fontSize: '14px', fontWeight: 500,
                    textDecoration: 'none',
                    transition: 'all 0.2s',
                    ...(isGetStarted
                      ? { background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', color: 'white', marginLeft: '8px' }
                      : isActive
                        ? { color: '#818cf8', backgroundColor: 'rgba(99, 102, 241, 0.1)' }
                        : { color: 'var(--text-secondary)' }
                    ),
                  }}
                >
                  {Icon && <Icon style={{ width: 16, height: 16 }} />}
                  {link.label}
                </Link>
              );
            })}
          </div>

          {/* Right side */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <button onClick={toggleDark} style={{
              padding: '8px', borderRadius: '8px', background: 'transparent',
              border: 'none', cursor: 'pointer', color: 'var(--text-secondary)',
            }}>
              {dark ? <Sun style={{ width: 16, height: 16 }} /> : <Moon style={{ width: 16, height: 16 }} />}
            </button>
            {user && (
              <button
                onClick={() => { logout(); window.location.href = '/'; }}
                className="hidden md:flex"
                style={{
                  display: 'flex', alignItems: 'center', gap: '8px',
                  padding: '8px 12px', borderRadius: '8px', fontSize: '14px',
                  color: 'var(--text-secondary)', background: 'transparent',
                  border: 'none', cursor: 'pointer',
                }}
              >
                <LogOut style={{ width: 16, height: 16 }} />
              </button>
            )}
            <button onClick={() => setMobileOpen(!mobileOpen)} className="md:hidden" style={{
              padding: '8px', borderRadius: '8px', background: 'transparent',
              border: 'none', cursor: 'pointer', color: 'var(--text-secondary)',
            }}>
              {mobileOpen ? <X style={{ width: 20, height: 20 }} /> : <Menu style={{ width: 20, height: 20 }} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden"
            style={{
              background: 'rgba(10, 10, 15, 0.95)',
              backdropFilter: 'blur(20px)',
              borderBottom: '1px solid var(--border-color)',
            }}
          >
            <div style={{ padding: '12px 16px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
              {links.map((link) => {
                const Icon = link.icon;
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setMobileOpen(false)}
                    style={{
                      display: 'flex', alignItems: 'center', gap: '8px',
                      padding: '10px 16px', borderRadius: '8px',
                      fontSize: '14px', fontWeight: 500, textDecoration: 'none',
                      color: pathname === link.href ? '#818cf8' : 'var(--text-secondary)',
                      background: pathname === link.href ? 'rgba(99, 102, 241, 0.1)' : 'transparent',
                    }}
                  >
                    {Icon && <Icon style={{ width: 16, height: 16 }} />}
                    {link.label}
                  </Link>
                );
              })}
              {user && (
                <button
                  onClick={() => { logout(); window.location.href = '/'; setMobileOpen(false); }}
                  style={{
                    display: 'flex', alignItems: 'center', gap: '8px',
                    padding: '10px 16px', borderRadius: '8px',
                    fontSize: '14px', color: '#f87171', background: 'transparent',
                    border: 'none', cursor: 'pointer', width: '100%', textAlign: 'left',
                  }}
                >
                  <LogOut style={{ width: 16, height: 16 }} /> Log out
                </button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  );
}
