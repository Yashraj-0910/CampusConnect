import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import API from '../services/api';
import { motion } from 'framer-motion';
import {
  Search,
  SlidersHorizontal,
  Users,
  Compass,
  Sparkles,
  ArrowRight,
  Filter,
  CheckCircle2,
  XCircle,
  Tag
} from 'lucide-react';

const CATEGORIES = [
  { value: '', label: 'All Categories' },
  { value: 'technical', label: 'Technical & Coding' },
  { value: 'cultural', label: 'Cultural & Arts' },
  { value: 'sports', label: 'Sports & Fitness' },
  { value: 'literary', label: 'Literary & Debating' },
  { value: 'social', label: 'Social & Impact' },
  { value: 'entrepreneurship', label: 'Entrepreneurship' },
];

const ExploreClubs = () => {
  const [clubs, setClubs] = useState([]);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [status, setStatus] = useState('');
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({});
  const [loading, setLoading] = useState(true);

  const fetchClubs = async () => {
    setLoading(true);
    try {
      const { data } = await API.get('/clubs', {
        params: {
          search,
          category,
          registration_status: status,
          page,
          limit: 9
        }
      });
      setClubs(data.clubs || []);
      setPagination(data.pagination || {});
    } catch (err) {
      console.error('Error fetching clubs list:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClubs();
  }, [category, status, page]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(1);
    fetchClubs();
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-900 py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Background glow */}
      <div className="absolute top-10 right-10 w-96 h-96 rounded-full bg-indigo-200/40 blur-[100px] pointer-events-none" />

      <div className="mx-auto max-w-7xl relative z-10">
        
        {/* Page Header */}
        <div className="mb-10 text-center sm:text-left">
          <div className="inline-flex items-center gap-2 rounded-full border border-indigo-200 bg-indigo-50 px-3.5 py-1 text-xs font-bold text-indigo-700 mb-3 shadow-xs">
            <Compass className="h-3.5 w-3.5 text-indigo-600" />
            <span>Campus Communities</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-extrabold font-['Space_Grotesk'] tracking-tight text-slate-900">
            Explore Campus Clubs
          </h1>
          <p className="text-slate-600 mt-2 text-sm sm:text-base max-w-2xl font-medium">
            Find your tribe, collaborate on exciting projects, organize campus fests, and build lifelong connections.
          </p>
        </div>

        {/* Category Pills Quick Filter */}
        <div className="flex items-center gap-2 overflow-x-auto pb-4 mb-6 scrollbar-none">
          {CATEGORIES.map((cat) => {
            const isSelected = category === cat.value;
            return (
              <button
                key={cat.value}
                onClick={() => {
                  setCategory(cat.value);
                  setPage(1);
                }}
                className={`shrink-0 rounded-full px-4 py-2 text-xs font-bold transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow-md shadow-indigo-600/20'
                    : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 hover:text-slate-900 shadow-xs'
                }`}
              >
                {cat.label}
              </button>
            );
          })}
        </div>

        {/* Search & Filter Bar */}
        <div className="glass-card rounded-3xl p-4 mb-10 flex flex-col md:flex-row gap-4 items-center justify-between border border-slate-200 shadow-sm bg-white">
          <form onSubmit={handleSearchSubmit} className="relative w-full md:w-96">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by club name or keyword..."
              className="w-full rounded-2xl border border-slate-200 bg-slate-50/70 py-2.5 pl-10 pr-4 text-xs sm:text-sm text-slate-900 placeholder-slate-400 focus:border-indigo-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-100 font-medium"
            />
            <Search className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
          </form>

          <div className="flex items-center gap-3 w-full md:w-auto">
            <div className="relative w-full md:w-auto">
              <select
                value={status}
                onChange={(e) => { setStatus(e.target.value); setPage(1); }}
                className="w-full rounded-2xl border border-slate-200 bg-slate-50/70 py-2.5 px-4 text-xs font-bold text-slate-700 focus:border-indigo-500 focus:bg-white focus:outline-none cursor-pointer"
              >
                <option value="">All Registration Statuses</option>
                <option value="open">🟢 Recruiting Now</option>
                <option value="closed">🔒 Registrations Closed</option>
              </select>
            </div>
          </div>
        </div>

        {/* Clubs Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((n) => (
              <div key={n} className="h-72 rounded-3xl bg-slate-100 animate-pulse border border-slate-200" />
            ))}
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {clubs.map((club) => {
                const isOpen = club.registration_status === 'open';
                return (
                  <motion.div
                    key={club.id}
                    whileHover={{ y: -4 }}
                    className="glass-card glass-card-hover rounded-3xl overflow-hidden flex flex-col justify-between border border-slate-200 shadow-sm bg-white"
                  >
                    <div>
                      {club.banner_url ? (
                        <div className="relative h-40 w-full overflow-hidden bg-slate-100">
                          <img
                            src={club.banner_url}
                            alt={club.name}
                            className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
                          />
                        </div>
                      ) : (
                        <div className="h-32 w-full bg-gradient-to-r from-indigo-50 via-violet-50 to-cyan-50 p-5 flex items-center justify-between border-b border-slate-100">
                          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white border border-slate-200/80 shadow-xs">
                            <Compass className="h-6 w-6 text-indigo-600" />
                          </div>
                        </div>
                      )}

                      <div className="p-6">
                        <div className="flex items-center justify-between gap-2 mb-3">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-700 bg-indigo-50 border border-indigo-200 px-2.5 py-0.5 rounded-full">
                            {club.category || 'Club'}
                          </span>
                          <span className={`text-[10px] font-bold border rounded-full px-2.5 py-0.5 flex items-center gap-1.5 ${
                            isOpen
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                              : 'bg-slate-100 text-slate-500 border-slate-200'
                          }`}>
                            <span className={`h-1.5 w-1.5 rounded-full ${isOpen ? 'bg-emerald-500 animate-pulse' : 'bg-slate-400'}`} />
                            {isOpen ? 'Recruiting' : 'Closed'}
                          </span>
                        </div>

                        <h3 className="text-xl font-bold font-['Space_Grotesk'] text-slate-900 mb-2 line-clamp-1">
                          {club.name}
                        </h3>
                        <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed font-medium mb-4">
                          {club.description || 'Dedicated to advancing student skills and campus engagement.'}
                        </p>
                      </div>
                    </div>

                    <div className="px-6 pb-6 pt-3 border-t border-slate-100 flex items-center justify-between">
                      <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-500">
                        <Users className="h-3.5 w-3.5 text-indigo-600" />
                        <span>All Batches</span>
                      </div>
                      <Link
                        to={`/clubs/${club.id}`}
                        className="inline-flex items-center gap-1.5 rounded-2xl bg-indigo-50 hover:bg-indigo-600 hover:text-white text-indigo-700 border border-indigo-200 px-4 py-2 text-xs font-bold transition-all duration-200"
                      >
                        <span>View Club</span>
                        <ArrowRight className="h-3.5 w-3.5" />
                      </Link>
                    </div>
                  </motion.div>
                );
              })}
            </div>

            {/* Empty State */}
            {clubs.length === 0 && (
              <div className="glass-card rounded-3xl p-16 text-center max-w-md mx-auto my-12 border border-slate-200 bg-white">
                <Compass className="h-12 w-12 text-slate-400 mx-auto mb-4" />
                <h3 className="text-lg font-bold text-slate-900">No Clubs Found</h3>
                <p className="text-xs text-slate-500 mt-1 mb-6 font-medium">
                  Try searching with different keywords or clearing selected filters.
                </p>
                <button
                  onClick={() => { setSearch(''); setCategory(''); setStatus(''); }}
                  className="rounded-2xl bg-indigo-600 hover:bg-indigo-700 px-6 py-2.5 text-xs font-bold text-white transition-all cursor-pointer"
                >
                  Reset Filters
                </button>
              </div>
            )}

            {/* Pagination Controls */}
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

export default ExploreClubs;
