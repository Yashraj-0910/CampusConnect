import React, { useEffect, useState } from 'react';
import API from '../services/api';
import { Search, ChevronDown, ChevronUp, HelpCircle, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const FAQ = () => {
  const [faqs, setFaqs] = useState([]);
  const [search, setSearch] = useState('');
  const [openId, setOpenId] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchFAQs = async () => {
    try {
      const { data } = await API.get('/faqs', {
        params: { search }
      });
      setFaqs(data || []);
    } catch (err) {
      console.error('Error fetching FAQs:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFAQs();
  }, []);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchFAQs();
  };

  const toggleOpen = (id) => {
    setOpenId(openId === id ? null : id);
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-900 py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Background glow */}
      <div className="absolute top-10 left-1/2 -translate-x-1/2 w-full max-w-4xl h-[400px] bg-radial-glow pointer-events-none" />

      <div className="mx-auto max-w-3xl relative z-10">
        
        {/* Header */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 rounded-full border border-indigo-200 bg-indigo-50 px-3.5 py-1 text-xs font-bold text-indigo-700 mb-4 shadow-xs">
            <HelpCircle className="h-3.5 w-3.5 text-indigo-600" />
            <span>Help Center & Guidelines</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-extrabold font-['Space_Grotesk'] tracking-tight text-slate-900">
            Frequently Asked Questions
          </h1>
          <p className="text-slate-600 mt-2 text-sm sm:text-base font-medium">
            Everything you need to know about joining clubs, attending hackathons, and event logistics.
          </p>
        </div>

        {/* Search */}
        <form onSubmit={handleSearchSubmit} className="relative w-full mb-8">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search FAQs (e.g. beginner requirements, multiple clubs)..."
            className="w-full rounded-2xl border border-slate-200 bg-white py-3.5 pl-11 pr-4 text-xs sm:text-sm text-slate-900 placeholder-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-100 font-medium shadow-xs"
          />
          <Search className="absolute left-4 top-4 h-4 w-4 text-slate-400" />
        </form>

        {/* Accordion List */}
        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3, 4].map(n => (
              <div key={n} className="h-16 rounded-2xl bg-slate-100 animate-pulse border border-slate-200" />
            ))}
          </div>
        ) : (
          <div className="space-y-4">
            {faqs.map((faq) => {
              const isOpen = openId === faq.id;
              return (
                <div
                  key={faq.id}
                  className={`glass-card rounded-3xl overflow-hidden border transition-all bg-white shadow-xs ${
                    isOpen ? 'border-indigo-300 ring-2 ring-indigo-50' : 'border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <button
                    onClick={() => toggleOpen(faq.id)}
                    className="w-full flex items-center justify-between p-5 text-left font-bold text-sm sm:text-base text-slate-900 hover:bg-slate-50/50 transition-colors cursor-pointer"
                  >
                    <span>{faq.question}</span>
                    <span className="p-1.5 rounded-xl bg-slate-100 text-slate-500 ml-3 shrink-0">
                      {isOpen ? <ChevronUp className="h-4 w-4 text-indigo-600" /> : <ChevronDown className="h-4 w-4" />}
                    </span>
                  </button>

                  <AnimatePresence>
                    {isOpen && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="px-5 pb-5 pt-1 text-xs sm:text-sm text-slate-600 leading-relaxed border-t border-slate-100 font-medium"
                      >
                        <p className="mt-2">{faq.answer}</p>
                        <span className="inline-block mt-4 text-[10px] uppercase tracking-wider font-bold text-indigo-700 bg-indigo-50 border border-indigo-200 px-2.5 py-0.5 rounded-full">
                          Category: {faq.category || 'General'}
                        </span>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}

            {faqs.length === 0 && (
              <div className="glass-card rounded-3xl p-12 text-center text-slate-500 text-xs font-medium border border-slate-200 bg-white">
                No FAQs matched your search query. Try typing another keyword.
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default FAQ;
