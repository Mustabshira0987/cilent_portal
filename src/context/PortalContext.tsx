import React, { createContext, useContext, useState, useEffect } from 'react';
import { Project, Deliverable, Activity, Notification, AgencyProfile, UserRole, Comment, Milestone } from '../types';
import { mockProjects, mockDeliverables, mockActivities, mockNotifications, mockAgencyProfile } from '../utils/dummyData';
import { supabase } from '../lib/supabase';

interface PortalContextType {
  currentRole: UserRole;
  setRole: (role: UserRole) => void;
  projects: Project[];
  deliverables: Deliverable[];
  activities: Activity[];
  notifications: Notification[];
  profile: AgencyProfile;
  createProject: (projectData: {
    name: string;
    description: string;
    clientName: string;
    clientEmail: string;
    deadline: string;
    priority: Project['priority'];
    status: Project['status'];
    assignedTeamIds: string[];
  }) => void;
  addDeliverable: (projectId: string, fileName: string, version: string, fileSize: string) => void;
  updateDeliverableStatus: (deliverableId: string, status: Deliverable['status'], commentText?: string) => void;
  addCommentToProject: (projectId: string, text: string) => void;
  addCommentToDeliverable: (deliverableId: string, text: string) => void;
  updateAgencyProfile: (newProfile: AgencyProfile) => void;
  markNotificationsAsRead: () => void;
  setProjectProgress: (projectId: string, progress: number) => void;
  addMilestone: (projectId: string, title: string, dueDate: string) => void;
  toggleMilestoneStatus: (projectId: string, milestoneId: string) => void;
  addProjectActivity: (projectId: string, type: Activity['type'], title: string, description: string) => void;
  deleteProject: (projectId: string) => void;
}

const PortalContext = createContext<PortalContextType | undefined>(undefined);

export const usePortal = () => {
  const context = useContext(PortalContext);
  if (!context) throw new Error('usePortal must be used within a PortalProvider');
  return context;
};

// Helper: check if Supabase is configured
const isSupabaseConfigured = () => {
  const url = import.meta.env.VITE_SUPABASE_URL;
  return url && url !== 'your_supabase_project_url';
};

export const PortalProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentRole, setRoleState] = useState<UserRole>(() =>
    (localStorage.getItem('cpl_role') as UserRole) || 'agency'
  );
  const [projects, setProjects] = useState<Project[]>([]);
  const [deliverables, setDeliverables] = useState<Deliverable[]>([]);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [profile, setProfile] = useState<AgencyProfile>(mockAgencyProfile);

  // Load data: from Supabase if configured, else from mock/localStorage
  useEffect(() => {
    if (isSupabaseConfigured()) {
      loadFromSupabase().catch(() => loadFromLocal());
    } else {
      loadFromLocal();
    }
  }, []);

  const loadFromLocal = () => {
    setProjects(JSON.parse(localStorage.getItem('cpl_projects') || 'null') ?? mockProjects);
    setDeliverables(JSON.parse(localStorage.getItem('cpl_deliverables') || 'null') ?? mockDeliverables);
    setActivities(JSON.parse(localStorage.getItem('cpl_activities') || 'null') ?? mockActivities);
    setNotifications(JSON.parse(localStorage.getItem('cpl_notifications') || 'null') ?? mockNotifications);
    setProfile(JSON.parse(localStorage.getItem('cpl_profile') || 'null') ?? mockAgencyProfile);
  };

  const loadFromSupabase = async () => {
    const [{ data: proj, error: e1 }, { data: deliv, error: e2 }, { data: acts, error: e3 }, { data: notifs, error: e4 }, { data: prof }] =
      await Promise.all([
        supabase.from('projects').select('*').order('created_at', { ascending: false }),
        supabase.from('deliverables').select('*').order('uploaded_at', { ascending: false }),
        supabase.from('activities').select('*').order('timestamp', { ascending: false }),
        supabase.from('notifications').select('*').order('timestamp', { ascending: false }),
        supabase.from('agency_profiles').select('*').limit(1).maybeSingle(),
      ]);

    // If any core table errors, fall back to local
    if (e1 || e2 || e3 || e4) { loadFromLocal(); return; }

    if (proj?.length) setProjects(proj as Project[]);
    else setProjects(JSON.parse(localStorage.getItem('cpl_projects') || 'null') ?? mockProjects);

    if (deliv?.length) setDeliverables(deliv as Deliverable[]);
    else setDeliverables(JSON.parse(localStorage.getItem('cpl_deliverables') || 'null') ?? mockDeliverables);

    if (acts?.length) setActivities(acts as Activity[]);
    else setActivities(JSON.parse(localStorage.getItem('cpl_activities') || 'null') ?? mockActivities);

    if (notifs?.length) setNotifications(notifs as Notification[]);
    else setNotifications(JSON.parse(localStorage.getItem('cpl_notifications') || 'null') ?? mockNotifications);

    if (prof) setProfile(prof as AgencyProfile);
  };

  // Persist to localStorage when not using Supabase
  useEffect(() => { localStorage.setItem('cpl_role', currentRole); }, [currentRole]);
  useEffect(() => { if (!isSupabaseConfigured()) localStorage.setItem('cpl_projects', JSON.stringify(projects)); }, [projects]);
  useEffect(() => { if (!isSupabaseConfigured()) localStorage.setItem('cpl_deliverables', JSON.stringify(deliverables)); }, [deliverables]);
  useEffect(() => { if (!isSupabaseConfigured()) localStorage.setItem('cpl_activities', JSON.stringify(activities)); }, [activities]);
  useEffect(() => { if (!isSupabaseConfigured()) localStorage.setItem('cpl_notifications', JSON.stringify(notifications)); }, [notifications]);
  useEffect(() => { if (!isSupabaseConfigured()) localStorage.setItem('cpl_profile', JSON.stringify(profile)); }, [profile]);

  const setRole = (role: UserRole) => setRoleState(role);

  const persistProject = async (project: Project) => {
    if (isSupabaseConfigured()) await supabase.from('projects').upsert(project);
  };

  const persistDeliverable = async (deliverable: Deliverable) => {
    if (isSupabaseConfigured()) await supabase.from('deliverables').upsert(deliverable);
  };

  const persistActivity = async (activity: Activity) => {
    if (isSupabaseConfigured()) await supabase.from('activities').insert(activity);
  };

  const persistNotification = async (notification: Notification) => {
    if (isSupabaseConfigured()) await supabase.from('notifications').insert(notification);
  };

  const createProject = (data: {
    name: string; description: string; clientName: string; clientEmail: string;
    deadline: string; priority: Project['priority']; status: Project['status']; assignedTeamIds: string[];
  }) => {
    const newProject: Project = {
      id: `p_${Date.now()}`,
      name: data.name,
      description: data.description,
      clientName: data.clientName,
      clientEmail: data.clientEmail,
      deadline: data.deadline,
      priority: data.priority,
      status: data.status,
      assignedTeam: data.assignedTeamIds.map(id => ({
        id,
        name: id === 't1' ? 'Sarah Connor' : id === 't2' ? 'John Doe' : id === 't3' ? 'Alex Mercer' : 'Elena Rostova',
        role: id === 't1' ? 'UI/UX Designer' : id === 't2' ? 'Frontend Engineer' : id === 't3' ? 'Fullstack Dev' : 'Content Writer',
      })),
      milestones: [
        { id: `m_${Date.now()}_1`, title: 'Kickoff Meeting', dueDate: data.deadline, status: 'completed' },
        { id: `m_${Date.now()}_2`, title: 'Initial Deliverables', dueDate: data.deadline, status: 'pending' },
      ],
      comments: [],
      progress: 10,
      createdAt: new Date().toISOString().split('T')[0],
    };
    setProjects(prev => [newProject, ...prev]);
    persistProject(newProject);

    const activity: Activity = {
      id: `act_${Date.now()}`, type: 'project', title: 'Project Created',
      description: `Project "${data.name}" was initiated for ${data.clientName}`,
      timestamp: new Date().toISOString(), user: { name: 'Agency Manager', role: 'agency' }, projectId: newProject.id,
    };
    setActivities(prev => [activity, ...prev]);
    persistActivity(activity);

    const notif: Notification = {
      id: `not_${Date.now()}`, type: 'update', title: 'New Project Commissioned',
      description: `A new workspace has been set up for ${data.name}.`,
      timestamp: new Date().toISOString(), read: false, projectId: newProject.id,
    };
    setNotifications(prev => [notif, ...prev]);
    persistNotification(notif);
  };

  const addDeliverable = (projectId: string, fileName: string, version: string, fileSize: string) => {
    const proj = projects.find(p => p.id === projectId);
    const newDeliverable: Deliverable = {
      id: `d_${Date.now()}`, projectId,
      projectName: proj ? proj.name : 'Unknown Project',
      fileName, version, fileSize, status: 'review', approvalStatus: 'Pending', comments: [],
      uploadedBy: currentRole === 'agency' ? 'Sarah Connor' : 'Client Representative',
      uploadedAt: new Date().toISOString(),
    };
    setDeliverables(prev => [newDeliverable, ...prev]);
    persistDeliverable(newDeliverable);

    const activity: Activity = {
      id: `act_${Date.now()}`, type: 'deliverable', title: 'New Deliverable Uploaded',
      description: `${newDeliverable.uploadedBy} uploaded "${fileName}" for review.`,
      timestamp: new Date().toISOString(), user: { name: newDeliverable.uploadedBy, role: currentRole }, projectId,
    };
    setActivities(prev => [activity, ...prev]);
    persistActivity(activity);

    const notif: Notification = {
      id: `not_${Date.now()}`, type: 'update', title: 'New File for Review',
      description: `New version (${version}) of ${fileName} is waiting for review.`,
      timestamp: new Date().toISOString(), read: false, projectId,
    };
    setNotifications(prev => [notif, ...prev]);
    persistNotification(notif);
  };

  const updateDeliverableStatus = (deliverableId: string, status: Deliverable['status'], commentText?: string) => {
    let approvalText: Deliverable['approvalStatus'] = 'Pending';
    if (status === 'approved') approvalText = 'Approved';
    if (status === 'rejected') approvalText = 'Changes Requested';
    const authorName = currentRole === 'client' ? 'Client Partner' : 'Agency Reviewer';

    setDeliverables(prev => prev.map(d => {
      if (d.id !== deliverableId) return d;
      const updatedComments = [...d.comments];
      if (commentText) updatedComments.push({
        id: `c_${Date.now()}`, authorName, authorRole: currentRole, text: commentText, timestamp: new Date().toISOString(),
      });
      const updated = { ...d, status, approvalStatus: approvalText, comments: updatedComments };
      if (isSupabaseConfigured()) supabase.from('deliverables').upsert(updated);
      return updated;
    }));

    const del = deliverables.find(d => d.id === deliverableId);
    if (!del) return;

    const activity: Activity = {
      id: `act_${Date.now()}`, type: 'approval',
      title: status === 'approved' ? 'Deliverable Approved' : 'Changes Requested',
      description: `${authorName} marked "${del.fileName}" as ${approvalText}`,
      timestamp: new Date().toISOString(), user: { name: authorName, role: currentRole }, projectId: del.projectId,
    };
    setActivities(prev => [activity, ...prev]);
    persistActivity(activity);

    const notif: Notification = {
      id: `not_${Date.now()}`, type: status === 'approved' ? 'update' : 'alert',
      title: status === 'approved' ? 'Deliverable Approved' : 'Action Required',
      description: `"${del.fileName}" was marked as: ${approvalText}.`,
      timestamp: new Date().toISOString(), read: false, projectId: del.projectId,
    };
    setNotifications(prev => [notif, ...prev]);
    persistNotification(notif);
  };

  const addCommentToProject = (projectId: string, text: string) => {
    const authorName = currentRole === 'agency' ? 'Sarah Connor' : 'Client Partner';
    const newComment: Comment = {
      id: `comm_${Date.now()}`, authorName, authorRole: currentRole, text, timestamp: new Date().toISOString(),
    };
    setProjects(prev => prev.map(p => {
      if (p.id !== projectId) return p;
      const updated = { ...p, comments: [...p.comments, newComment] };
      if (isSupabaseConfigured()) supabase.from('projects').upsert(updated);
      return updated;
    }));

    const activity: Activity = {
      id: `act_${Date.now()}`, type: 'comment', title: 'New Discussion Comment',
      description: `${authorName} posted a comment in project forum.`,
      timestamp: new Date().toISOString(), user: { name: authorName, role: currentRole }, projectId,
    };
    setActivities(prev => [activity, ...prev]);
    persistActivity(activity);

    const notif: Notification = {
      id: `not_${Date.now()}`, type: 'message', title: 'New Discussion Message',
      description: `${authorName} commented: "${text.substring(0, 45)}${text.length > 45 ? '...' : ''}"`,
      timestamp: new Date().toISOString(), read: false, projectId,
    };
    setNotifications(prev => [notif, ...prev]);
    persistNotification(notif);
  };

  const addCommentToDeliverable = (deliverableId: string, text: string) => {
    const authorName = currentRole === 'agency' ? 'Sarah Connor' : 'Client Partner';
    const newComment: Comment = {
      id: `comm_${Date.now()}`, authorName, authorRole: currentRole, text, timestamp: new Date().toISOString(),
    };
    setDeliverables(prev => prev.map(d => {
      if (d.id !== deliverableId) return d;
      const updated = { ...d, comments: [...d.comments, newComment] };
      if (isSupabaseConfigured()) supabase.from('deliverables').upsert(updated);
      return updated;
    }));

    const del = deliverables.find(d => d.id === deliverableId);
    if (!del) return;
    const activity: Activity = {
      id: `act_${Date.now()}`, type: 'comment', title: 'New Deliverable Comment',
      description: `${authorName} commented on file "${del.fileName}".`,
      timestamp: new Date().toISOString(), user: { name: authorName, role: currentRole }, projectId: del.projectId,
    };
    setActivities(prev => [activity, ...prev]);
    persistActivity(activity);
  };

  const updateAgencyProfile = (newProfile: AgencyProfile) => {
    setProfile(newProfile);
    if (isSupabaseConfigured()) supabase.from('agency_profiles').upsert(newProfile);
  };

  const markNotificationsAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    if (isSupabaseConfigured()) supabase.from('notifications').update({ read: true }).eq('read', false);
  };

  const setProjectProgress = (projectId: string, progress: number) => {
    setProjects(prev => prev.map(p => {
      if (p.id !== projectId) return p;
      const updated = { ...p, progress };
      if (isSupabaseConfigured()) supabase.from('projects').upsert(updated);
      return updated;
    }));
  };

  const addMilestone = (projectId: string, title: string, dueDate: string) => {
    const newMilestone: Milestone = { id: `mile_${Date.now()}`, title, dueDate, status: 'pending' };
    setProjects(prev => prev.map(p => {
      if (p.id !== projectId) return p;
      const updated = { ...p, milestones: [...p.milestones, newMilestone] };
      if (isSupabaseConfigured()) supabase.from('projects').upsert(updated);
      return updated;
    }));
    addProjectActivity(projectId, 'project', 'New Milestone Added', `Milestone "${title}" scheduled for ${dueDate}`);
  };

  const toggleMilestoneStatus = (projectId: string, milestoneId: string) => {
    setProjects(prev => prev.map(p => {
      if (p.id !== projectId) return p;
      const updated = {
        ...p,
        milestones: p.milestones.map(m => {
          if (m.id !== milestoneId) return m;
          const nextStatus: Milestone['status'] =
            m.status === 'pending' ? 'in-progress' : m.status === 'in-progress' ? 'completed' : 'pending';
          return { ...m, status: nextStatus };
        }),
      };
      if (isSupabaseConfigured()) supabase.from('projects').upsert(updated);
      return updated;
    }));
  };

  const deleteProject = (projectId: string) => {
    setProjects(prev => prev.filter(p => p.id !== projectId));
    setDeliverables(prev => prev.filter(d => d.projectId !== projectId));
    setActivities(prev => prev.filter(a => a.projectId !== projectId));
    if (isSupabaseConfigured()) supabase.from('projects').delete().eq('id', projectId);
  };

  const addProjectActivity = (projectId: string, type: Activity['type'], title: string, description: string) => {
    const authorName = currentRole === 'agency' ? 'Sarah Connor' : 'Client Partner';
    const activity: Activity = {
      id: `act_${Date.now()}`, type, title, description,
      timestamp: new Date().toISOString(), user: { name: authorName, role: currentRole }, projectId,
    };
    setActivities(prev => [activity, ...prev]);
    persistActivity(activity);
  };

  return (
    <PortalContext.Provider value={{
      currentRole, setRole, projects, deliverables, activities, notifications, profile,
      createProject, addDeliverable, updateDeliverableStatus, addCommentToProject,
      addCommentToDeliverable, updateAgencyProfile, markNotificationsAsRead,
      setProjectProgress, addMilestone, toggleMilestoneStatus, addProjectActivity, deleteProject,
    }}>
      {children}
    </PortalContext.Provider>
  );
};
