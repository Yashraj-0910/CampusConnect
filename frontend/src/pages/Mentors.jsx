import React, { useEffect, useState } from 'react';
import API from '../services/api';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search,
  MessageSquare,
  Send,
  CheckCircle2,
  Users,
  Sparkles,
  BookOpen,
  Award,
  X,
  Compass
} from 'lucide-react';

const Mentors = () => {
  const [mentors, setMentors] = useState([]);
  const [department, setDepartment] = useState('');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  // QA dialog state
  const [selectedMentor, setSelectedMentor] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [newQuestion, setNewQuestion] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  const fetchMentors = async () => {
    setLoading(true);
    try {
      const { data } = await API.get('/mentors', {
        params: { department, search }
      });
      setMentors(data || []);
    } catch (err) {
      console.error('Error fetching mentors:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchQuestions = async (mentorId) => {
    try {
      const { data } = await API.get(`/mentors/${mentorId}/questions`);
      setQuestions(data || []);
    } catch (err) {
      console.error('Error loading questions:', err);
    }
  };

  useEffect(() => {
    fetchMentors();
  }, [department]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchMentors();
  };

  const handleOpenQA = (mentor) => {
    setSelectedMentor(mentor);
    setQuestions([]);
    fetchQuestions(mentor.id);
  };

  const handleAskQuestion = async (e) => {
    e.preventDefault();
    if (!newQuestion.trim()) return;
    setSubmitting(true);
    setSubmitSuccess(false);

    try {
      await API.post(`/mentors/${selectedMentor.id}/questions`, { question: newQuestion });
      setSubmitSuccess(true);
      setNewQuestion('');
      fetchQuestions(selectedMentor.id);
      setTimeout(() => setSubmitSuccess(false), 2000);
    } catch (err) {
      console.error(err);
      alert('Error submitting question');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-900 py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Background glow */}
      <div className="absolute top-10 right-10 w-96 h-96 rounded-full bg-cyan-200/40 blur-[100px] pointer-events-none" />

      <div className="mx-auto max-w-7xl relative z-10">
        
        {/* Header */}
        <div className="mb-10 text-center sm:text-left">
          <div className="inline-flex items-center gap-2 rounded-full border border-cyan-200 bg-cyan-50 px-3.5 py-1 text-xs font-bold text-cyan-700 mb-3 shadow-xs">
            <Users className="h-3.5 w-3.5 text-cyan-600" />
            <span>Senior Student Guidance</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-extrabold font-['Space_Grotesk'] tracking-tight text-slate-900">
            Senior Student Mentors
          </h1>
          <p className="text-slate-600 mt-2 text-sm sm:text-base max-w-2xl font-medium">
            Get 1-on-1 advice on tech roadmaps, club recruitment prep, hackathon strategies, and academic success from senior students.
          </p>
        </div>

        {/* Filter and Search Bar */}
        <div className="glass-card rounded-3xl p-4 mb-10 flex flex-col md:flex-row gap-4 items-center justify-between border border-slate-200 shadow-sm bg-white">
          <form onSubmit={handleSearchSubmit} className="relative w-full md:w-96">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by mentor name, skill, or club..."
              className="w-full rounded-2xl border border-slate-200 bg-slate-50/70 py-2.5 pl-10 pr-4 text-xs sm:text-sm text-slate-900 placeholder-slate-400 focus:border-cyan-500 focus:bg-white focus:outline-none font-medium"
            />
            <Search className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
          </form>

          <select
            value={department}
            onChange={(e) => setDepartment(e.target.value)}
            className="w-full md:w-auto rounded-2xl border border-slate-200 bg-slate-50/70 py-2.5 px-4 text-xs font-bold text-slate-700 focus:border-cyan-500 focus:bg-white focus:outline-none cursor-pointer"
          >
            <option value="">All Departments</option>
            <option value="Computer Science">Computer Science & AI</option>
            <option value="Information Technology">Information Technology</option>
            <option value="Electronics">Electronics & Comm</option>
            <option value="Electrical Engineering">Electrical Engineering</option>
            <option value="Mechanical Engineering">Mechanical Engineering</option>
            <option value="Design">Design & Media</option>
          </select>
        </div>

        {/* Mentors Grid */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map(n => (
              <div key={n} className="h-80 rounded-3xl bg-slate-100 animate-pulse border border-slate-200" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {mentors.map((mentor) => (
              <motion.div
                key={mentor.id}
                whileHover={{ y: -4 }}
                className="glass-card glass-card-hover rounded-3xl p-6 flex flex-col justify-between border border-slate-200 shadow-sm bg-white"
              >
                <div className="text-center">
                  <div className="relative inline-block mb-4">
                    {mentor.photo_url ? (
                      <img
                        src={mentor.photo_url}
                        alt={mentor.User?.name}
                        className="h-20 w-20 rounded-3xl mx-auto bg-slate-100 border-2 border-cyan-400 object-cover shadow-sm"
                      />
                    ) : (
                      <div className="h-20 w-20 rounded-3xl mx-auto bg-gradient-to-tr from-cyan-600 to-indigo-600 flex items-center justify-center text-white text-2xl font-bold uppercase shadow-sm">
                        {mentor.User?.name?.[0] || 'M'}
                      </div>
                    )}
                    <span className="absolute -bottom-1 -right-1 flex h-6 w-6 items-center justify-center rounded-full bg-emerald-500 text-white text-[10px] ring-2 ring-white font-bold" title="Active Mentor">
                      ✓
                    </span>
                  </div>

                  <h3 className="text-lg font-bold font-['Space_Grotesk'] text-slate-900 mb-1">
                    {mentor.User?.name}
                  </h3>
                  <span className="text-[11px] font-bold text-cyan-700 bg-cyan-50 border border-cyan-200 px-3 py-0.5 rounded-full inline-block">
                    {mentor.department} • Year {mentor.year}
                  </span>
                  
                  <div className="mt-5 space-y-2.5 text-left border-t border-slate-100 pt-4">
                    <div className="text-xs">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-0.5">Interests:</span>
                      <span className="text-slate-700 font-semibold">{mentor.interests || 'Fullstack, System Design'}</span>
                    </div>
                    <div className="text-xs">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-0.5">Clubs Led:</span>
                      <span className="text-slate-700 font-semibold">{mentor.clubs || 'CodeCraft, Robotics Chapter'}</span>
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => handleOpenQA(mentor)}
                  className="mt-6 flex items-center justify-center gap-2 rounded-2xl bg-cyan-50 hover:bg-cyan-600 text-cyan-700 hover:text-white border border-cyan-200 py-2.5 text-xs font-bold transition-all duration-200 cursor-pointer shadow-xs"
                >
                  <MessageSquare className="h-4 w-4" />
                  <span>Ask Question</span>
                </button>
              </motion.div>
            ))}

            {mentors.length === 0 && (
              <div className="col-span-full glass-card rounded-3xl p-16 text-center max-w-md mx-auto my-12 border border-slate-200 bg-white">
                <Users className="h-12 w-12 text-slate-400 mx-auto mb-4" />
                <h3 className="text-lg font-bold text-slate-900">No Mentors Found</h3>
                <p className="text-xs text-slate-500 mt-1 mb-6 font-medium">No senior mentors matched this department filter.</p>
                <button
                  onClick={() => { setSearch(''); setDepartment(''); }}
                  className="rounded-2xl bg-cyan-600 hover:bg-cyan-700 px-6 py-2.5 text-xs font-bold text-white transition-all cursor-pointer shadow-sm"
                >
                  Clear Filters
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* QA Dialog Modal */}
      <AnimatePresence>
        {selectedMentor && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-2xl rounded-3xl bg-white border border-slate-200 p-6 sm:p-8 shadow-2xl relative flex flex-col max-h-[85vh]"
            >
              <button
                onClick={() => setSelectedMentor(null)}
                className="absolute top-6 right-6 text-slate-400 hover:text-slate-600"
              >
                <X className="h-5 w-5" />
              </button>

              <h3 className="font-['Space_Grotesk'] text-xl font-bold text-slate-900 mb-1">
                Q&A with {selectedMentor.User?.name}
              </h3>
              <p className="text-xs text-slate-500 border-b border-slate-100 pb-3 mb-4 font-medium">
                Specialized in: {selectedMentor.interests}
              </p>

              {/* QA List */}
              <div className="flex-1 overflow-y-auto space-y-4 mb-4 pr-2">
                {questions.map((q) => (
                  <div key={q.id} className="space-y-2">
                    <div className="rounded-2xl bg-indigo-50 border border-indigo-200/80 p-4 text-xs text-indigo-950 ml-6 font-medium">
                      <span className="text-[10px] text-indigo-700 font-bold uppercase block mb-1">My Question:</span>
                      {q.question}
                    </div>
                    {q.answer ? (
                      <div className="rounded-2xl bg-slate-50 border border-slate-200 p-4 text-xs text-slate-800 mr-6 font-medium">
                        <span className="text-[10px] text-cyan-700 font-bold uppercase block mb-1">Mentor Answer:</span>
                        {q.answer}
                      </div>
                    ) : (
                      <div className="text-[11px] text-slate-400 italic ml-6">Awaiting mentor reply...</div>
                    )}
                  </div>
                ))}
                {questions.length === 0 && (
                  <div className="text-center py-12 text-slate-400 text-xs font-medium">
                    No questions recorded yet for this mentor. Ask the first question below!
                  </div>
                )}
              </div>

              {submitSuccess && (
                <div className="rounded-2xl bg-emerald-50 border border-emerald-200 p-3 text-xs text-emerald-700 mb-3 flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600" />
                  <span>Your question has been sent to the mentor!</span>
                </div>
              )}

              <form onSubmit={handleAskQuestion} className="border-t border-slate-100 pt-4 flex gap-2">
                <input
                  type="text"
                  required
                  value={newQuestion}
                  onChange={(e) => setNewQuestion(e.target.value)}
                  placeholder="Ask for roadmap advice, club interview prep, resume review..."
                  className="flex-1 rounded-2xl border border-slate-200 bg-slate-50 py-2.5 px-4 text-xs text-slate-900 placeholder-slate-400 focus:border-cyan-500 focus:bg-white focus:outline-none font-medium"
                />
                <button
                  type="submit"
                  disabled={submitting}
                  className="rounded-2xl bg-cyan-600 hover:bg-cyan-700 px-5 py-2.5 text-white shadow-sm transition-all cursor-pointer disabled:opacity-50"
                >
                  <Send className="h-4 w-4" />
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Mentors;
