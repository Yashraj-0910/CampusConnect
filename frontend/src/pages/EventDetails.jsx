import React, { useContext, useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import API from '../services/api';
import { AuthContext } from '../context/AuthContext';
import {
  Calendar,
  MapPin,
  Trophy,
  AlignLeft,
  CheckCircle2,
  AlertCircle,
  Clock,
  ChevronLeft,
  Sparkles,
  Users,
  ShieldAlert
} from 'lucide-react';
import { motion } from 'framer-motion';

const EventDetails = () => {
  const { id } = useParams();
  const { user } = useContext(AuthContext);
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [registering, setRegistering] = useState(false);
  const [registeredSuccess, setRegisteredSuccess] = useState(false);
  const [error, setError] = useState('');

  const fetchEventDetails = async () => {
    try {
      const { data } = await API.get(`/events/${id}`);
      setEvent(data);
    } catch (err) {
      console.error('Error loading event:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEventDetails();
  }, [id]);

  const handleRegister = async () => {
    if (!user) return alert('Please sign in to register for events!');
    setRegistering(true);
    setError('');
    setRegisteredSuccess(false);

    try {
      await API.post(`/events/${id}/register`);
      setRegisteredSuccess(true);
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || 'Error registering for the event.');
    } finally {
      setRegistering(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[70vh] items-center justify-center bg-[#f8fafc]">
        <div className="flex flex-col items-center gap-3">
          <div className="h-10 w-10 animate-spin rounded-full border-3 border-t-violet-600 border-violet-200" />
          <span className="text-xs font-bold text-slate-500">Loading event details...</span>
        </div>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="mx-auto max-w-5xl px-4 py-24 text-center min-h-[60vh] bg-[#f8fafc]">
        <h2 className="text-3xl font-bold text-slate-900">Event Not Found</h2>
        <p className="text-slate-500 text-sm mt-2 font-medium">This event may have been concluded or cancelled.</p>
        <Link to="/events" className="mt-6 inline-flex items-center gap-2 rounded-2xl bg-violet-600 px-6 py-3 text-xs font-bold text-white shadow-sm">
          <ChevronLeft className="h-4 w-4" /> Back to Events Hub
        </Link>
      </div>
    );
  }

  const isDeadlinePassed = event.registration_deadline ? new Date() > new Date(event.registration_deadline) : false;

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-900 py-10 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Glow */}
      <div className="absolute top-10 right-10 w-96 h-96 rounded-full bg-violet-200/40 blur-[100px] pointer-events-none" />

      <div className="mx-auto max-w-5xl relative z-10 space-y-8">
        
        {/* Navigation Breadcrumb */}
        <Link
          to="/events"
          className="inline-flex items-center gap-2 text-xs font-bold text-slate-500 hover:text-indigo-600 transition-colors"
        >
          <ChevronLeft className="h-4 w-4" /> Back to All Events
        </Link>

        {/* Hero Card */}
        <div className="glass-card rounded-3xl overflow-hidden border border-slate-200 shadow-sm relative bg-white">
          {event.cover_image && (
            <div className="relative h-72 sm:h-96 w-full overflow-hidden bg-slate-100">
              <img src={event.cover_image} alt={event.title} className="w-full h-full object-cover" />
            </div>
          )}

          <div className="p-8 sm:p-10">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 mb-8">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-violet-700 bg-violet-50 border border-violet-200 px-3 py-1 rounded-full">
                  {event.Club?.name || 'Campus Wide'}
                </span>
                <h1 className="text-2xl sm:text-4xl font-extrabold font-['Space_Grotesk'] tracking-tight text-slate-900 mt-3">
                  {event.title}
                </h1>
              </div>

              <div>
                {registeredSuccess ? (
                  <span className="inline-flex items-center gap-2 rounded-2xl border border-emerald-200 bg-emerald-50 px-6 py-3.5 text-xs font-bold text-emerald-700 shadow-sm">
                    <CheckCircle2 className="h-4.5 w-4.5 text-emerald-600" /> Confirmed Registered
                  </span>
                ) : isDeadlinePassed ? (
                  <span className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-slate-100 px-6 py-3 text-xs font-bold text-slate-500">
                    Registration Closed
                  </span>
                ) : (
                  <button
                    onClick={handleRegister}
                    disabled={registering}
                    className="rounded-2xl bg-gradient-to-r from-violet-600 to-indigo-600 px-8 py-4 text-xs sm:text-sm font-bold text-white shadow-lg shadow-violet-600/20 hover:opacity-95 transition-all cursor-pointer disabled:opacity-50 flex items-center gap-2"
                  >
                    <Sparkles className="h-4 w-4 text-cyan-200" />
                    <span>{registering ? 'Securing Spot...' : 'Register for Event'}</span>
                  </button>
                )}
              </div>
            </div>

            {error && (
              <div className="mb-6 flex items-center gap-3 rounded-2xl bg-rose-50 border border-rose-200 p-4 text-xs text-rose-700 font-medium">
                <AlertCircle className="h-4.5 w-4.5 shrink-0 text-rose-600" />
                <span>{error}</span>
              </div>
            )}

            {/* Quick Metrics */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-6 border-t border-slate-100">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-2xl bg-violet-50 border border-violet-100 text-violet-600 shadow-xs">
                  <Calendar className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Date & Schedule</p>
                  <p className="text-xs font-bold text-slate-900 mt-0.5">
                    {new Date(event.event_date).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' })}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="p-3 rounded-2xl bg-cyan-50 border border-cyan-100 text-cyan-600 shadow-xs">
                  <MapPin className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Venue</p>
                  <p className="text-xs font-bold text-slate-900 mt-0.5">{event.venue || 'Campus Auditorium'}</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="p-3 rounded-2xl bg-amber-50 border border-amber-100 text-amber-600 shadow-xs">
                  <Trophy className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Prize Pool / Perks</p>
                  <p className="text-xs font-bold text-slate-900 mt-0.5">{event.prizes || 'Certificates & Swag'}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Details & Sidebar */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            {/* Description */}
            <div className="glass-card rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm bg-white">
              <h2 className="text-xl font-bold font-['Space_Grotesk'] text-slate-900 mb-3 flex items-center gap-2">
                <AlignLeft className="h-5 w-5 text-violet-600" />
                Event Overview
              </h2>
              <p className="text-sm text-slate-600 leading-relaxed whitespace-pre-line font-medium">
                {event.description}
              </p>
            </div>

            {/* Rules */}
            {event.rules && (
              <div className="glass-card rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm bg-white">
                <h2 className="text-xl font-bold font-['Space_Grotesk'] text-slate-900 mb-3 flex items-center gap-2">
                  <ShieldAlert className="h-5 w-5 text-amber-500" />
                  Guidelines & Rules
                </h2>
                <p className="text-sm text-slate-600 leading-relaxed whitespace-pre-line font-medium">
                  {event.rules}
                </p>
              </div>
            )}
          </div>

          <div className="space-y-6">
            {/* Organizers */}
            <div className="glass-card rounded-3xl p-6 border border-slate-200 shadow-sm bg-white">
              <h3 className="font-['Space_Grotesk'] text-base font-bold text-slate-900 mb-2">
                Organized By
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed font-medium">
                {event.organizers || event.Club?.name || 'Campus Connect Committee'}
              </p>
            </div>

            {/* Deadline */}
            <div className="rounded-3xl p-6 border border-rose-200 bg-rose-50/70 shadow-xs">
              <h3 className="font-['Space_Grotesk'] text-base font-bold text-slate-900 mb-2 flex items-center gap-2">
                <Clock className="h-4 w-4 text-rose-600" />
                Registration Deadline
              </h3>
              <p className="text-xs font-bold text-rose-700">
                {event.registration_deadline
                  ? new Date(event.registration_deadline).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' })
                  : 'Open until seats fill up'}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EventDetails;
