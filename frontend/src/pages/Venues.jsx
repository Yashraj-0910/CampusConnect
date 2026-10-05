import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Building2,
  Users,
  MapPin,
  Calendar,
  Clock,
  CheckCircle,
  AlertCircle,
  X,
  Search,
  Plus,
  Loader2,
  Check
} from 'lucide-react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

export default function Venues() {
  const { user } = useAuth();
  const [venues, setVenues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedType, setSelectedType] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Booking Modal State
  const [isBookingOpen, setIsBookingOpen] = useState(false);
  const [selectedVenue, setSelectedVenue] = useState(null);
  const [bookingDate, setBookingDate] = useState(
    new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  );
  const [startTime, setStartTime] = useState('10:00');
  const [endTime, setEndTime] = useState('13:00');
  const [purpose, setPurpose] = useState('');
  const [attendees, setAttendees] = useState(50);
  const [submitting, setSubmitting] = useState(false);
  const [bookingMessage, setBookingMessage] = useState(null);

  // My bookings
  const [myBookings, setMyBookings] = useState([]);
  const [showMyBookings, setShowMyBookings] = useState(false);

  useEffect(() => {
    fetchVenues();
    if (user) {
      fetchMyBookings();
    }
  }, [user]);

  const fetchVenues = async () => {
    setLoading(true);
    try {
      const res = await api.get('/venues');
      if (res.data.success) {
        setVenues(res.data.venues || []);
      }
    } catch (err) {
      console.error('Failed to fetch venues:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchMyBookings = async () => {
    try {
      const res = await api.get('/venues/my/bookings');
      if (res.data.success) {
        setMyBookings(res.data.bookings || []);
      }
    } catch (err) {
      console.error('Failed to load my bookings:', err);
    }
  };

  const handleOpenBooking = (venue) => {
    setSelectedVenue(venue);
    setBookingMessage(null);
    setIsBookingOpen(true);
  };

  const handleBookingSubmit = async (e) => {
    e.preventDefault();
    if (!selectedVenue) return;

    setSubmitting(true);
    setBookingMessage(null);

    try {
      const res = await api.post('/venues/book', {
        venue_id: selectedVenue.id,
        booking_date: bookingDate,
        start_time: startTime,
        end_time: endTime,
        purpose,
        expected_attendees: parseInt(attendees, 10)
      });

      if (res.data.success) {
        setBookingMessage({ type: 'success', text: res.data.message });
        setPurpose('');
        fetchMyBookings();
        setTimeout(() => {
          setIsBookingOpen(false);
          setBookingMessage(null);
        }, 2000);
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Booking request failed. Please check for time slot clashes.';
      setBookingMessage({ type: 'error', text: msg });
    } finally {
      setSubmitting(false);
    }
  };

  const filteredVenues = venues.filter((v) => {
    const matchesType = selectedType === 'all' || v.type === selectedType;
    const matchesSearch =
      v.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      v.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
      v.code.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesType && matchesSearch;
  });

  const venueTypes = ['all', 'Auditorium', 'Seminar Hall', 'Computer Lab', 'Open Amphitheatre', 'Conference Room', 'Sports Ground'];

  return (
    <div className="min-h-screen pt-20 pb-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      {/* Header Banner */}
      <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight flex items-center space-x-3">
            <span className="p-2.5 rounded-2xl bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
              <Building2 className="w-7 h-7" />
            </span>
            <span>Campus Venues & Infrastructure</span>
          </h1>
          <p className="text-sm text-slate-400 mt-1.5">
            Browse campus auditoriums, seminar halls, and smart labs. Check live availability and reserve slots.
          </p>
        </div>

        {user && (
          <button
            onClick={() => setShowMyBookings(!showMyBookings)}
            className="flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-700 hover:border-indigo-500 text-slate-200 font-semibold text-sm transition self-start"
          >
            <Calendar className="w-4 h-4 text-indigo-400" />
            <span>My Reservations ({myBookings.length})</span>
          </button>
        )}
      </div>

      {/* My Bookings Accordion Drawer */}
      <AnimatePresence>
        {showMyBookings && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mb-8 p-6 rounded-2xl bg-slate-900/90 border border-slate-700 shadow-xl overflow-hidden"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-white flex items-center space-x-2">
                <Calendar className="w-5 h-5 text-indigo-400" />
                <span>My Venue Booking Requests</span>
              </h3>
              <button
                onClick={() => setShowMyBookings(false)}
                className="text-xs text-slate-400 hover:text-white"
              >
                Close
              </button>
            </div>

            {myBookings.length === 0 ? (
              <p className="text-xs text-slate-400">You have no active venue reservations.</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {myBookings.map((b) => (
                  <div key={b.id} className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-xs">
                    <div className="flex items-center justify-between">
                      <h4 className="font-bold text-white text-sm">{b.Venue?.name}</h4>
                      <span
                        className={`px-2 py-0.5 rounded-full font-semibold uppercase tracking-wider text-[10px] ${
                          b.status === 'approved'
                            ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                            : b.status === 'rejected'
                            ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                            : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                        }`}
                      >
                        {b.status}
                      </span>
                    </div>
                    <p className="text-slate-400 mt-1 font-medium">{b.purpose}</p>
                    <div className="mt-3 pt-3 border-t border-slate-800/80 flex items-center justify-between text-slate-400">
                      <span>Date: <strong className="text-slate-200">{b.booking_date}</strong></span>
                      <span>Time: <strong className="text-indigo-300">{b.start_time} - {b.end_time}</strong></span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Filters & Search */}
      <div className="mb-8 flex flex-col md:flex-row gap-4 justify-between items-center">
        {/* Search */}
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search auditorium, lab, or code..."
            className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition"
          />
        </div>

        {/* Type Pill Selector */}
        <div className="flex flex-wrap gap-2 w-full md:w-auto">
          {venueTypes.map((type) => (
            <button
              key={type}
              onClick={() => setSelectedType(type)}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold capitalize transition ${
                selectedType === type
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                  : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              {type === 'all' ? 'All Venues' : type}
            </button>
          ))}
        </div>
      </div>

      {/* Venues Grid */}
      {loading ? (
        <div className="py-20 text-center text-slate-500">
          <Loader2 className="w-8 h-8 animate-spin text-indigo-500 mx-auto mb-3" />
          <p className="text-sm">Loading campus facilities...</p>
        </div>
      ) : filteredVenues.length === 0 ? (
        <div className="py-20 text-center text-slate-500">
          <Building2 className="w-12 h-12 mx-auto mb-3 text-slate-600" />
          <p className="text-base font-semibold text-slate-400">No venues found</p>
          <p className="text-xs text-slate-600 mt-1">Try changing your search keywords or filter category.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredVenues.map((venue) => (
            <motion.div
              key={venue.id}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-2xl bg-slate-900/90 border border-slate-800 overflow-hidden shadow-xl flex flex-col hover:border-slate-700 transition group"
            >
              {/* Image Banner */}
              <div className="relative h-48 w-full overflow-hidden bg-slate-950">
                <img
                  src={venue.image_url || 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&w=1200&q=80'}
                  alt={venue.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-transparent" />
                <span className="absolute top-3 right-3 px-3 py-1 rounded-full bg-slate-950/80 backdrop-blur-md border border-slate-700/80 text-indigo-300 text-[11px] font-bold">
                  {venue.code}
                </span>
                <span className="absolute bottom-3 left-3 px-2.5 py-0.5 rounded-md bg-indigo-600/90 text-white text-[11px] font-semibold">
                  {venue.type}
                </span>
              </div>

              {/* Content Body */}
              <div className="p-5 flex-1 flex flex-col justify-between">
                <div>
                  <h3 className="text-lg font-bold text-white group-hover:text-indigo-400 transition leading-snug">
                    {venue.name}
                  </h3>
                  <div className="flex items-center space-x-1.5 text-xs text-slate-400 mt-2">
                    <MapPin className="w-3.5 h-3.5 text-indigo-400 flex-shrink-0" />
                    <span className="truncate">{venue.location}</span>
                  </div>

                  {/* Capacity & Specs */}
                  <div className="flex items-center space-x-4 mt-4 text-xs text-slate-300 bg-slate-950/60 p-2.5 rounded-xl border border-slate-800/80">
                    <div className="flex items-center space-x-1.5">
                      <Users className="w-4 h-4 text-indigo-400" />
                      <span>Capacity: <strong className="text-white">{venue.capacity} seats</strong></span>
                    </div>
                  </div>

                  {/* Amenities Tags */}
                  <div className="mt-4">
                    <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-2">Equipped with:</p>
                    <div className="flex flex-wrap gap-1.5">
                      {(Array.isArray(venue.amenities) ? venue.amenities : []).slice(0, 4).map((amenity, idx) => (
                        <span
                          key={idx}
                          className="px-2 py-0.5 rounded-md bg-slate-800/80 text-slate-300 text-[10px] font-medium border border-slate-700/50"
                        >
                          {amenity}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Booking Button */}
                <div className="mt-6 pt-4 border-t border-slate-800">
                  <button
                    onClick={() => handleOpenBooking(venue)}
                    className="w-full flex items-center justify-center space-x-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition shadow-lg shadow-indigo-600/30"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Reserve Slot for Event</span>
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Venue Booking Modal */}
      <AnimatePresence>
        {isBookingOpen && selectedVenue && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="relative w-full max-w-lg bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl p-6 text-white"
            >
              {/* Close */}
              <button
                onClick={() => setIsBookingOpen(false)}
                className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-400 hover:text-white bg-slate-800/80 hover:bg-slate-700 transition"
              >
                <X className="w-5 h-5" />
              </button>

              {/* Title */}
              <div className="flex items-center space-x-3 mb-4">
                <div className="p-2.5 rounded-xl bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
                  <Building2 className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white leading-tight">Request Venue Booking</h3>
                  <p className="text-xs text-slate-400">{selectedVenue.name} ({selectedVenue.code})</p>
                </div>
              </div>

              {/* Status Alert Message */}
              {bookingMessage && (
                <div
                  className={`p-3 rounded-xl mb-4 text-xs flex items-center space-x-2 ${
                    bookingMessage.type === 'success'
                      ? 'bg-emerald-500/15 border border-emerald-500/30 text-emerald-300'
                      : 'bg-rose-500/15 border border-rose-500/30 text-rose-300'
                  }`}
                >
                  {bookingMessage.type === 'success' ? (
                    <CheckCircle className="w-4 h-4 flex-shrink-0" />
                  ) : (
                    <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  )}
                  <span>{bookingMessage.text}</span>
                </div>
              )}

              {/* Booking Form */}
              <form onSubmit={handleBookingSubmit} className="space-y-4 text-xs">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Reservation Date</label>
                  <input
                    type="date"
                    required
                    min={new Date().toISOString().split('T')[0]}
                    value={bookingDate}
                    onChange={(e) => setBookingDate(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-300 font-semibold mb-1">Start Time (24h)</label>
                    <input
                      type="time"
                      required
                      value={startTime}
                      onChange={(e) => setStartTime(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-300 font-semibold mb-1">End Time (24h)</label>
                    <input
                      type="time"
                      required
                      value={endTime}
                      onChange={(e) => setEndTime(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Event / Activity Purpose</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. AI Bootcamp Hands-on Workshop"
                    value={purpose}
                    onChange={(e) => setPurpose(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Expected Number of Attendees</label>
                  <input
                    type="number"
                    min="1"
                    max={selectedVenue.capacity}
                    value={attendees}
                    onChange={(e) => setAttendees(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:border-indigo-500"
                  />
                  <span className="text-[10px] text-slate-400 mt-1 block">Maximum capacity: {selectedVenue.capacity}</span>
                </div>

                <div className="pt-2 flex space-x-3">
                  <button
                    type="button"
                    onClick={() => setIsBookingOpen(false)}
                    className="flex-1 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold transition"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="flex-1 flex items-center justify-center space-x-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-semibold transition shadow-lg shadow-indigo-600/30"
                  >
                    {submitting ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Verifying Slots...</span>
                      </>
                    ) : (
                      <>
                        <Check className="w-4 h-4" />
                        <span>Confirm Request</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
