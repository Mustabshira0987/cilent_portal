import React, { useState } from 'react';
import { usePortal } from '../context/PortalContext';
import { Building2, ShieldCheck, Bell, Save, RefreshCw, Globe, Phone, Mail, User, KeyRound, Lock } from 'lucide-react';
import { usePageTitle } from '../hooks/usePageTitle';

export const SettingsPage: React.FC = () => {
  usePageTitle('Account Settings');
  const { profile, updateAgencyProfile } = usePortal();

  // Selected tab
  const [activeTab, setActiveTab] = useState<'profile' | 'security' | 'notifications'>('profile');

  // Form states: Profile
  const [name, setName] = useState(profile.name);
  const [email, setEmail] = useState(profile.email);
  const [companyName, setCompanyName] = useState(profile.companyName);
  const [website, setWebsite] = useState(profile.website);
  const [phone, setPhone] = useState(profile.phone);
  const [logo, setLogo] = useState(profile.logo || '');

  // Form states: Security
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Form states: Notifications preferences
  const [emailAlerts, setEmailAlerts] = useState(true);
  const [revisionPings, setRevisionPings] = useState(true);
  const [weeklyDigests, setWeeklyDigests] = useState(false);

  // Status logs
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  const handleProfileSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSuccess('');
    setError('');

    setTimeout(() => {
      updateAgencyProfile({
        name,
        email,
        companyName,
        website,
        phone,
        logo
      });
      setSaving(false);
      setSuccess('Profile configuration saved successfully!');
      setTimeout(() => setSuccess(''), 3000);
    }, 800);
  };

  const handleSecuritySave = (e: React.FormEvent) => {
    e.preventDefault();
    setSuccess('');
    setError('');

    if (!currentPassword || !newPassword || !confirmPassword) {
      setError('Please fill in all password fields.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('New passwords do not match.');
      return;
    }

    setSaving(true);
    setTimeout(() => {
      setSaving(false);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setSuccess('Password updated successfully! Future log-ins will use the new key.');
      setTimeout(() => setSuccess(''), 4000);
    }, 800);
  };

  const handleNotificationsSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSuccess('');

    setTimeout(() => {
      setSaving(false);
      setSuccess('Notification preferences customized!');
      setTimeout(() => setSuccess(''), 3000);
    }, 500);
  };

  return (
    <div className="space-y-6 font-sans">
      
      {/* Header section */}
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">
          Account Settings
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          Customize brand logos, reset credentials, and customize client notification preferences.
        </p>
      </div>

      {/* Grid: Left column tab list, Right column form panel */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-start">
        
        {/* Navigation Sidebar Tabs */}
        <div className="rounded-2xl border border-slate-100 bg-white p-3 shadow-sm space-y-1">
          <button
            onClick={() => setActiveTab('profile')}
            className={`w-full flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold transition ${
              activeTab === 'profile'
                ? 'bg-blue-50 text-blue-600'
                : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
            }`}
          >
            <Building2 className="h-5 w-5" />
            <span>Agency Profile</span>
          </button>

          <button
            onClick={() => setActiveTab('security')}
            className={`w-full flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold transition ${
              activeTab === 'security'
                ? 'bg-blue-50 text-blue-600'
                : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
            }`}
          >
            <ShieldCheck className="h-5 w-5" />
            <span>Security & Pass</span>
          </button>

          <button
            onClick={() => setActiveTab('notifications')}
            className={`w-full flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold transition ${
              activeTab === 'notifications'
                ? 'bg-blue-50 text-blue-600'
                : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
            }`}
          >
            <Bell className="h-5 w-5" />
            <span>Notifications</span>
          </button>
        </div>

        {/* Action Panel */}
        <div className="lg:col-span-3 rounded-2xl border border-slate-100 bg-white p-6 md:p-8 shadow-sm">
          
          {/* Messages */}
          {success && (
            <div className="mb-6 rounded-xl bg-emerald-50 p-4 text-xs font-semibold text-emerald-600">
              {success}
            </div>
          )}
          {error && (
            <div className="mb-6 rounded-xl bg-rose-50 p-4 text-xs font-semibold text-rose-600">
              {error}
            </div>
          )}

          {/* Profile form */}
          {activeTab === 'profile' && (
            <form onSubmit={handleProfileSave} className="space-y-6">
              <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider border-b border-slate-50 pb-2">
                Company Details
              </h3>

              {/* Grid Inputs */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="p-name" className="text-xs font-bold text-slate-700 block mb-1.5">Contact Name</label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400">
                      <User className="h-4 w-4" />
                    </span>
                    <input
                      id="p-name"
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      required
                      className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-10 pr-4 text-sm outline-none focus:border-blue-500 transition"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="p-email" className="text-xs font-bold text-slate-700 block mb-1.5">Work Email</label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400">
                      <Mail className="h-4 w-4" />
                    </span>
                    <input
                      id="p-email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-10 pr-4 text-sm outline-none focus:border-blue-500 transition"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="p-comp" className="text-xs font-bold text-slate-700 block mb-1.5">Company Name</label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400">
                      <Building2 className="h-4 w-4" />
                    </span>
                    <input
                      id="p-comp"
                      type="text"
                      value={companyName}
                      onChange={(e) => setCompanyName(e.target.value)}
                      required
                      className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-10 pr-4 text-sm outline-none focus:border-blue-500 transition"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="p-web" className="text-xs font-bold text-slate-700 block mb-1.5">Agency Website URL</label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400">
                      <Globe className="h-4 w-4" />
                    </span>
                    <input
                      id="p-web"
                      type="url"
                      value={website}
                      onChange={(e) => setWebsite(e.target.value)}
                      className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-10 pr-4 text-sm outline-none focus:border-blue-500 transition"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label htmlFor="p-phone" className="text-xs font-bold text-slate-700 block mb-1.5">Phone Number</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400">
                    <Phone className="h-4 w-4" />
                  </span>
                  <input
                    id="p-phone"
                    type="text"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-10 pr-4 text-sm outline-none focus:border-blue-500 transition"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="p-logo" className="text-xs font-bold text-slate-700 block mb-1.5">Logo URL (Unsplash or SVG)</label>
                <input
                  id="p-logo"
                  type="text"
                  placeholder="https://images.unsplash.com/photo-..."
                  value={logo}
                  onChange={(e) => setLogo(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-white py-2.5 px-4 text-sm outline-none focus:border-blue-500 transition font-mono text-xs"
                />
              </div>

              {/* Action */}
              <div className="flex justify-end pt-4 border-t border-slate-50">
                <button
                  type="submit"
                  id="save-profile-btn"
                  disabled={saving}
                  className="flex items-center gap-2 rounded-xl bg-blue-600 px-6 py-2.5 text-xs font-bold text-white shadow-lg shadow-blue-200 hover:bg-blue-700 transition"
                >
                  <Save className="h-4 w-4" />
                  <span>{saving ? 'Saving...' : 'Save Settings'}</span>
                </button>
              </div>
            </form>
          )}

          {/* Security & Password */}
          {activeTab === 'security' && (
            <form onSubmit={handleSecuritySave} className="space-y-6">
              <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider border-b border-slate-50 pb-2">
                Authentication & Password
              </h3>

              <div className="space-y-4">
                <div>
                  <label htmlFor="sec-current" className="text-xs font-bold text-slate-700 block mb-1.5">Current Password</label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400">
                      <Lock className="h-4 w-4" />
                    </span>
                    <input
                      id="sec-current"
                      type="password"
                      placeholder="••••••••"
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-10 pr-4 text-sm outline-none focus:border-blue-500 transition"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="sec-new" className="text-xs font-bold text-slate-700 block mb-1.5">New Password</label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400">
                      <KeyRound className="h-4 w-4" />
                    </span>
                    <input
                      id="sec-new"
                      type="password"
                      placeholder="At least 8 characters"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-10 pr-4 text-sm outline-none focus:border-blue-500 transition"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="sec-confirm" className="text-xs font-bold text-slate-700 block mb-1.5">Confirm New Password</label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400">
                      <KeyRound className="h-4 w-4" />
                    </span>
                    <input
                      id="sec-confirm"
                      type="password"
                      placeholder="Re-type new password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-10 pr-4 text-sm outline-none focus:border-blue-500 transition"
                    />
                  </div>
                </div>
              </div>

              {/* Action */}
              <div className="flex justify-end pt-4 border-t border-slate-50">
                <button
                  type="submit"
                  id="save-password-btn"
                  disabled={saving}
                  className="flex items-center gap-2 rounded-xl bg-blue-600 px-6 py-2.5 text-xs font-bold text-white shadow-lg shadow-blue-200 hover:bg-blue-700 transition"
                >
                  <RefreshCw className="h-4 w-4" />
                  <span>Update Password</span>
                </button>
              </div>
            </form>
          )}

          {/* Notifications config */}
          {activeTab === 'notifications' && (
            <form onSubmit={handleNotificationsSave} className="space-y-6">
              <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider border-b border-slate-50 pb-2">
                Notification Deliveries
              </h3>

              <div className="space-y-5">
                <label className="flex items-start gap-3 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={emailAlerts}
                    onChange={(e) => setEmailAlerts(e.target.checked)}
                    className="mt-1 h-4.5 w-4.5 rounded border-slate-200 text-blue-600 focus:ring-blue-500"
                  />
                  <div>
                    <span className="text-xs font-bold text-slate-800 block">Deliverable Status Updates</span>
                    <span className="text-[11px] text-slate-400 leading-normal block mt-0.5">Send a real-time email digest whenever a client approves or requests changes on an asset.</span>
                  </div>
                </label>

                <label className="flex items-start gap-3 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={revisionPings}
                    onChange={(e) => setRevisionPings(e.target.checked)}
                    className="mt-1 h-4.5 w-4.5 rounded border-slate-200 text-blue-600 focus:ring-blue-500"
                  />
                  <div>
                    <span className="text-xs font-bold text-slate-800 block">Immediate Comment Mentions</span>
                    <span className="text-[11px] text-slate-400 leading-normal block mt-0.5">Trigger notification triggers whenever a comment is written on discussion boards.</span>
                  </div>
                </label>

                <label className="flex items-start gap-3 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={weeklyDigests}
                    onChange={(e) => setWeeklyDigests(e.target.checked)}
                    className="mt-1 h-4.5 w-4.5 rounded border-slate-200 text-blue-600 focus:ring-blue-500"
                  />
                  <div>
                    <span className="text-xs font-bold text-slate-800 block">Weekly Portal Progress Digest</span>
                    <span className="text-[11px] text-slate-400 leading-normal block mt-0.5">Receive a compiled Friday status summary for all your active client portals.</span>
                  </div>
                </label>
              </div>

              {/* Action */}
              <div className="flex justify-end pt-4 border-t border-slate-50">
                <button
                  type="submit"
                  id="save-notif-prefs-btn"
                  className="flex items-center gap-2 rounded-xl bg-blue-600 px-6 py-2.5 text-xs font-bold text-white shadow-lg shadow-blue-200 hover:bg-blue-700 transition"
                >
                  <Save className="h-4 w-4" />
                  <span>Update Preferences</span>
                </button>
              </div>
            </form>
          )}

        </div>
      </div>
    </div>
  );
};
export default SettingsPage;
