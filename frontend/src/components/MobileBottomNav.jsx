import React, { useContext } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { SocketContext } from '../context/SocketContext';
import {
  Compass,
  Calendar,
  Building2,
  MessageSquare,
  LayoutDashboard,
  User,
  Sparkles
} from 'lucide-react';
import { motion } from 'framer-motion';

export default function MobileBottomNav() {
  const { user } = useContext(AuthContext);
  const { notifications } = useContext(SocketContext) || { notifications: [] };
  const location = useLocation();

  const unreadNotifCount = notifications?.filter(n => !n.is_read)?.length || 0;

  const getDashboardPath = () => {
    if (!user) return '/login';
    if (user.role === 'admin') return '/admin';
    if (user.role === 'coordinator') return '/coordinator';
    return '/dashboard';
  };

  const navItems = [
    {
      label: 'Clubs',
      path: '/explore',
      icon: Compass,
      match: ['/explore', '/clubs']
    },
    {
      label: 'Events',
      path: '/events',
      icon: Calendar,
      match: ['/events']
    },
    {
      label: 'Venues',
      path: '/venues',
      icon: Building2,
      match: ['/venues']
    },
    {
      label: 'Chat',
      path: user ? '/messages' : '/mentors',
      icon: MessageSquare,
      match: ['/messages', '/mentors']
    },
    {
      label: user ? 'Hub' : 'Sign In',
      path: getDashboardPath(),
      icon: user ? LayoutDashboard : User,
      match: ['/dashboard', '/coordinator', '/admin', '/login', '/profile'],
      badge: unreadNotifCount > 0 ? unreadNotifCount : null
    }
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 block md:hidden bg-white/95 backdrop-blur-xl border-t border-slate-200/90 shadow-[0_-4px_25px_rgba(15,23,42,0.08)] px-2 py-1.5 transition-all">
      <div className="flex items-center justify-around max-w-lg mx-auto">
        {navItems.map((item) => {
          const isActive = item.match.some(m => location.pathname.startsWith(m) || location.pathname === m);
          const Icon = item.icon;

          return (
            <Link
              key={item.label}
              to={item.path}
              className="relative flex flex-col items-center justify-center flex-1 py-1 px-1 rounded-2xl group transition-all"
            >
              {isActive && (
                <motion.div
                  layoutId="mobile-nav-indicator"
                  className="absolute inset-x-2 inset-y-0.5 rounded-xl bg-indigo-50/90 border border-indigo-100"
                  transition={{ type: 'spring', stiffness: 400, damping: 32 }}
                />
              )}

              <div className="relative z-10 flex flex-col items-center">
                <div className="relative">
                  <Icon
                    className={`w-5 h-5 transition-transform duration-200 group-active:scale-90 ${
                      isActive ? 'text-indigo-600 scale-105' : 'text-slate-400 group-hover:text-slate-600'
                    }`}
                  />
                  {item.badge && (
                    <span className="absolute -top-1 -right-2 flex h-4 min-w-4 px-1 items-center justify-center rounded-full bg-rose-500 text-[9px] font-extrabold text-white shadow-sm animate-pulse">
                      {item.badge}
                    </span>
                  )}
                </div>
                <span
                  className={`text-[10px] font-bold mt-0.5 tracking-tight transition-colors ${
                    isActive ? 'text-indigo-700 font-extrabold' : 'text-slate-500'
                  }`}
                >
                  {item.label}
                </span>
              </div>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
