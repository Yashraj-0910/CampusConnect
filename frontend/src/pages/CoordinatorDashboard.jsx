import React, { useEffect, useState } from 'react';
import API from '../services/api';
import {
  Compass,
  Calendar,
  AlertCircle,
  PlusCircle,
  CheckCircle2,
  XCircle,
  Check,
  X,
  Users,
  Sparkles,
  Clock,
  Radio
} from 'lucide-react';
import { motion } from 'framer-motion';

const CoordinatorDashboard = () => {
  const [club, setClub] = useState(null);
  const [applicants, setApplicants] = useState([]);
  const [loading, setLoading] = useState(true);

  // Forms
  const [newEvent, setNewEvent] = useState({
    title: '',
    description: '',
    venue: '',
    event_date: '',
    registration_deadline: '',
    max_participants: '',
    rules: '',
    eligibility: '',
    prizes: ''
  });
  const [eventSuccess, setEventSuccess] = useState(false);

  const [newAnnouncement, setNewAnnouncement] = useState({
    title: '',
    content: '',
    is_important: false
  });
  const [annSuccess, setAnnSuccess] = useState(false);

  const fetchCoordinatorClub = async () => {
    try {
      const { data } = await API.get('/coordinator/my-club');
      setClub(data.club);

      if (data.club) {
        const appsRes = await API.get(`/coordinator/clubs/${data.club.id}/applicants`);
        setApplicants(appsRes.data || []);
      }
    } catch (err) {
      console.error('Error fetching coordinator club:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCoordinatorClub();
  }, []);

  const handleApplication = async (regId, status) => {
    try {
      await API.put(`/coordinator/applications/${regId}`, { status });
      fetchCoordinatorClub();
    } catch (err) {
      console.error(err);
      alert('Error updating applicant status');
    }
  };

  const handleCreateEvent = async (e) => {
    e.preventDefault();
    try {
      await API.post(`/coordinator/clubs/${club.id}/events`, newEvent);
      setEventSuccess(true);
      setNewEvent({
        title: '',
        description: '',
        venue: '',
        event_date: '',
        registration_deadline: '',
        max_participants: '',
        rules: '',
        eligibility: '',
        prizes: ''
      });
      setTimeout(() => setEventSuccess(false), 2000);
      fetchCoordinatorClub();
    } catch (err) {
      console.error(err);
      alert('Error scheduling event');
    }
  };

  const handleCreateAnnouncement = async (e) => {
    e.preventDefault();
    try {
      await API.post(`/coordinator/clubs/${club.id}/announcements`, newAnnouncement);
      setAnnSuccess(true);
      setNewAnnouncement({
        title: '',
        content: '',
        is_important: false
      });
      setTimeout(() => setAnnSuccess(false), 2000);
      fetchCoordinatorClub();
    } catch (err) {
      console.error(err);
      alert('Error posting announcement');
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[70vh] items-center justify-center bg-[#f8fafc]">
        <div className="flex flex-col items-center gap-3">
          <div className="h-10 w-10 animate-spin rounded-full border-3 border-t-indigo-600 border-indigo-200" />
          <span className="text-xs font-bold text-slate-500">Loading coordinator console...</span>
        </div>
      </div>
    );
  }

  if (!club) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-24 text-center min-h-[60vh] bg-[#f8fafc]">
        <h2 className="text-2xl font-bold font-['Space_Grotesk'] text-slate-900">Access Restricted</h2>
        <p className="text-slate-500 text-xs sm:text-sm mt-2 font-medium">You are not registered as an active coordinator for any club chapter.</p>
      </div>
    );
  }

  const pendingApplicants = applicants.filter(a => a.status === 'pending');

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-900 py-10 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Background glow */}
      <div className="absolute top-10 right-10 w-96 h-96 rounded-full bg-indigo-200/40 blur-[100px] pointer-events-none" />

      <div className="mx-auto max-w-7xl relative z-10 space-y-8">
        
        {/* Header */}
        <div className="glass-card rounded-3xl p-8 border border-slate-200 shadow-sm relative overflow-hidden bg-white">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-700 bg-indigo-50 border border-indigo-200 px-3 py-1 rounded-full">
                Coordinator Console
              </span>
              <h1 className="text-2xl sm:text-3xl font-extrabold font-['Space_Grotesk'] tracking-tight text-slate-900 mt-3">
                {club.name} Dashboard
              </h1>
              <p className="text-slate-500 text-xs mt-1 font-medium">Category: <span className="uppercase text-slate-800 font-bold">{club.category}</span></p>
            </div>
            <div className="flex items-center gap-3">
              <span className="rounded-2xl border border-indigo-200 bg-indigo-50 px-4 py-2 text-xs font-bold text-indigo-700">
                {club.ClubMembers?.length || 0} Core Members
              </span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Main Area: Pending Applicants & Members */}
          <div className="lg:col-span-2 space-y-8">
            
            {/* Applicants */}
            <div className="glass-card rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm bg-white">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg sm:text-xl font-bold font-['Space_Grotesk'] text-slate-900 flex items-center gap-2">
                  <AlertCircle className="h-5 w-5 text-amber-500" />
                  Pending Membership Applications ({pendingApplicants.length})
                </h2>
              </div>

              <div className="space-y-4">
                {pendingApplicants.map((app) => (
                  <div
                    key={app.id}
                    className="rounded-3xl p-5 border border-slate-200 bg-slate-50/50 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-white hover:border-indigo-300 transition-all shadow-xs"
                  >
                    <div>
                      <h3 className="font-bold text-slate-900 text-sm">{app.Student?.User?.name}</h3>
                      <p className="text-xs text-slate-500 mt-0.5 font-medium">
                        Card ID: {app.Student?.student_id_card} • Dept: {app.Student?.department} (Year {app.Student?.year})
                      </p>
                      <div className="mt-3 space-y-1 text-xs text-slate-600 border-t border-slate-200/80 pt-2.5 font-medium">
                        <p><span className="font-bold text-slate-800">Skills:</span> {app.skills}</p>
                        <p><span className="font-bold text-slate-800">Motivation:</span> {app.statement_of_purpose}</p>
                        <p><span className="font-bold text-slate-800">Availability:</span> {app.availability || 'Flexible'}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        onClick={() => handleApplication(app.id, 'approved')}
                        className="rounded-2xl bg-emerald-50 hover:bg-emerald-600 text-emerald-700 hover:text-white border border-emerald-200 p-2.5 transition-all cursor-pointer shadow-xs"
                        title="Approve Member"
                      >
                        <Check className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleApplication(app.id, 'rejected')}
                        className="rounded-2xl bg-rose-50 hover:bg-rose-600 text-rose-700 hover:text-white border border-rose-200 p-2.5 transition-all cursor-pointer shadow-xs"
                        title="Reject Application"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                ))}

                {pendingApplicants.length === 0 && (
                  <div className="text-center py-8 text-slate-400 text-xs font-medium">
                    No pending club applications requiring review at this time.
                  </div>
                )}
              </div>
            </div>

            {/* Club Members Table */}
            <div className="glass-card rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm bg-white">
              <h2 className="text-lg sm:text-xl font-bold font-['Space_Grotesk'] text-slate-900 mb-6">
                Active Chapter Members
              </h2>

              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-slate-200 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                      <th className="py-3 px-2">Member</th>
                      <th className="py-3 px-2">Department</th>
                      <th className="py-3 px-2">Role</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {club.ClubMembers?.map((member) => (
                      <tr key={member.id} className="text-xs sm:text-sm hover:bg-slate-50/60">
                        <td className="py-3 px-2 font-bold text-slate-900">{member.Student?.User?.name}</td>
                        <td className="py-3 px-2 text-slate-500 font-medium">{member.Student?.department}</td>
                        <td className="py-3 px-2">
                          <span className="inline-block rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200 px-3 py-0.5 text-[10px] font-bold">
                            {member.role || 'Member'}
                          </span>
                        </td>
                      </tr>
                    ))}
                    {(!club.ClubMembers || club.ClubMembers.length === 0) && (
                      <tr>
                        <td colSpan="3" className="py-6 text-center text-xs text-slate-400 font-medium">
                          No active members registered yet.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Sidebar Forms */}
          <div className="space-y-6">
            
            {/* Create Event */}
            <div className="glass-card rounded-3xl p-6 border border-slate-200 shadow-sm bg-white">
              <h3 className="font-['Space_Grotesk'] text-base font-bold text-slate-900 mb-4 flex items-center gap-2">
                <PlusCircle className="h-4.5 w-4.5 text-indigo-600" />
                Schedule New Event
              </h3>

              {eventSuccess && (
                <div className="rounded-2xl bg-emerald-50 border border-emerald-200 p-3 text-xs text-emerald-700 mb-4 flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600" />
                  <span>Event created successfully!</span>
                </div>
              )}

              <form onSubmit={handleCreateEvent} className="space-y-3.5">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Event Title</label>
                  <input
                    type="text"
                    required
                    value={newEvent.title}
                    onChange={(e) => setNewEvent(p => ({ ...p, title: e.target.value }))}
                    className="w-full rounded-2xl border border-slate-200 bg-slate-50/70 py-2 px-3 text-xs text-slate-900 focus:border-indigo-500 focus:bg-white focus:outline-none font-medium"
                    placeholder="e.g. 24h HackForge"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Venue / Platform</label>
                  <input
                    type="text"
                    required
                    value={newEvent.venue}
                    onChange={(e) => setNewEvent(p => ({ ...p, venue: e.target.value }))}
                    className="w-full rounded-2xl border border-slate-200 bg-slate-50/70 py-2 px-3 text-xs text-slate-900 focus:border-indigo-500 focus:bg-white focus:outline-none font-medium"
                    placeholder="e.g. Central Auditorium"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">Event Date</label>
                    <input
                      type="datetime-local"
                      required
                      value={newEvent.event_date}
                      onChange={(e) => setNewEvent(p => ({ ...p, event_date: e.target.value }))}
                      className="w-full rounded-2xl border border-slate-200 bg-slate-50/70 py-2 px-2 text-[11px] text-slate-900 focus:border-indigo-500 focus:bg-white focus:outline-none font-medium"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">RSVP Deadline</label>
                    <input
                      type="datetime-local"
                      required
                      value={newEvent.registration_deadline}
                      onChange={(e) => setNewEvent(p => ({ ...p, registration_deadline: e.target.value }))}
                      className="w-full rounded-2xl border border-slate-200 bg-slate-50/70 py-2 px-2 text-[11px] text-slate-900 focus:border-indigo-500 focus:bg-white focus:outline-none font-medium"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Description</label>
                  <textarea
                    required
                    rows="2"
                    value={newEvent.description}
                    onChange={(e) => setNewEvent(p => ({ ...p, description: e.target.value }))}
                    className="w-full rounded-2xl border border-slate-200 bg-slate-50/70 py-2 px-3 text-xs text-slate-900 focus:border-indigo-500 focus:bg-white focus:outline-none font-medium"
                    placeholder="Agenda, prerequisites..."
                  />
                </div>

                <button
                  type="submit"
                  className="w-full rounded-2xl bg-gradient-to-r from-indigo-600 to-violet-600 py-2.5 text-xs font-bold text-white shadow-md shadow-indigo-600/20 hover:opacity-95 transition-all cursor-pointer"
                >
                  Publish Event
                </button>
              </form>
            </div>

            {/* Post Announcement */}
            <div className="glass-card rounded-3xl p-6 border border-slate-200 shadow-sm bg-white">
              <h3 className="font-['Space_Grotesk'] text-base font-bold text-slate-900 mb-4 flex items-center gap-2">
                <Radio className="h-4.5 w-4.5 text-cyan-600" />
                Broadcast Announcement
              </h3>

              {annSuccess && (
                <div className="rounded-2xl bg-emerald-50 border border-emerald-200 p-3 text-xs text-emerald-700 mb-4 flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600" />
                  <span>Announcement published!</span>
                </div>
              )}

              <form onSubmit={handleCreateAnnouncement} className="space-y-3.5">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Title</label>
                  <input
                    type="text"
                    required
                    value={newAnnouncement.title}
                    onChange={(e) => setNewAnnouncement(p => ({ ...p, title: e.target.value }))}
                    className="w-full rounded-2xl border border-slate-200 bg-slate-50/70 py-2 px-3 text-xs text-slate-900 focus:border-cyan-500 focus:bg-white focus:outline-none font-medium"
                    placeholder="e.g. Audition Schedule Update"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Content</label>
                  <textarea
                    required
                    rows="3"
                    value={newAnnouncement.content}
                    onChange={(e) => setNewAnnouncement(p => ({ ...p, content: e.target.value }))}
                    className="w-full rounded-2xl border border-slate-200 bg-slate-50/70 py-2 px-3 text-xs text-slate-900 focus:border-cyan-500 focus:bg-white focus:outline-none font-medium"
                    placeholder="Broadcast text message to students..."
                  />
                </div>
                <button
                  type="submit"
                  className="w-full rounded-2xl bg-cyan-600 hover:bg-cyan-700 py-2.5 text-xs font-bold text-white shadow-sm transition-all cursor-pointer"
                >
                  Publish Announcement
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CoordinatorDashboard;
