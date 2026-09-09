import React from 'react';
import {
  Compass,
  Calendar,
  BookOpen,
  UserCheck,
  MessageSquare,
  Award,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  CheckCircle2
} from 'lucide-react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';

const STEPS = [
  {
    title: 'Orientation & Induction',
    desc: 'Attend campus orientation fairs, meet departmental faculty advisors, and register your student profile on CampusConnect.',
    icon: BookOpen,
    tag: 'Month 1'
  },
  {
    title: 'Explore Communities & Tech Stacks',
    desc: 'Browse through active technical, design, cultural, and sports clubs. Shortlist 2-3 clubs matching your career goals.',
    icon: Compass,
    tag: 'Month 1-2'
  },
  {
    title: 'Apply for Club Recruitments',
    desc: 'Fill out online club recruitment applications, highlight your foundational interests, and submit before deadlines.',
    icon: UserCheck,
    tag: 'Month 2'
  },
  {
    title: 'Attend Induction Auditions & Interviews',
    desc: 'Participate in short interactive Q&As or starter auditions. Connect with senior mentors for interview tips.',
    icon: MessageSquare,
    tag: 'Month 2-3'
  },
  {
    title: 'Build Projects & Hackathon Participation',
    desc: 'Collaborate with team members, attend hands-on workshops, and submit projects to campus hackathons.',
    icon: Calendar,
    tag: 'Month 3-6'
  },
  {
    title: 'Lead Chapters & Mentor Juniors',
    desc: 'Advance to club coordinator roles, organize annual campus festivals, and mentor the incoming freshman batch.',
    icon: Award,
    tag: 'Year 2+'
  }
];

const Roadmap = () => {
  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-900 py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Glow */}
      <div className="absolute top-10 left-1/2 -translate-x-1/2 w-full max-w-4xl h-[500px] bg-radial-glow pointer-events-none" />

      <div className="mx-auto max-w-4xl relative z-10">
        
        {/* Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 rounded-full border border-indigo-200 bg-indigo-50 px-3.5 py-1 text-xs font-bold text-indigo-700 mb-4 shadow-xs">
            <Sparkles className="h-3.5 w-3.5 text-indigo-600" />
            <span>Freshman Student Blueprint</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-extrabold font-['Space_Grotesk'] tracking-tight text-slate-900">
            Freshman College Roadmap
          </h1>
          <p className="text-slate-600 max-w-xl mx-auto mt-3 text-sm sm:text-base leading-relaxed font-medium">
            A proven step-by-step pathway from your first day on campus to leading premier clubs and winning hackathons.
          </p>
        </div>

        {/* Vertical Timeline */}
        <div className="relative border-l-2 border-indigo-200 ml-4 md:ml-28 space-y-12 pb-12">
          {STEPS.map((step, idx) => {
            const IconComponent = step.icon;
            return (
              <motion.div
                key={idx}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: idx * 0.1 }}
                className="relative pl-8 md:pl-12"
              >
                {/* Node Icon */}
                <div className="absolute -left-[25px] top-1.5 flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-tr from-indigo-600 to-violet-600 p-[1.5px] shadow-md shadow-indigo-500/20 ring-4 ring-[#f8fafc]">
                  <div className="flex h-full w-full items-center justify-center rounded-[14px] bg-white">
                    <IconComponent className="h-5 w-5 text-indigo-600" />
                  </div>
                </div>

                <div className="glass-card glass-card-hover rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm bg-white">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-700 bg-indigo-50 border border-indigo-200 px-3 py-0.5 rounded-full">
                      Phase {idx + 1}
                    </span>
                    <span className="text-xs font-bold text-indigo-600">
                      {step.tag}
                    </span>
                  </div>

                  <h3 className="text-lg sm:text-xl font-bold font-['Space_Grotesk'] text-slate-900 mt-1 mb-2">
                    {step.title}
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-medium">
                    {step.desc}
                  </p>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Practical Advice Grid */}
        <div className="glass-card rounded-3xl p-8 sm:p-10 border border-slate-200 shadow-sm mt-8 bg-white">
          <div className="flex items-center gap-2 text-indigo-600 mb-6">
            <ShieldCheck className="h-6 w-6 text-emerald-600" />
            <h2 className="text-xl sm:text-2xl font-bold font-['Space_Grotesk'] text-slate-900">
              Keys to Freshmen Success
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 text-xs sm:text-sm">
            <div className="rounded-2xl bg-slate-50 border border-slate-200 p-5">
              <span className="font-bold text-indigo-700 block mb-1">1. Zero Experience Required</span>
              <p className="text-slate-600 leading-relaxed font-medium">Almost every technical and cultural club conducts beginner bootcamp tracks.</p>
            </div>
            <div className="rounded-2xl bg-slate-50 border border-slate-200 p-5">
              <span className="font-bold text-violet-700 block mb-1">2. Connect With Mentors</span>
              <p className="text-slate-600 leading-relaxed font-medium">Use the Mentors directory on CampusConnect to seek resume feedback and interview tips.</p>
            </div>
            <div className="rounded-2xl bg-slate-50 border border-slate-200 p-5">
              <span className="font-bold text-cyan-700 block mb-1">3. Depth Over Breadth</span>
              <p className="text-slate-600 leading-relaxed font-medium">Explore broadly in Semester 1, then dedicate your energy to 1-2 clubs for leadership roles.</p>
            </div>
            <div className="rounded-2xl bg-slate-50 border border-slate-200 p-5">
              <span className="font-bold text-amber-700 block mb-1">4. Build Proof of Work</span>
              <p className="text-slate-600 leading-relaxed font-medium">Participate in at least two hackathons or club projects each academic year.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Roadmap;
