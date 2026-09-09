import React, { useContext, useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import API from '../services/api';
import { AuthContext } from '../context/AuthContext';
import {
  Calendar,
  Users,
  Award,
  HelpCircle,
  CheckCircle2,
  Clock,
  PlusCircle,
  Compass,
  ArrowRight,
  ShieldCheck,
  Sparkles,
  AlertCircle,
  X
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const ClubDetails = () => {
  const { id } = useParams();
  const { user } = useContext(AuthContext);
  const [club, setClub] = useState(null);
  const [loading, setLoading] = useState(true);

  // Application Modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    skills: '',
    experience: '',
    statement_of_purpose: '',
    availability: ''
  });
  const [submitError, setSubmitError] = useState('');
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const fetchClubDetails = async () => {
    try {
      const { data } = await API.get(`/clubs/${id}`);
      setClub(data);
    } catch (err) {
      console.error('Error fetching club details:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClubDetails();
  }, [id]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleApplySubmit = async (e) => {
    e.preventDefault();
    setSubmitError('');
    setSubmitSuccess(false);
    setSubmitting(true);

    try {
      await API.post(`/clubs/${id}/register`, formData);
      setSubmitSuccess(true);
      setFormData({ skills: '', experience: '', statement_of_purpose: '', availability: '' });
      setTimeout(() => {
        setModalOpen(false);
        setSubmitSuccess(false);
      }, 2500);
    } catch (err) {
      console.error(err);
      setSubmitError(err.response?.data?.message || 'Error occurred while submitting application.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[70vh] items-center justify-center bg-[#f8fafc]">
        <div className="flex flex-col items-center gap-3">
          <div className="h-10 w-10 animate-spin rounded-full border-3 border-t-indigo-600 border-indigo-200" />
          <span className="text-xs font-bold text-slate-500">Loading club profile...</span>
        </div>
      </div>
    );
  }

  if (!club) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-24 text-center min-h-[60vh] bg-[#f8fafc]">
        <h2 className="text-3xl font-bold text-slate-900">Club Not Found</h2>
        <p className="text-slate-500 text-sm mt-2 font-medium">The club you are looking for does not exist or has been archived.</p>
        <Link to="/explore" className="mt-6 inline-flex items-center gap-2 rounded-2xl bg-indigo-600 px-6 py-3 text-xs font-bold text-white shadow-sm">
          <Compass className="h-4 w-4" /> Back to Explore Clubs
        </Link>
      </div>
    );
  }

  const isOpen = club.registration_status === 'open';

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-900 py-10 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Background glow */}
      <div className="absolute top-10 right-10 w-96 h-96 rounded-full bg-indigo-200/40 blur-[100px] pointer-events-none" />

      <div className="mx-auto max-w-7xl relative z-10 space-y-10">
        
        {/* Banner Card */}
        <div className="glass-card rounded-3xl overflow-hidden border border-slate-200 shadow-sm relative bg-white">
          {club.banner_url && (
            <div className="relative h-64 sm:h-80 w-full overflow-hidden bg-slate-100">
              <img src={club.banner_url} alt={club.name} className="w-full h-full object-cover" />
            </div>
          )}

          <div className="p-8 sm:p-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative z-10">
            <div className="flex items-center gap-5">
              {club.logo_url ? (
                <img src={club.logo_url} alt={club.name} className="h-20 w-20 sm:h-24 sm:w-24 rounded-3xl object-cover bg-white border border-slate-200 shadow-md" />
              ) : (
                <div className="flex h-20 w-20 sm:h-24 sm:w-24 items-center justify-center rounded-3xl bg-gradient-to-tr from-indigo-600 to-violet-600 p-[1.5px] shadow-md">
                  <div className="flex h-full w-full items-center justify-center rounded-[22px] bg-white">
                    <Compass className="h-10 w-10 text-indigo-600" />
                  </div>
                </div>
              )}

              <div>
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-700 bg-indigo-50 border border-indigo-200 px-3 py-0.5 rounded-full">
                    {club.category || 'Student Club'}
                  </span>
                  <span className={`text-[10px] font-bold border rounded-full px-3 py-0.5 flex items-center gap-1.5 ${
                    isOpen
                      ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                      : 'bg-slate-100 text-slate-500 border-slate-200'
                  }`}>
                    <span className={`h-1.5 w-1.5 rounded-full ${isOpen ? 'bg-emerald-500 animate-pulse' : 'bg-slate-400'}`} />
                    {isOpen ? 'Recruitments Open' : 'Closed'}
                  </span>
                </div>

                <h1 className="text-2xl sm:text-4xl font-extrabold font-['Space_Grotesk'] tracking-tight text-slate-900">
                  {club.name}
                </h1>
                <p className="text-xs text-slate-500 font-medium mt-1">
                  Registration Deadline: {club.registration_end ? new Date(club.registration_end).toLocaleDateString() : 'Rolling Application'}
                </p>
              </div>
            </div>

            <div>
              {isOpen ? (
                <button
                  onClick={() => {
                    if (!user) return alert('Please sign in to apply to this club!');
                    setModalOpen(true);
                  }}
                  className="rounded-2xl bg-gradient-to-r from-indigo-600 to-violet-600 px-8 py-4 text-sm font-bold text-white shadow-lg shadow-indigo-600/20 hover:opacity-95 transition-all cursor-pointer flex items-center gap-2"
                >
                  <Sparkles className="h-4 w-4 text-cyan-200" />
                  <span>Apply for Membership</span>
                </button>
              ) : (
                <span className="rounded-2xl bg-slate-100 border border-slate-200 px-6 py-3 text-xs font-bold text-slate-500">
                  Applications Closed
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Content Details Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Main Info */}
          <div className="lg:col-span-2 space-y-8">
            {/* About */}
            <div className="glass-card rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm bg-white">
              <h2 className="text-xl font-bold font-['Space_Grotesk'] text-slate-900 mb-3">
                About the Club
              </h2>
              <p className="text-sm text-slate-600 leading-relaxed font-medium">
                {club.about || club.description}
              </p>
            </div>

            {/* Activities */}
            <div className="glass-card rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm bg-white">
              <h2 className="text-xl font-bold font-['Space_Grotesk'] text-slate-900 mb-3">
                What We Do & Projects
              </h2>
              <p className="text-sm text-slate-600 leading-relaxed whitespace-pre-line font-medium">
                {club.activities || 'Host weekly workshops, develop open-source student projects, and organize campus hackathons.'}
              </p>
            </div>

            {/* Eligibility & Experience Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="glass-card rounded-3xl p-6 border border-slate-200 shadow-sm bg-white">
                <div className="flex items-center gap-2 mb-2 text-indigo-600">
                  <Users className="h-5 w-5" />
                  <h3 className="font-bold text-sm text-slate-900">Eligibility</h3>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed font-medium">
                  {club.eligibility || 'Open to all academic years and departments.'}
                </p>
              </div>

              <div className="glass-card rounded-3xl p-6 border border-slate-200 shadow-sm bg-white">
                <div className="flex items-center gap-2 mb-2 text-cyan-600">
                  <Award className="h-5 w-5" />
                  <h3 className="font-bold text-sm text-slate-900">Experience Level</h3>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed font-medium">
                  {club.beginners_allowed
                    ? 'No prior experience required! Beginners are welcome to join foundational tracks.'
                    : 'Basic technical or audition baseline required for core team recruitment.'}
                </p>
              </div>
            </div>

            {/* Workflow */}
            <div className="glass-card rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm bg-white">
              <h2 className="text-xl font-bold font-['Space_Grotesk'] text-slate-900 mb-6">
                Recruitment Journey
              </h2>
              <div className="relative border-l-2 border-indigo-200 ml-4 pl-6 space-y-6">
                <div className="relative">
                  <span className="absolute -left-[31px] top-1 flex h-4 w-4 items-center justify-center rounded-full bg-indigo-600 ring-4 ring-white" />
                  <h4 className="font-bold text-sm text-slate-900">1. Submit Application</h4>
                  <p className="text-xs text-slate-500 mt-0.5 font-medium">Share your interests, prior work, and availability.</p>
                </div>
                <div className="relative">
                  <span className="absolute -left-[31px] top-1 flex h-4 w-4 items-center justify-center rounded-full bg-violet-600 ring-4 ring-white" />
                  <h4 className="font-bold text-sm text-slate-900">2. Shortlisting & Interaction</h4>
                  <p className="text-xs text-slate-500 mt-0.5 font-medium">Attend a quick interactive session with club leads.</p>
                </div>
                <div className="relative">
                  <span className="absolute -left-[31px] top-1 flex h-4 w-4 items-center justify-center rounded-full bg-cyan-600 ring-4 ring-white" />
                  <h4 className="font-bold text-sm text-slate-900">3. Welcome to the Community</h4>
                  <p className="text-xs text-slate-500 mt-0.5 font-medium">Access club channels, workshops, and project repositories.</p>
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Leadership */}
            <div className="glass-card rounded-3xl p-6 border border-slate-200 shadow-sm bg-white">
              <h3 className="font-['Space_Grotesk'] text-lg font-bold text-slate-900 mb-4">
                Club Coordinators
              </h3>
              <div className="space-y-4">
                {club.ClubCoordinators?.map((coord) => (
                  <div key={coord.id} className="flex items-center gap-3">
                    <div className="h-9 w-9 rounded-2xl bg-gradient-to-tr from-indigo-600 to-violet-600 flex items-center justify-center text-white text-xs font-bold uppercase shadow-xs">
                      {coord.User?.name?.[0] || 'C'}
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-slate-900">{coord.User?.name}</h4>
                      <p className="text-[11px] text-slate-500 font-medium">{coord.role_title} • {coord.User?.email}</p>
                    </div>
                  </div>
                ))}
                {(!club.ClubCoordinators || club.ClubCoordinators.length === 0) && (
                  <p className="text-xs text-slate-400 font-medium">Coordinator details updated regularly.</p>
                )}
              </div>
            </div>

            {/* Upcoming Events */}
            <div className="glass-card rounded-3xl p-6 border border-slate-200 shadow-sm bg-white">
              <h3 className="font-['Space_Grotesk'] text-lg font-bold text-slate-900 mb-4">
                Upcoming Club Events
              </h3>
              <div className="space-y-3">
                {club.Events?.map((event) => (
                  <Link
                    to={`/events/${event.id}`}
                    key={event.id}
                    className="block group border border-slate-200 rounded-2xl p-3.5 hover:border-indigo-300 hover:bg-slate-50 transition-all"
                  >
                    <h4 className="text-xs font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">
                      {event.title}
                    </h4>
                    <p className="text-[11px] text-slate-500 mt-1 flex items-center gap-1 font-medium">
                      <Clock className="h-3 w-3 text-indigo-600" />
                      {new Date(event.event_date).toLocaleDateString()}
                    </p>
                  </Link>
                ))}
                {(!club.Events || club.Events.length === 0) && (
                  <p className="text-xs text-slate-400 font-medium">No events currently scheduled for this club.</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Application Modal */}
      <AnimatePresence>
        {modalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-lg rounded-3xl bg-white border border-slate-200 p-8 shadow-2xl relative"
            >
              <button
                onClick={() => setModalOpen(false)}
                className="absolute top-6 right-6 text-slate-400 hover:text-slate-600"
              >
                <X className="h-5 w-5" />
              </button>

              <h3 className="font-['Space_Grotesk'] text-xl font-bold text-slate-900 mb-1">
                Apply for {club.name}
              </h3>
              <p className="text-xs text-slate-500 mb-6 font-medium">
                Tell the coordinators about your background, skills, and weekly availability.
              </p>

              {submitError && (
                <div className="rounded-2xl bg-rose-50 border border-rose-200 p-3.5 text-xs text-rose-700 mb-4 flex items-center gap-2">
                  <AlertCircle className="h-4 w-4 shrink-0 text-rose-600" />
                  <span>{submitError}</span>
                </div>
              )}

              {submitSuccess && (
                <div className="rounded-2xl bg-emerald-50 border border-emerald-200 p-3.5 text-xs text-emerald-700 mb-4 flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600" />
                  <span>Application submitted successfully! Redirecting...</span>
                </div>
              )}

              <form onSubmit={handleApplySubmit} className="space-y-4">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Skills & Proficiencies</label>
                  <input
                    type="text"
                    required
                    name="skills"
                    value={formData.skills}
                    onChange={handleInputChange}
                    className="w-full rounded-2xl border border-slate-200 bg-slate-50/70 py-2.5 px-3.5 text-xs text-slate-900 placeholder-slate-400 focus:border-indigo-500 focus:bg-white focus:outline-none"
                    placeholder="React, Graphic Design, Video Editing, Event Management..."
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Prior Experience (Optional)</label>
                  <textarea
                    name="experience"
                    rows="2"
                    value={formData.experience}
                    onChange={handleInputChange}
                    className="w-full rounded-2xl border border-slate-200 bg-slate-50/70 py-2 px-3.5 text-xs text-slate-900 placeholder-slate-400 focus:border-indigo-500 focus:bg-white focus:outline-none"
                    placeholder="Briefly describe any related projects or school clubs..."
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Why do you want to join this club?</label>
                  <textarea
                    required
                    name="statement_of_purpose"
                    rows="3"
                    value={formData.statement_of_purpose}
                    onChange={handleInputChange}
                    className="w-full rounded-2xl border border-slate-200 bg-slate-50/70 py-2 px-3.5 text-xs text-slate-900 placeholder-slate-400 focus:border-indigo-500 focus:bg-white focus:outline-none"
                    placeholder="What goals do you hope to accomplish?"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Weekly Availability</label>
                  <input
                    type="text"
                    required
                    name="availability"
                    value={formData.availability}
                    onChange={handleInputChange}
                    className="w-full rounded-2xl border border-slate-200 bg-slate-50/70 py-2.5 px-3.5 text-xs text-slate-900 placeholder-slate-400 focus:border-indigo-500 focus:bg-white focus:outline-none"
                    placeholder="3-5 hours/week, weekends..."
                  />
                </div>

                <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setModalOpen(false)}
                    className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting || submitSuccess}
                    className="rounded-2xl bg-indigo-600 hover:bg-indigo-700 px-6 py-2 text-xs font-bold text-white shadow-sm transition-all cursor-pointer disabled:opacity-50"
                  >
                    {submitting ? 'Submitting...' : 'Submit Application'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ClubDetails;
