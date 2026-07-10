import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { usePortal } from '../context/PortalContext';
import { mockTeamMembers } from '../utils/dummyData';
import { ChevronLeft, FolderPlus, ArrowRight, UserPlus, Users, Check } from 'lucide-react';
import { usePageTitle } from '../hooks/usePageTitle';

export const CreateProjectPage: React.FC = () => {
  usePageTitle('Create New Project');
  const { createProject } = usePortal();
  const navigate = useNavigate();

  // State managers
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [clientName, setClientName] = useState('');
  const [clientEmail, setClientEmail] = useState('');
  const [deadline, setDeadline] = useState('');
  const [priority, setPriority] = useState<'low' | 'medium' | 'high'>('medium');
  const [status, setStatus] = useState<'active' | 'completed' | 'on-hold'>('active');
  const [selectedTeam, setSelectedTeam] = useState<string[]>(['t1', 't2']); // default assign Sarah & John
  
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleTeamToggle = (id: string) => {
    setSelectedTeam(prev => 
      prev.includes(id) ? prev.filter(tId => tId !== id) : [...prev, id]
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!name || !description || !clientName || !clientEmail || !deadline) {
      setError('Please fill in all mandatory fields.');
      return;
    }

    if (selectedTeam.length === 0) {
      setError('Please assign at least one team member to this portal.');
      return;
    }

    setLoading(true);
    // Simulating project creation sequence
    setTimeout(() => {
      createProject({
        name,
        description,
        clientName,
        clientEmail,
        deadline,
        priority,
        status,
        assignedTeamIds: selectedTeam,
      });
      setLoading(false);
      navigate('/agency');
    }, 500);
  };

  return (
    <div className="space-y-6 font-sans">
      
      {/* Upper Navigation Back Arrow */}
      <div className="flex items-center gap-3">
        <Link 
          to="/agency"
          className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-500 hover:bg-slate-50 transition"
        >
          <ChevronLeft className="h-5 w-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-slate-900">
            Create Client Portal
          </h1>
          <p className="text-xs text-slate-500">
            Set up an isolated, secure workspace workspace for your client.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Form panel */}
        <form onSubmit={handleSubmit} className="lg:col-span-2 space-y-6 rounded-2xl border border-slate-100 bg-white p-6 md:p-8 shadow-sm">
          {error && (
            <div className="rounded-xl bg-rose-50 p-4 text-xs font-semibold text-rose-600">
              {error}
            </div>
          )}

          {/* Section 1: Basic project attributes */}
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider">Project Specification</h3>
            
            <div>
              <label htmlFor="proj-name" className="text-xs font-bold text-slate-700 block mb-1.5">
                Project Name <span className="text-rose-500">*</span>
              </label>
              <input
                id="proj-name"
                type="text"
                placeholder="e.g. Acme Branding and Web App"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-white py-2.5 px-4 text-sm text-slate-800 placeholder-slate-400 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition"
              />
            </div>

            <div>
              <label htmlFor="proj-desc" className="text-xs font-bold text-slate-700 block mb-1.5">
                Brief / Description <span className="text-rose-500">*</span>
              </label>
              <textarea
                id="proj-desc"
                rows={4}
                placeholder="Provide a comprehensive brief detailing layout milestones, asset file size limits, and expectations..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-white py-2.5 px-4 text-sm text-slate-800 placeholder-slate-400 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition resize-none"
              />
            </div>
          </div>

          {/* Section 2: Client contact */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="client-name" className="text-xs font-bold text-slate-700 block mb-1.5">
                Client Company Name <span className="text-rose-500">*</span>
              </label>
              <input
                id="client-name"
                type="text"
                placeholder="e.g. Acme Corp"
                value={clientName}
                onChange={(e) => setClientName(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-white py-2.5 px-4 text-sm text-slate-800 placeholder-slate-400 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition"
              />
            </div>

            <div>
              <label htmlFor="client-email" className="text-xs font-bold text-slate-700 block mb-1.5">
                Primary Client Email <span className="text-rose-500">*</span>
              </label>
              <input
                id="client-email"
                type="email"
                placeholder="e.g. contact@acme.com"
                value={clientEmail}
                onChange={(e) => setClientEmail(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-white py-2.5 px-4 text-sm text-slate-800 placeholder-slate-400 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition"
              />
            </div>
          </div>

          {/* Section 3: Priority & Timelines */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-2">Priority Level</label>
              <div className="grid grid-cols-3 gap-2">
                {(['low', 'medium', 'high'] as const).map(p => (
                  <button
                    key={p}
                    type="button"
                    onClick={() => setPriority(p)}
                    className={`rounded-xl py-2.5 text-xs font-bold capitalize transition border ${
                      priority === p
                        ? p === 'high' ? 'bg-rose-50 border-rose-200 text-rose-600' :
                          p === 'medium' ? 'bg-amber-50 border-amber-200 text-amber-600' : 'bg-blue-50 border-blue-200 text-blue-600'
                        : 'bg-white border-slate-200 text-slate-500 hover:bg-slate-50'
                    }`}
                  >
                    {p}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label htmlFor="deadline" className="text-xs font-bold text-slate-700 block mb-1.5">
                Target Deadline <span className="text-rose-500">*</span>
              </label>
              <input
                id="deadline"
                type="date"
                value={deadline}
                onChange={(e) => setDeadline(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-white py-2 px-4 text-sm text-slate-800 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition"
              />
            </div>
          </div>

          {/* Form Actions footer */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
            <Link
              to="/agency"
              className="rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-xs font-bold text-slate-500 hover:bg-slate-50 transition"
            >
              Cancel
            </Link>
            <button
              type="submit"
              id="submit-project-btn"
              disabled={loading}
              className="group flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-6 py-2.5 text-xs font-bold text-white shadow-lg shadow-blue-100 hover:bg-blue-700 transition"
            >
              <span>{loading ? 'Creating Workspace...' : 'Launch Portal'}</span>
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
            </button>
          </div>
        </form>

        {/* Right Sidebar: Assigned agency team members */}
        <div className="space-y-6">
          <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
            <div className="border-b border-slate-50 pb-4 mb-4">
              <h3 className="font-bold text-slate-800 text-base flex items-center gap-2">
                <Users className="h-5 w-5 text-blue-600" />
                <span>Assign Team Members</span>
              </h3>
              <p className="text-xs text-slate-400 mt-1">Assign visual specialists and engineers to manage deliverables feedback.</p>
            </div>

            <div className="space-y-3">
              {mockTeamMembers.map(member => {
                const isSelected = selectedTeam.includes(member.id);
                return (
                  <button
                    key={member.id}
                    type="button"
                    onClick={() => handleTeamToggle(member.id)}
                    className={`w-full flex items-center justify-between rounded-xl border p-3 text-left transition duration-150 ${
                      isSelected 
                        ? 'border-blue-200 bg-blue-50/40 shadow-sm ring-1 ring-blue-100' 
                        : 'border-slate-100 bg-white hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="h-9 w-9 overflow-hidden rounded-lg bg-slate-100">
                        <img src={member.avatar} referrerPolicy="no-referrer" alt={member.name} className="h-full w-full object-cover" />
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-slate-800">{member.name}</h4>
                        <p className="text-[10px] text-slate-400 font-semibold">{member.role}</p>
                      </div>
                    </div>

                    <div className={`flex h-5 w-5 items-center justify-center rounded-full border transition ${
                      isSelected ? 'border-blue-500 bg-blue-500 text-white' : 'border-slate-200 bg-white'
                    }`}>
                      {isSelected && <Check className="h-3 w-3" />}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};
export default CreateProjectPage;
