import React, { useContext, useEffect, useState } from 'react';
import { AuthContext } from '../context/AuthContext';
import {
  Compass,
  Calendar,
  AlertCircle,
  Bell,
  Award,
  User,
  ExternalLink,
  Sparkles,
  ArrowRight,
  CheckCircle2,
  Clock,
  ChevronRight,
  TrendingUp,
  Bookmark
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import API from '../services/api';

const StudentDashboard = () => {
  const { user } = useContext(AuthContext);
  const [clubs, setClubs] = useState([]);
  const [applications, setApplications] = useState([]);
  const [events, setEvents] = useState([]);
  const [announcements, setAnnouncements] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const clubsRes = await API.get('/clubs');
        const appsRes = await API.get('/clubs/registrations');
        const eventsRes = await API.get('/events?limit=5');
        const annRes = await API.get('/announcements?limit=5');
        const notifRes = await API.get('/notifications');

        setClubs(clubsRes.data.clubs || []);
        setApplications(appsRes.data || []);
        setEvents(eventsRes.data.events || []);
        setAnnouncements(annRes.data.announcements || []);
        setNotifications(notifRes.data || []);
      } catch (err) {
        console.error('Error loading dashboard data:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const calculateMatches = () => {
    if (!user || !user.Student || !user.Student.StudentInterests) return [];
    
    const userInterests = user.Student.StudentInterests.map(i => i.interest?.toLowerCase() || '');
    
    return clubs.map(club => {
      let score = 40;
      const clubName = (club.name || '').toLowerCase();
      const clubDesc = (club.description || '').toLowerCase();
      const clubCat = (club.category || '').toLowerCase();

      userInterests.forEach(interest => {
        if (interest && clubName.includes(interest)) score += 35;
        if (interest && clubDesc.includes(interest)) score += 20;
        if (interest && clubCat.includes(interest)) score += 15;
      });

      const matchPercentage = Math.min(score, 98);

      return {
        ...club,
        matchPercentage
      };
    })
    .filter(c => c.matchPercentage > 45)
    .sort((a, b) => b.matchPercentage - a.matchPercentage);
  };

  const recommendedClubs = calculateMatches().slice(0, 3);
  const myClubsCount = applications.filter(a => a.status === 'approved').length;
  const pendingAppsCount = applications.filter(a => a.status === 'pending').length;
  const unreadNotifCount = notifications.filter(n => !n.is_read).length;

  if (loading) {
    return (
      <div className="flex min-h-[70vh] items-center justify-center bg-[#f8fafc]">
        <div className="flex flex-col items-center gap-3">
          <div className="h-10 w-10 animate-spin rounded-full border-3 border-t-indigo-600 border-indigo-200" />
          <span className="text-xs font-bold text-slate-500">Loading student workspace...</span>
        </div>
      </div>
    );
  }

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'approved':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'rejected':
        return 'bg-rose-50 text-rose-700 border-rose-200';
      case 'waitlisted':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      default:
        return 'bg-indigo-50 text-indigo-700 border-indigo-200';
    }
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-900 py-10 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Background glow */}
      <div className="absolute top-10 left-10 w-96 h-96 rounded-full bg-indigo-200/40 blur-[100px] pointer-events-none" />
      <div className="absolute top-80 right-10 w-96 h-96 rounded-full bg-cyan-200/40 blur-[100px] pointer-events-none" />

      <div className="mx-auto max-w-7xl relative z-10 space-y-8">
        
        {/* Welcome Header */}
        <div className="glass-card rounded-3xl p-8 sm:p-10 border border-slate-200 shadow-sm relative overflow-hidden bg-white/95">
          <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full bg-indigo-50 border border-indigo-200 px-3.5 py-1 text-xs font-bold text-indigo-700 mb-3 shadow-xs">
                <Sparkles className="h-3.5 w-3.5 text-indigo-600" />
                <span>Student Hub</span>
              </div>
              <h1 className="text-2xl sm:text-4xl font-extrabold font-['Space_Grotesk'] tracking-tight text-slate-900">
                Welcome back, {user?.name || 'Student'} 👋
              </h1>
              <p className="text-slate-600 text-sm mt-1 font-medium">
                Here is a summary of your active memberships, upcoming campus events, and announcements.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <Link
                to="/explore"
                className="flex items-center gap-2 rounded-2xl bg-gradient-to-r from-indigo-600 to-violet-600 px-6 py-3 text-xs font-bold text-white shadow-md shadow-indigo-600/20 hover:opacity-95 transition-all"
              >
                <Compass className="h-4 w-4 text-cyan-200" />
                <span>Join New Club</span>
              </Link>
            </div>
          </div>
        </div>

        {/* Quick Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
          <div className="glass-card p-6 rounded-3xl border border-slate-200 shadow-sm bg-white">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">My Clubs</span>
              <div className="p-2.5 rounded-2xl bg-indigo-50 border border-indigo-100 text-indigo-600 shadow-xs">
                <Compass className="h-4.5 w-4.5" />
              </div>
            </div>
            <span className="text-3xl font-extrabold font-['Space_Grotesk'] text-slate-900">{myClubsCount}</span>
            <span className="block text-xs font-medium text-slate-500 mt-1">Confirmed memberships</span>
          </div>

          <div className="glass-card p-6 rounded-3xl border border-slate-200 shadow-sm bg-white">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Campus Events</span>
              <div className="p-2.5 rounded-2xl bg-violet-50 border border-violet-100 text-violet-600 shadow-xs">
                <Calendar className="h-4.5 w-4.5" />
              </div>
            </div>
            <span className="text-3xl font-extrabold font-['Space_Grotesk'] text-slate-900">{events.length}</span>
            <span className="block text-xs font-medium text-slate-500 mt-1">Upcoming scheduled</span>
          </div>

          <div className="glass-card p-6 rounded-3xl border border-slate-200 shadow-sm bg-white">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Applications</span>
              <div className="p-2.5 rounded-2xl bg-amber-50 border border-amber-100 text-amber-600 shadow-xs">
                <AlertCircle className="h-4.5 w-4.5" />
              </div>
            </div>
            <span className="text-3xl font-extrabold font-['Space_Grotesk'] text-slate-900">{pendingAppsCount}</span>
            <span className="block text-xs font-medium text-slate-500 mt-1">Under review</span>
          </div>

          <div className="glass-card p-6 rounded-3xl border border-slate-200 shadow-sm bg-white">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Notifications</span>
              <div className="p-2.5 rounded-2xl bg-rose-50 border border-rose-100 text-rose-600 shadow-xs">
                <Bell className="h-4.5 w-4.5" />
              </div>
            </div>
            <span className="text-3xl font-extrabold font-['Space_Grotesk'] text-slate-900">{unreadNotifCount}</span>
            <span className="block text-xs font-medium text-slate-500 mt-1">Unread updates</span>
          </div>
        </div>

        {/* Main Grid: Recommended & Applications + Sidebar */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          <div className="lg:col-span-2 space-y-8">
            
            {/* Recommended Clubs */}
            <div className="glass-card rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm bg-white">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-xl font-bold font-['Space_Grotesk'] text-slate-900 flex items-center gap-2">
                    <Sparkles className="h-5 w-5 text-indigo-600" />
                    Recommended Clubs For You
                  </h2>
                  <p className="text-xs text-slate-500 font-medium mt-0.5">Matched with your profile skills and interests</p>
                </div>
                <Link to="/explore" className="text-xs font-bold text-indigo-600 hover:text-indigo-700">
                  View All →
                </Link>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {recommendedClubs.map((club) => (
                  <div
                    key={club.id}
                    className="rounded-3xl p-5 border border-slate-200 bg-slate-50/50 hover:bg-white hover:border-indigo-300 hover:shadow-md transition-all flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-[10px] font-bold text-indigo-700 bg-indigo-50 border border-indigo-200 px-2.5 py-0.5 rounded-full">
                          {club.matchPercentage}% match
                        </span>
                      </div>
                      <h3 className="font-bold text-sm text-slate-900 mb-1">{club.name}</h3>
                      <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed font-medium">
                        {club.description}
                      </p>
                    </div>
                    <Link
                      to={`/clubs/${club.id}`}
                      className="mt-4 flex items-center justify-between text-xs font-bold text-indigo-600 hover:text-indigo-800 pt-3 border-t border-slate-200/80"
                    >
                      <span>Explore Club</span>
                      <ExternalLink className="h-3.5 w-3.5" />
                    </Link>
                  </div>
                ))}

                {recommendedClubs.length === 0 && (
                  <div className="col-span-3 text-center py-8 text-slate-500 text-xs font-medium">
                    <p>No club recommendations found yet. Update your interests in your profile to get matches!</p>
                    <Link to="/profile" className="text-indigo-600 font-bold hover:underline mt-2 inline-block">
                      Edit Profile Interests
                    </Link>
                  </div>
                )}
              </div>
            </div>

            {/* My Club Applications */}
            <div className="glass-card rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm bg-white">
              <h2 className="text-xl font-bold font-['Space_Grotesk'] text-slate-900 mb-6">
                My Club Applications
              </h2>

              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-slate-200 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                      <th className="py-3 px-2">Club</th>
                      <th className="py-3 px-2">Applied Date</th>
                      <th className="py-3 px-2">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {applications.map((app) => (
                      <tr key={app.id} className="text-xs sm:text-sm hover:bg-slate-50/60 transition-colors">
                        <td className="py-3.5 px-2 font-bold text-slate-900 flex items-center gap-2.5">
                          {app.Club?.logo_url && (
                            <img src={app.Club.logo_url} className="h-6 w-6 rounded-full object-cover border border-slate-200" />
                          )}
                          <span>{app.Club?.name || 'Club Membership'}</span>
                        </td>
                        <td className="py-3.5 px-2 text-slate-500 font-medium">
                          {new Date(app.applied_date || Date.now()).toLocaleDateString()}
                        </td>
                        <td className="py-3.5 px-2">
                          <span className={`inline-block border rounded-full px-3 py-0.5 text-[11px] font-bold capitalize ${getStatusBadgeClass(app.status)}`}>
                            {app.status}
                          </span>
                        </td>
                      </tr>
                    ))}

                    {applications.length === 0 && (
                      <tr>
                        <td colSpan="3" className="py-8 text-center text-xs text-slate-500 font-medium">
                          You haven't submitted any club recruitment forms yet.{' '}
                          <Link to="/explore" className="text-indigo-600 font-bold hover:underline">
                            Browse Open Clubs
                          </Link>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Sidebar: Bulletins & Quick Links */}
          <div className="space-y-6">
            <div className="glass-card rounded-3xl p-6 border border-slate-200 shadow-sm bg-white">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-['Space_Grotesk'] text-lg font-bold text-slate-900">
                  Campus Bulletins
                </h3>
                <span className="rounded-full bg-indigo-50 border border-indigo-200 px-2.5 py-0.5 text-[10px] font-bold text-indigo-700">
                  Live
                </span>
              </div>

              <div className="space-y-4">
                {announcements.slice(0, 4).map((ann) => (
                  <div key={ann.id} className="border-b border-slate-100 pb-3.5 last:border-none last:pb-0">
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-700 bg-indigo-50 border border-indigo-200 px-2 py-0.5 rounded-full">
                        {ann.category || 'General'}
                      </span>
                      <span className="text-[10px] text-slate-400 font-medium">
                        {new Date(ann.created_at || Date.now()).toLocaleDateString()}
                      </span>
                    </div>
                    <h4 className="text-xs font-bold text-slate-800 line-clamp-1">{ann.title}</h4>
                    <p className="text-[11px] text-slate-500 line-clamp-2 mt-1 leading-relaxed">
                      {ann.content}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Quick Links Card */}
            <div className="rounded-3xl p-6 border border-indigo-100 bg-gradient-to-br from-indigo-50/80 to-violet-50/80 shadow-xs">
              <h3 className="font-['Space_Grotesk'] text-base font-bold text-slate-900 mb-1.5">
                Need Guidance?
              </h3>
              <p className="text-xs text-slate-600 mb-4 leading-relaxed font-medium">
                Connect with senior mentors or check curated career roadmaps to prepare for internships.
              </p>
              <div className="space-y-2">
                <Link
                  to="/mentors"
                  className="flex items-center justify-between rounded-2xl bg-white hover:bg-indigo-600 hover:text-white px-4 py-2.5 text-xs font-bold text-slate-700 shadow-xs transition-all"
                >
                  <span>Chat With Senior Mentor</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </Link>
                <Link
                  to="/roadmap"
                  className="flex items-center justify-between rounded-2xl bg-white hover:bg-violet-600 hover:text-white px-4 py-2.5 text-xs font-bold text-slate-700 shadow-xs transition-all"
                >
                  <span>View Tech Roadmaps</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentDashboard;
