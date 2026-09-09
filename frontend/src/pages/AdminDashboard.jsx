import React, { useEffect, useState } from 'react';
import API from '../services/api';
import {
  Shield,
  Users,
  Compass,
  Calendar,
  PlusCircle,
  CheckCircle2,
  Trash2,
  Sparkles,
  UserCheck,
  Building2
} from 'lucide-react';
import { motion } from 'framer-motion';

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [popularClubs, setPopularClubs] = useState([]);
  const [students, setStudents] = useState([]);
  const [clubs, setClubs] = useState([]);
  const [loading, setLoading] = useState(true);

  // Form states
  const [coordEmail, setCoordEmail] = useState('');
  const [coordClubId, setCoordClubId] = useState('');
  const [coordRole, setCoordRole] = useState('Head Coordinator');
  const [assignSuccess, setAssignSuccess] = useState(false);

  const [newClub, setNewClub] = useState({
    name: '',
    category: 'technical',
    description: '',
    about: '',
    activities: '',
    eligibility: '',
    beginners_allowed: true
  });
  const [createClubSuccess, setCreateClubSuccess] = useState(false);

  const fetchAdminData = async () => {
    try {
      const statsRes = await API.get('/admin/dashboard');
      const studentsRes = await API.get('/admin/students');
      const clubsRes = await API.get('/clubs?limit=100');

      setStats(statsRes.data.stats);
      setPopularClubs(statsRes.data.analytics?.popularClubs || []);
      setStudents(studentsRes.data.students || []);
      setClubs(clubsRes.data.clubs || []);
    } catch (err) {
      console.error('Error fetching admin data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminData();
  }, []);

  const handleAssignCoordinator = async (e) => {
    e.preventDefault();
    try {
      await API.post('/admin/assign-coordinator', {
        email: coordEmail,
        clubId: coordClubId,
        roleTitle: coordRole
      });
      setAssignSuccess(true);
      setCoordEmail('');
      setTimeout(() => setAssignSuccess(false), 2000);
      fetchAdminData();
    } catch (err) {
      console.error(err);
      alert('Error assigning coordinator');
    }
  };

  const handleCreateClub = async (e) => {
    e.preventDefault();
    try {
      await API.post('/admin/clubs', newClub);
      setCreateClubSuccess(true);
      setNewClub({
        name: '',
        category: 'technical',
        description: '',
        about: '',
        activities: '',
        eligibility: '',
        beginners_allowed: true
      });
      setTimeout(() => setCreateClubSuccess(false), 2000);
      fetchAdminData();
    } catch (err) {
      console.error(err);
      alert('Error creating club');
    }
  };

  const handleDeleteClub = async (clubId) => {
    if (!window.confirm('Are you sure you want to delete this club? This action is irreversible.')) return;
    try {
      await API.delete(`/admin/clubs/${clubId}`);
      fetchAdminData();
    } catch (err) {
      console.error(err);
      alert('Error deleting club');
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[70vh] items-center justify-center bg-[#f8fafc]">
        <div className="flex flex-col items-center gap-3">
          <div className="h-10 w-10 animate-spin rounded-full border-3 border-t-indigo-600 border-indigo-200" />
          <span className="text-xs font-bold text-slate-500">Loading admin console...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-900 py-10 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Glow */}
      <div className="absolute top-10 right-10 w-96 h-96 rounded-full bg-indigo-200/40 blur-[100px] pointer-events-none" />

      <div className="mx-auto max-w-7xl relative z-10 space-y-8">

        {/* Header */}
        <div className="glass-card rounded-3xl p-8 border border-slate-200 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full bg-indigo-50 border border-indigo-200 px-3.5 py-1 text-xs font-bold text-indigo-700 mb-3 shadow-xs">
              <Shield className="h-3.5 w-3.5 text-indigo-600" />
              <span>Institutional Oversight</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold font-['Space_Grotesk'] tracking-tight text-slate-900">
              Campus Admin Console
            </h1>
            <p className="text-slate-500 text-xs mt-1 font-medium">
              Manage clubs, assign student coordinators, and track campus-wide engagement.
            </p>
          </div>
        </div>

        {/* Analytics Counter Grid */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <div className="glass-card p-5 rounded-3xl border border-slate-200 shadow-sm text-center bg-white">
            <span className="text-slate-400 uppercase font-bold text-[10px] tracking-wider block">Total Students</span>
            <span className="text-2xl sm:text-3xl font-extrabold font-['Space_Grotesk'] text-slate-900 mt-1 block">
              {stats?.totalStudents || 0}
            </span>
          </div>
          <div className="glass-card p-5 rounded-3xl border border-slate-200 shadow-sm text-center bg-white">
            <span className="text-slate-400 uppercase font-bold text-[10px] tracking-wider block">Total Clubs</span>
            <span className="text-2xl sm:text-3xl font-extrabold font-['Space_Grotesk'] text-slate-900 mt-1 block">
              {stats?.totalClubs || 0}
            </span>
          </div>
          <div className="glass-card p-5 rounded-3xl border border-slate-200 shadow-sm text-center bg-white">
            <span className="text-slate-400 uppercase font-bold text-[10px] tracking-wider block">Total Events</span>
            <span className="text-2xl sm:text-3xl font-extrabold font-['Space_Grotesk'] text-slate-900 mt-1 block">
              {stats?.totalEvents || 0}
            </span>
          </div>
          <div className="glass-card p-5 rounded-3xl border border-slate-200 shadow-sm text-center bg-white">
            <span className="text-slate-400 uppercase font-bold text-[10px] tracking-wider block">Recruiting Clubs</span>
            <span className="text-2xl sm:text-3xl font-extrabold font-['Space_Grotesk'] text-emerald-600 mt-1 block">
              {stats?.openRegistrations || 0}
            </span>
          </div>
          <div className="glass-card p-5 rounded-3xl border border-slate-200 shadow-sm text-center bg-white">
            <span className="text-slate-400 uppercase font-bold text-[10px] tracking-wider block">Pending Applications</span>
            <span className="text-2xl sm:text-3xl font-extrabold font-['Space_Grotesk'] text-indigo-600 mt-1 block">
              {stats?.pendingApplications || 0}
            </span>
          </div>
        </div>

        {/* 2-Column Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          <div className="lg:col-span-2 space-y-8">
            {/* Assign Coordinator Form */}
            <div className="glass-card rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm bg-white">
              <h2 className="text-lg font-bold font-['Space_Grotesk'] text-slate-900 mb-4 flex items-center gap-2">
                <UserCheck className="h-5 w-5 text-indigo-600" />
                Assign Club Coordinator Role
              </h2>

              {assignSuccess && (
                <div className="rounded-2xl bg-emerald-50 border border-emerald-200 p-3 text-xs text-emerald-700 mb-4 flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600" />
                  <span>Student coordinator privileges granted!</span>
                </div>
              )}

              <form onSubmit={handleAssignCoordinator} className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <input
                  type="email"
                  required
                  value={coordEmail}
                  onChange={(e) => setCoordEmail(e.target.value)}
                  placeholder="Student email address..."
                  className="rounded-2xl border border-slate-200 bg-slate-50/70 py-2.5 px-3 text-xs text-slate-900 focus:border-indigo-500 focus:bg-white focus:outline-none font-medium"
                />
                <select
                  required
                  value={coordClubId}
                  onChange={(e) => setCoordClubId(e.target.value)}
                  className="rounded-2xl border border-slate-200 bg-slate-50/70 py-2.5 px-3 text-xs text-slate-700 focus:border-indigo-500 focus:bg-white focus:outline-none font-bold"
                >
                  <option value="">Select Target Club</option>
                  {clubs.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
                <button
                  type="submit"
                  className="rounded-2xl bg-gradient-to-r from-indigo-600 to-violet-600 py-2.5 text-xs font-bold text-white shadow-md shadow-indigo-600/20 hover:opacity-95 transition-all cursor-pointer"
                >
                  Assign Role
                </button>
              </form>
            </div>

            {/* Manage Clubs */}
            <div className="glass-card rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm bg-white">
              <h2 className="text-lg font-bold font-['Space_Grotesk'] text-slate-900 mb-4">
                Active Campus Clubs & Chapters
              </h2>

              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-slate-200 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                      <th className="py-3 px-2">Club Name</th>
                      <th className="py-3 px-2">Category</th>
                      <th className="py-3 px-2 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {clubs.map((c) => (
                      <tr key={c.id} className="text-xs sm:text-sm hover:bg-slate-50/60">
                        <td className="py-3.5 px-2 font-bold text-slate-900">{c.name}</td>
                        <td className="py-3.5 px-2">
                          <span className="text-[10px] font-bold text-indigo-700 bg-indigo-50 border border-indigo-200 px-2.5 py-0.5 rounded-full uppercase">
                            {c.category}
                          </span>
                        </td>
                        <td className="py-3.5 px-2 text-right">
                          <button
                            onClick={() => handleDeleteClub(c.id)}
                            className="text-rose-600 hover:text-rose-700 p-1.5 transition-colors cursor-pointer"
                            title="Delete Club"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Create Club Sidebar */}
          <div className="glass-card rounded-3xl p-6 border border-slate-200 shadow-sm bg-white">
            <h2 className="text-lg font-bold font-['Space_Grotesk'] text-slate-900 mb-4 flex items-center gap-2">
              <PlusCircle className="h-5 w-5 text-indigo-600" />
              Register New Club
            </h2>

            {createClubSuccess && (
              <div className="rounded-2xl bg-emerald-50 border border-emerald-200 p-3 text-xs text-emerald-700 mb-4 flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600" />
                <span>New club established!</span>
              </div>
            )}

            <form onSubmit={handleCreateClub} className="space-y-3.5">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Club Name</label>
                <input
                  type="text"
                  required
                  value={newClub.name}
                  onChange={(e) => setNewClub(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50/70 py-2 px-3 text-xs text-slate-900 focus:border-indigo-500 focus:bg-white focus:outline-none font-medium"
                  placeholder="e.g. AI & Robotics Circle"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Category</label>
                <select
                  value={newClub.category}
                  onChange={(e) => setNewClub(prev => ({ ...prev, category: e.target.value }))}
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50/70 py-2 px-3 text-xs text-slate-700 focus:border-indigo-500 focus:bg-white focus:outline-none font-bold"
                >
                  <option value="technical">Technical</option>
                  <option value="cultural">Cultural</option>
                  <option value="sports">Sports</option>
                  <option value="literary">Literary</option>
                  <option value="social">Social</option>
                  <option value="entrepreneurship">Entrepreneurship</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Tagline</label>
                <textarea
                  required
                  rows="2"
                  value={newClub.description}
                  onChange={(e) => setNewClub(prev => ({ ...prev, description: e.target.value }))}
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50/70 py-2 px-3 text-xs text-slate-900 focus:border-indigo-500 focus:bg-white focus:outline-none font-medium"
                  placeholder="Elevating campus innovation..."
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Full Description</label>
                <textarea
                  required
                  rows="3"
                  value={newClub.about}
                  onChange={(e) => setNewClub(prev => ({ ...prev, about: e.target.value }))}
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50/70 py-2 px-3 text-xs text-slate-900 focus:border-indigo-500 focus:bg-white focus:outline-none font-medium"
                  placeholder="Charter details, weekly agenda..."
                />
              </div>

              <button
                type="submit"
                className="w-full rounded-2xl bg-gradient-to-r from-indigo-600 to-violet-600 py-2.5 text-xs font-bold text-white shadow-md shadow-indigo-600/20 hover:opacity-95 transition-all cursor-pointer"
              >
                Create Club Chapter
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
