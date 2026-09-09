import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import API from '../services/api';
import { motion } from 'framer-motion';
import {
  Search,
  Calendar,
  MapPin,
  Clock,
  Sparkles,
  ArrowRight,
  Flame,
  CheckCircle2,
  Tag
} from 'lucide-react';

const TABS = [
  { value: 'upcoming', label: 'Upcoming Fests' },
  { value: 'this_week', label: 'This Week' },
  { value: 'this_month', label: 'This Month' },
  { value: 'completed', label: 'Past Archives' }
];

const Events = () => {
  const [events, setEvents] = useState([]);
  const [search, setSearch] = useState('');
  const [tab, setTab] = useState('upcoming');
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({});
  const [loading, setLoading] = useState(true);

  const fetchEvents = async () => {
    setLoading(true);
    try {
      const { data } = await API.get('/events', {
        params: {
          search,
          tab,
          page,
          limit: 9
        }
      });
      setEvents(data.events || []);
      setPagination(data.pagination || {});
    } catch (err) {
      console.error('Error fetching events list:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, [tab, page]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(1);
    fetchEvents();
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-900 py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Glow */}
      <div className="absolute top-10 left-10 w-96 h-96 rounded-full bg-violet-200/40 blur-[100px] pointer-events-none" />

      <div className="mx-auto max-w-7xl relative z-10">
        
        {/* Header */}
        <div className="mb-10 text-center sm:text-left">
          <div className="inline-flex items-center gap-2 rounded-full border border-violet-200 bg-violet-50 px-3.5 py-1 text-xs font-bold text-violet-700 mb-3 shadow-xs">
            <Flame className="h-3.5 w-3.5 text-amber-500" />
            <span>Campus Activities & Hackathons</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-extrabold font-['Space_Grotesk'] tracking-tight text-slate-900">
            Campus Events & Hackathons
          </h1>
          <p className="text-slate-600 mt-2 text-sm sm:text-base max-w-2xl font-medium">
            RSVP for technical hackathons, cultural fests, sports tournaments, and interactive guest lectures.
          </p>
        </div>

        {/* Filters Bar */}
        <div className="glass-card rounded-3xl p-4 mb-10 flex flex-col md:flex-row gap-4 items-center justify-between border border-slate-200 shadow-sm bg-white">
          <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto scrollbar-none">
            {TABS.map((t) => {
              const isSelected = tab === t.value;
              return (
                <button
                  key={t.value}
                  onClick={() => { setTab(t.value); setPage(1); }}
                  className={`shrink-0 rounded-2xl px-4 py-2 text-xs font-bold transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-gradient-to-r from-violet-600 to-indigo-600 text-white shadow-md shadow-violet-600/20'
                      : 'bg-slate-50 border border-slate-200 text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                  }`}
                >
                  {t.label}
                </button>
              );
            })}
          </div>

          <form onSubmit={handleSearchSubmit} className="relative w-full md:w-80">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search event by title..."
              className="w-full rounded-2xl border border-slate-200 bg-slate-50/70 py-2.5 pl-9 pr-4 text-xs text-slate-900 placeholder-slate-400 focus:border-violet-500 focus:bg-white focus:outline-none font-medium"
            />
            <Search className="absolute left-3.5 top-3 h-3.5 w-3.5 text-slate-400" />
          </form>
        </div>

        {/* Events Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((n) => (
              <div key={n} className="h-72 rounded-3xl bg-slate-100 animate-pulse border border-slate-200" />
            ))}
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {events.map((event) => (
                <motion.div
                  key={event.id}
                  whileHover={{ y: -4 }}
                  className="glass-card glass-card-hover rounded-3xl overflow-hidden flex flex-col justify-between border border-slate-200 shadow-sm bg-white"
                >
                  <div>
                    {event.cover_image ? (
                      <div className="relative h-44 w-full overflow-hidden bg-slate-100">
                        <img
                          src={event.cover_image}
                          alt={event.title}
                          className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
                        />
                        <span className="absolute top-4 right-4 rounded-full bg-white/90 backdrop-blur-md px-3 py-1 text-[10px] font-bold text-violet-700 shadow-xs border border-slate-200">
                          {event.status || 'Active'}
                        </span>
                      </div>
                    ) : (
                      <div className="h-32 w-full bg-gradient-to-r from-violet-50 via-indigo-50 to-cyan-50 p-5 flex items-center justify-between border-b border-slate-100">
                        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white border border-slate-200 shadow-xs">
                          <Calendar className="h-6 w-6 text-violet-600" />
                        </div>
                        <span className="rounded-full bg-white px-3 py-0.5 text-[10px] font-bold text-violet-700 border border-slate-200 shadow-xs">
                          {event.status || 'Open'}
                        </span>
                      </div>
                    )}

                    <div className="p-6">
                      <span className="inline-block text-[10px] font-bold uppercase tracking-wider text-violet-700 bg-violet-50 border border-violet-200 px-3 py-0.5 rounded-full mb-3">
                        {event.Club?.name || 'Campus Wide'}
                      </span>
                      <h3 className="text-lg font-bold font-['Space_Grotesk'] text-slate-900 mb-2 line-clamp-1">
                        {event.title}
                      </h3>
                      <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed font-medium mb-4">
                        {event.description}
                      </p>
                    </div>
                  </div>

                  <div className="px-6 pb-6">
                    <div className="space-y-1.5 py-3 border-y border-slate-100 text-xs text-slate-600 mb-4 font-medium">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-3.5 w-3.5 text-violet-600" />
                        <span>{new Date(event.event_date).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <MapPin className="h-3.5 w-3.5 text-cyan-600" />
                        <span className="truncate">{event.venue || 'Campus Auditorium'}</span>
                      </div>
                    </div>

                    <Link
                      to={`/events/${event.id}`}
                      className="flex items-center justify-center gap-2 w-full rounded-2xl bg-violet-50 hover:bg-violet-600 hover:text-white text-violet-700 border border-violet-200 py-2.5 text-xs font-bold transition-all duration-200 shadow-xs"
                    >
                      <span>View Details & Register</span>
                      <ArrowRight className="h-3.5 w-3.5" />
                    </Link>
                  </div>
                </motion.div>
              ))}
            </div>

            {events.length === 0 && (
              <div className="glass-card rounded-3xl p-16 text-center max-w-md mx-auto my-12 border border-slate-200 bg-white">
                <Calendar className="h-12 w-12 text-slate-400 mx-auto mb-4" />
                <h3 className="text-lg font-bold text-slate-900">No Events Scheduled</h3>
                <p className="text-xs text-slate-500 mt-1 mb-6 font-medium">
                  There are currently no events matching this timeframe or search filter.
                </p>
                <button
                  onClick={() => { setSearch(''); setTab('upcoming'); }}
                  className="rounded-2xl bg-violet-600 hover:bg-violet-700 px-6 py-2.5 text-xs font-bold text-white transition-all cursor-pointer"
                >
                  View Upcoming Events
                </button>
              </div>
            )}

            {pagination.pages > 1 && (
              <div className="flex justify-center items-center gap-3 mt-12">
                <button
                  disabled={page === 1}
                  onClick={() => setPage(prev => prev - 1)}
                  className="rounded-2xl border border-slate-200 bg-white px-4 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 disabled:opacity-40 cursor-pointer shadow-xs"
                >
                  Previous
                </button>
                <span className="text-xs font-bold text-slate-500 px-3">
                  Page {page} of {pagination.pages}
                </span>
                <button
                  disabled={page === pagination.pages}
                  onClick={() => setPage(prev => prev + 1)}
                  className="rounded-2xl border border-slate-200 bg-white px-4 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 disabled:opacity-40 cursor-pointer shadow-xs"
                >
                  Next
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default Events;
