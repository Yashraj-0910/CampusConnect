import React, { useContext, useState } from 'react';
import { AuthContext } from '../context/AuthContext';
import API from '../services/api';
import {
  User,
  Mail,
  CreditCard,
  BookOpen,
  Clock,
  Sparkles,
  CheckCircle2,
  ShieldCheck,
  Award,
  Calendar
} from 'lucide-react';
import { motion } from 'framer-motion';

const Profile = () => {
  const { user, reloadProfile } = useContext(AuthContext);
  const [bio, setBio] = useState(user?.Student?.bio || '');
  const [skills, setSkills] = useState(user?.Student?.skills || '');
  const [availability, setAvailability] = useState(user?.Student?.availability || '');
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setSuccess(false);

    try {
      await API.put('/auth/me', { bio, skills, availability });
      setSuccess(true);
      if (reloadProfile) reloadProfile();
      setTimeout(() => setSuccess(false), 2500);
    } catch (err) {
      console.error(err);
      alert('Error updating student profile');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-900 py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Background glow */}
      <div className="absolute top-10 right-10 w-96 h-96 rounded-full bg-indigo-200/40 blur-[100px] pointer-events-none" />

      <div className="mx-auto max-w-4xl relative z-10 space-y-8">
        
        {/* Header */}
        <div>
          <div className="inline-flex items-center gap-2 rounded-full border border-indigo-200 bg-indigo-50 px-3.5 py-1 text-xs font-bold text-indigo-700 mb-3 shadow-xs">
            <User className="h-3.5 w-3.5 text-indigo-600" />
            <span>Account & Identity</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold font-['Space_Grotesk'] tracking-tight text-slate-900">
            Student Profile & ID Card
          </h1>
          <p className="text-slate-500 mt-1 text-xs sm:text-sm font-medium">
            Manage your verified university credentials and customize your student portfolio.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          
          {/* Digital Student Card */}
          <div className="glass-card rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm flex flex-col justify-between relative overflow-hidden bg-white">
            <div className="text-center relative z-10">
              <div className="relative inline-block mx-auto mb-4">
                <div className="h-24 w-24 rounded-3xl bg-gradient-to-tr from-indigo-600 to-violet-600 p-[1.5px] shadow-md shadow-indigo-500/20">
                  <div className="h-full w-full rounded-[22px] bg-white flex items-center justify-center text-indigo-600 text-3xl font-extrabold uppercase">
                    {user?.name?.[0] || 'U'}
                  </div>
                </div>
                <span className="absolute -bottom-1 -right-1 flex h-6 w-6 items-center justify-center rounded-full bg-emerald-500 text-white text-[10px] ring-2 ring-white font-bold" title="Verified Student">
                  ✓
                </span>
              </div>

              <h3 className="text-lg font-bold font-['Space_Grotesk'] text-slate-900">{user?.name}</h3>
              <span className="inline-block rounded-full bg-indigo-50 border border-indigo-200 px-3 py-0.5 text-[10px] font-bold text-indigo-700 mt-1 uppercase tracking-wider">
                {user?.role}
              </span>
            </div>

            <div className="border-t border-slate-100 pt-6 space-y-3.5 text-xs font-semibold text-slate-600">
              <div className="flex items-center gap-2.5">
                <Mail className="h-4 w-4 text-slate-400 shrink-0" />
                <span className="truncate">{user?.email}</span>
              </div>

              {user?.Student && (
                <>
                  <div className="flex items-center gap-2.5">
                    <CreditCard className="h-4 w-4 text-slate-400 shrink-0" />
                    <span>ID: {user.Student.student_id_card || 'STU-VERIFIED'}</span>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <BookOpen className="h-4 w-4 text-slate-400 shrink-0" />
                    <span>{user.Student.department} (Year {user.Student.year})</span>
                  </div>
                </>
              )}
            </div>

            <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between text-[11px] font-medium text-slate-500">
              <span>CampusConnect Pass</span>
              <span className="text-emerald-600 font-bold">Active</span>
            </div>
          </div>

          {/* Form Editing */}
          {user?.Student && (
            <div className="md:col-span-2 glass-card rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm bg-white">
              <h2 className="text-xl font-bold font-['Space_Grotesk'] text-slate-900 mb-6">
                Portfolio Details
              </h2>

              {success && (
                <div className="rounded-2xl bg-emerald-50 border border-emerald-200 p-3.5 text-xs text-emerald-700 mb-6 flex items-center gap-2">
                  <CheckCircle2 className="h-4.5 w-4.5 shrink-0 text-emerald-600" />
                  <span>Your student portfolio details have been updated!</span>
                </div>
              )}

              <form onSubmit={handleSave} className="space-y-5">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1.5">
                    Bio & Statement
                  </label>
                  <textarea
                    name="bio"
                    rows="3"
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    className="w-full rounded-2xl border border-slate-200 bg-slate-50/70 py-2.5 px-4 text-xs text-slate-900 placeholder-slate-400 focus:border-indigo-500 focus:bg-white focus:outline-none font-medium"
                    placeholder="Describe your tech interests, leadership aspirations, or current projects..."
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1.5">
                    Key Technical & Creative Skills
                  </label>
                  <input
                    type="text"
                    name="skills"
                    value={skills}
                    onChange={(e) => setSkills(e.target.value)}
                    className="w-full rounded-2xl border border-slate-200 bg-slate-50/70 py-2.5 px-4 text-xs text-slate-900 placeholder-slate-400 focus:border-indigo-500 focus:bg-white focus:outline-none font-medium"
                    placeholder="React, Python, Figma, 3D Modeling, Public Speaking..."
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1.5">
                    Weekly Availability for Club Projects
                  </label>
                  <input
                    type="text"
                    name="availability"
                    value={availability}
                    onChange={(e) => setAvailability(e.target.value)}
                    className="w-full rounded-2xl border border-slate-200 bg-slate-50/70 py-2.5 px-4 text-xs text-slate-900 placeholder-slate-400 focus:border-indigo-500 focus:bg-white focus:outline-none font-medium"
                    placeholder="Weekdays after 5 PM, weekends..."
                  />
                </div>

                <div className="pt-4 border-t border-slate-100 flex justify-end">
                  <button
                    type="submit"
                    disabled={saving}
                    className="rounded-2xl bg-gradient-to-r from-indigo-600 to-violet-600 px-7 py-3 text-xs font-bold text-white shadow-md shadow-indigo-600/20 hover:opacity-95 transition-all cursor-pointer disabled:opacity-50"
                  >
                    {saving ? 'Saving...' : 'Save Portfolio Changes'}
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Profile;
