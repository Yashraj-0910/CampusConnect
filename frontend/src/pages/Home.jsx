import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Compass,
  Users,
  Calendar,
  Award,
  ArrowRight,
  Sparkles,
  Zap,
  TrendingUp,
  MapPin,
  Clock,
  ShieldCheck,
  ChevronRight,
  Flame,
  Heart,
  Smile
} from 'lucide-react';
import API from '../services/api';

const Home = () => {
  const [events, setEvents] = useState([]);
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const eventsRes = await API.get('/events?limit=4');
        const announcementsRes = await API.get('/announcements?limit=3');
        setEvents(eventsRes.data.events || []);
        setAnnouncements(announcementsRes.data.announcements || []);
      } catch (err) {
        console.error('Error fetching landing page data:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const stats = [
    { label: 'Active Student Clubs', value: '35+', icon: Compass, color: 'text-indigo-600', bg: 'bg-indigo-50 border-indigo-100', glow: 'from-indigo-400/20' },
    { label: 'Campus Hackathons & Fests', value: '120+', icon: Calendar, color: 'text-violet-600', bg: 'bg-violet-50 border-violet-100', glow: 'from-violet-400/20' },
    { label: 'Student Members', value: '3,500+', icon: Users, color: 'text-cyan-600', bg: 'bg-cyan-50 border-cyan-100', glow: 'from-cyan-400/20' },
    { label: 'Mentorship Hours', value: '850+', icon: Award, color: 'text-amber-600', bg: 'bg-amber-50 border-amber-100', glow: 'from-amber-400/20' },
  ];

  const features = [
    {
      title: 'Find Your Tribe & Clubs',
      description: 'Explore coding circles, robotics labs, cultural troops, design guilds, and sports teams tailored to your passions.',
      icon: Compass,
      tag: 'Explore',
      color: 'bg-indigo-50 text-indigo-600 border-indigo-200',
      accent: 'text-indigo-600'
    },
    {
      title: 'Hackathons & Live Fests',
      description: 'Join one-click registrations for 24h hackathons, hands-on workshops, music jams, and guest keynotes.',
      icon: Flame,
      tag: 'Compete',
      color: 'bg-amber-50 text-amber-600 border-amber-200',
      accent: 'text-amber-600'
    },
    {
      title: 'Senior Mentorship',
      description: 'Connect with top seniors, alumni, and campus leaders to get interview prep, club advice, and resume reviews.',
      icon: Users,
      tag: 'Connect',
      color: 'bg-cyan-50 text-cyan-600 border-cyan-200',
      accent: 'text-cyan-600'
    },
    {
      title: 'Curated Roadmaps',
      description: 'Step-by-step career blueprints for Web Development, AI/ML, Cloud, UI/UX Design, and Core Engineering.',
      icon: TrendingUp,
      tag: 'Learn',
      color: 'bg-emerald-50 text-emerald-600 border-emerald-200',
      accent: 'text-emerald-600'
    },
  ];

  return (
    <div className="relative min-h-screen bg-[#f8fafc] text-slate-900 overflow-hidden">
      {/* Soft Ambient mesh gradient blobs */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-[600px] bg-radial-glow pointer-events-none" />
      <div className="absolute top-10 -left-20 w-96 h-96 rounded-full bg-indigo-200/40 blur-[100px] pointer-events-none" />
      <div className="absolute top-40 -right-20 w-96 h-96 rounded-full bg-cyan-200/40 blur-[100px] pointer-events-none" />
      <div className="absolute top-[600px] left-1/3 w-80 h-80 rounded-full bg-violet-200/30 blur-[90px] pointer-events-none" />

      {/* Hero Section */}
      <section className="relative pt-20 pb-16 lg:pt-32 lg:pb-28">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center relative z-10">
          
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: -15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 rounded-full border border-indigo-200 bg-white/90 px-4 py-1.5 text-xs sm:text-sm font-bold text-indigo-700 backdrop-blur-md mb-8 shadow-sm hover:border-indigo-300 transition-all cursor-default"
          >
            <Sparkles className="h-4 w-4 text-indigo-600 animate-bounce" />
            <span>Welcome to College Life & Communities!</span>
            <ChevronRight className="h-3.5 w-3.5 text-indigo-400" />
          </motion.div>

          {/* Main Title */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.1 }}
            className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight font-['Space_Grotesk'] leading-[1.1] max-w-4xl mx-auto text-slate-900"
          >
            Discover Your Passion & <br />
            <span className="text-gradient-primary">Make Lifelong Friends</span>
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="mx-auto max-w-2xl text-base sm:text-lg lg:text-xl text-slate-600 mt-6 mb-10 font-medium leading-relaxed"
          >
            The easiest way for students to explore campus clubs, sign up for exciting events, chat with senior mentors, and kickstart their college journey.
          </motion.p>

          {/* Hero CTAs */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.3 }}
            className="flex flex-wrap items-center justify-center gap-4"
          >
            <Link
              to="/explore"
              className="relative group overflow-hidden rounded-2xl bg-gradient-to-r from-indigo-600 via-violet-600 to-cyan-600 p-[1.5px] shadow-xl shadow-indigo-500/20 hover:shadow-indigo-500/35 transition-all duration-300"
            >
              <div className="flex items-center gap-2 rounded-[14.5px] bg-gradient-to-r from-indigo-600 to-violet-600 px-8 py-4 text-base font-bold text-white transition-all group-hover:bg-opacity-95">
                <Compass className="h-5 w-5 text-cyan-200" />
                <span>Explore Campus Clubs</span>
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </div>
            </Link>

            <Link
              to="/events"
              className="flex items-center gap-2 rounded-2xl border border-slate-300 bg-white px-8 py-4 text-base font-bold text-slate-800 hover:bg-slate-50 hover:text-indigo-600 shadow-sm transition-all duration-200"
            >
              <Calendar className="h-5 w-5 text-indigo-600" />
              <span>Upcoming Fests & Events</span>
            </Link>
          </motion.div>

          {/* Trust Badges */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: 0.5 }}
            className="mt-14 flex flex-wrap items-center justify-center gap-6 sm:gap-8 text-xs font-semibold text-slate-500"
          >
            <div className="flex items-center gap-2 bg-white/80 border border-slate-200/80 px-3.5 py-1.5 rounded-full shadow-xs">
              <ShieldCheck className="h-4 w-4 text-emerald-600" />
              <span>100% Verified University Chapters</span>
            </div>
            <div className="flex items-center gap-2 bg-white/80 border border-slate-200/80 px-3.5 py-1.5 rounded-full shadow-xs">
              <Zap className="h-4 w-4 text-amber-500" />
              <span>Instant Event Registration</span>
            </div>
            <div className="flex items-center gap-2 bg-white/80 border border-slate-200/80 px-3.5 py-1.5 rounded-full shadow-xs">
              <Heart className="h-4 w-4 text-rose-500" />
              <span>Beginner Friendly Environments</span>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Stats Counter Section */}
      <section className="relative py-12 border-y border-slate-200/80 bg-white/70 backdrop-blur-md">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            {stats.map((stat, i) => {
              const Icon = stat.icon;
              return (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className="glass-card p-6 rounded-3xl relative overflow-hidden group hover:border-indigo-300 transition-all shadow-sm"
                >
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-3xl sm:text-4xl font-extrabold font-['Space_Grotesk'] text-slate-900 tracking-tight">
                      {stat.value}
                    </span>
                    <div className={`p-3 rounded-2xl border ${stat.bg} ${stat.color} shadow-xs`}>
                      <Icon className="h-5 w-5" />
                    </div>
                  </div>
                  <p className="text-xs sm:text-sm font-bold text-slate-600">{stat.label}</p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Bento Grid Feature Showcase */}
      <section className="py-24 relative">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <span className="inline-block rounded-full bg-indigo-50 px-4 py-1 text-xs font-bold text-indigo-700 border border-indigo-200/80 uppercase tracking-wider mb-4 shadow-xs">
              Everything in One Place
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold font-['Space_Grotesk'] tracking-tight text-slate-900">
              Designed For A Vibrant Student Experience
            </h2>
            <p className="text-slate-600 mt-4 text-base leading-relaxed">
              Experience seamless club recruitment, instant event ticketing, senior mentor chats, and curated learning roadmaps.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feat, index) => {
              const Icon = feat.icon;
              return (
                <motion.div
                  key={feat.title}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className="glass-card glass-card-hover p-7 rounded-3xl flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between mb-6">
                      <div className={`p-3.5 rounded-2xl border ${feat.color} shadow-xs`}>
                        <Icon className="h-6 w-6" />
                      </div>
                      <span className="rounded-full bg-slate-100 border border-slate-200 px-3 py-0.5 text-[10px] font-bold text-slate-600 uppercase tracking-wider">
                        {feat.tag}
                      </span>
                    </div>
                    <h3 className="text-lg font-bold text-slate-900 mb-2">{feat.title}</h3>
                    <p className="text-sm text-slate-600 leading-relaxed font-medium">{feat.description}</p>
                  </div>
                  <div className="pt-6 border-t border-slate-100 mt-6">
                    <Link
                      to="/explore"
                      className={`inline-flex items-center gap-1.5 text-xs font-bold ${feat.accent} hover:underline`}
                    >
                      Learn more <ArrowRight className="h-3.5 w-3.5" />
                    </Link>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Featured Events Section */}
      <section className="py-20 border-t border-slate-200 bg-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between mb-12 gap-4">
            <div>
              <div className="flex items-center gap-2 text-indigo-600 text-xs font-bold uppercase tracking-wider mb-2">
                <Flame className="h-4 w-4 text-amber-500" />
                <span>Live & Upcoming</span>
              </div>
              <h2 className="text-3xl font-extrabold font-['Space_Grotesk'] tracking-tight text-slate-900">
                Featured Campus Events & Fests
              </h2>
            </div>
            <Link
              to="/events"
              className="inline-flex items-center gap-2 text-sm font-bold text-indigo-600 hover:text-indigo-700 transition-colors"
            >
              Browse All Events <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[1, 2, 3].map((n) => (
                <div key={n} className="h-64 rounded-3xl bg-slate-100 animate-pulse border border-slate-200" />
              ))}
            </div>
          ) : events.length === 0 ? (
            <div className="glass-card p-12 text-center rounded-3xl border border-slate-200">
              <Calendar className="h-12 w-12 text-slate-400 mx-auto mb-4" />
              <h3 className="text-lg font-bold text-slate-800">No active events listed right now</h3>
              <p className="text-sm text-slate-500 mt-1 mb-6">Be the first club coordinator to host a new event!</p>
              <Link
                to="/events"
                className="inline-flex items-center gap-2 rounded-2xl bg-indigo-600 px-6 py-3 text-xs font-bold text-white shadow-sm"
              >
                Go to Events Hub
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {events.slice(0, 3).map((event) => (
                <motion.div
                  key={event.id}
                  whileHover={{ y: -4 }}
                  className="glass-card glass-card-hover rounded-3xl overflow-hidden flex flex-col justify-between border border-slate-200 shadow-sm"
                >
                  {event.cover_image && (
                    <div className="relative h-48 w-full overflow-hidden bg-slate-100">
                      <img
                        src={event.cover_image}
                        alt={event.title}
                        className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
                      />
                      <span className="absolute top-4 right-4 rounded-full bg-white/90 backdrop-blur-md px-3 py-1 text-[11px] font-bold text-indigo-700 shadow-xs border border-slate-200">
                        {event.status || 'Active'}
                      </span>
                    </div>
                  )}

                  <div className="p-6 flex-1 flex flex-col justify-between">
                    <div>
                      <h3 className="text-lg font-bold text-slate-900 mb-2 line-clamp-1">{event.title}</h3>
                      <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed mb-4">
                        {event.description}
                      </p>
                    </div>

                    <div>
                      <div className="space-y-1.5 py-3 border-y border-slate-100 text-xs text-slate-600">
                        <div className="flex items-center gap-2">
                          <Clock className="h-3.5 w-3.5 text-indigo-600" />
                          <span>{event.event_date ? new Date(event.event_date).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' }) : 'Date TBA'}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <MapPin className="h-3.5 w-3.5 text-cyan-600" />
                          <span className="truncate">{event.venue || 'Campus Auditorium'}</span>
                        </div>
                      </div>

                      <Link
                        to={`/events/${event.id}`}
                        className="mt-4 flex items-center justify-center gap-2 w-full rounded-2xl bg-indigo-50 hover:bg-indigo-600 hover:text-white border border-indigo-200/80 py-2.5 text-xs font-bold text-indigo-700 transition-all duration-200 shadow-xs"
                      >
                        <span>View Details & RSVP</span>
                        <ArrowRight className="h-3.5 w-3.5" />
                      </Link>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Announcements */}
      <section className="py-20 bg-slate-50">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <span className="text-xs font-bold uppercase tracking-wider text-indigo-600">Official Feed</span>
            <h2 className="text-3xl font-bold font-['Space_Grotesk'] tracking-tight text-slate-900 mt-1">
              Campus Bulletins & Announcements
            </h2>
          </div>

          <div className="space-y-4">
            {announcements.length === 0 ? (
              <div className="glass-card p-8 text-center rounded-3xl text-slate-500 text-sm border border-slate-200">
                No recent announcements posted.
              </div>
            ) : (
              announcements.map((announcement) => (
                <div
                  key={announcement.id}
                  className={`glass-card p-6 rounded-3xl transition-all border ${
                    announcement.is_important
                      ? 'border-rose-200 bg-rose-50/50'
                      : 'border-slate-200 hover:border-indigo-300'
                  }`}
                >
                  <div className="flex items-center justify-between mb-3">
                    <span
                      className={`text-[10px] font-bold uppercase tracking-wider px-3 py-0.5 rounded-full ${
                        announcement.is_important
                          ? 'bg-rose-100 text-rose-700 border border-rose-200'
                          : 'bg-indigo-50 text-indigo-700 border border-indigo-200'
                      }`}
                    >
                      {announcement.category || 'General'}
                    </span>
                    <span className="text-xs text-slate-400 font-medium">
                      {new Date(announcement.created_at || Date.now()).toLocaleDateString()}
                    </span>
                  </div>
                  <h3 className="text-base font-bold text-slate-900 mb-1.5">{announcement.title}</h3>
                  <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">{announcement.content}</p>
                </div>
              ))
            )}
          </div>
        </div>
      </section>

      {/* Bottom CTA Banner */}
      <section className="py-20 relative">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-indigo-600 via-violet-600 to-cyan-600 p-10 sm:p-16 text-center shadow-xl text-white">
            <div className="relative z-10 max-w-2xl mx-auto space-y-6">
              <h2 className="text-3xl sm:text-5xl font-extrabold font-['Space_Grotesk'] tracking-tight">
                Ready to Jump Into College Life?
              </h2>
              <p className="text-indigo-100 text-sm sm:text-base leading-relaxed font-medium">
                Join thousands of students finding their passions, making friends, and shaping their campus community.
              </p>
              <div className="flex flex-wrap justify-center gap-4 pt-2">
                <Link
                  to="/register"
                  className="rounded-2xl bg-white px-8 py-4 text-sm font-bold text-indigo-700 shadow-md hover:bg-slate-50 transition-all"
                >
                  Create Student Profile
                </Link>
                <Link
                  to="/explore"
                  className="rounded-2xl border border-white/40 bg-white/10 backdrop-blur-md px-8 py-4 text-sm font-bold text-white hover:bg-white/20 transition-all"
                >
                  Explore Clubs Directory
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
