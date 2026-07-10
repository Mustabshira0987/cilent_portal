import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { Task, TaskNotification, TaskStatus } from '../types';

interface LocalAccount { id: string; email: string; fullName: string; companyName: string; role: 'agency' | 'client'; }

interface TaskContextType {
  tasks: Task[];
  taskNotifications: TaskNotification[];
  getClientList: () => LocalAccount[];
  assignTask: (data: Omit<Task, 'id' | 'createdAt' | 'updatedAt' | 'status'>) => void;
  acceptTask: (taskId: string) => void;
  rejectTask: (taskId: string, reason: string) => void;
  updateTaskStatus: (taskId: string, status: TaskStatus) => void;
  getTasksForClient: (clientId: string) => Task[];
  getTasksForAgency: () => Task[];
  markTaskNotificationsRead: (userId: string) => void;
  unreadCountForUser: (userId: string) => number;
  deleteTask: (taskId: string) => void;
}

const TaskContext = createContext<TaskContextType | undefined>(undefined);

const TASKS_KEY = 'cpl_tasks';
const TASK_NOTIFS_KEY = 'cpl_task_notifications';

const seedTasks = (): Task[] => {
  const accounts: LocalAccount[] = JSON.parse(localStorage.getItem('cpl_accounts') || '[]');
  const clients = accounts.filter(a => a.role === 'client');
  const agency = accounts.find(a => a.role === 'agency');
  if (!clients.length || !agency) return [];

  const now = new Date();
  return clients.slice(0, 2).flatMap((client, ci) => [
    {
      id: `seed_task_${ci}_1`,
      clientId: client.id,
      clientEmail: client.email,
      clientUsername: client.fullName,
      assignedBy: agency.fullName,
      assignedByEmail: agency.email,
      title: ci === 0 ? 'Brand Identity Review' : 'Homepage Wireframe Approval',
      description: ci === 0
        ? 'Review the updated brand guidelines document and provide feedback on color palette, typography, and logo usage.'
        : 'Examine the homepage wireframe mockups and confirm the layout structure before development begins.',
      priority: ci === 0 ? 'High' : 'Medium',
      dueDate: new Date(now.getTime() + (ci + 1) * 7 * 86400000).toISOString().split('T')[0],
      category: ci === 0 ? 'Design Review' : 'UX Approval',
      attachments: [],
      status: 'Pending Acceptance',
      createdAt: new Date(now.getTime() - 86400000).toISOString(),
      updatedAt: new Date(now.getTime() - 86400000).toISOString(),
    } as Task,
    {
      id: `seed_task_${ci}_2`,
      clientId: client.id,
      clientEmail: client.email,
      clientUsername: client.fullName,
      assignedBy: agency.fullName,
      assignedByEmail: agency.email,
      title: 'Content Copy Submission',
      description: 'Submit the final copy for the About Us and Services pages. Ensure all text is proofread and approved.',
      priority: 'Low',
      dueDate: new Date(now.getTime() + (ci + 2) * 7 * 86400000).toISOString().split('T')[0],
      category: 'Content',
      attachments: [],
      status: 'Accepted',
      createdAt: new Date(now.getTime() - 2 * 86400000).toISOString(),
      updatedAt: new Date(now.getTime() - 86400000).toISOString(),
      acceptedAt: new Date(now.getTime() - 86400000).toISOString(),
    } as Task,
  ]);
};

export const TaskProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [tasks, setTasks] = useState<Task[]>(() => {
    const stored = localStorage.getItem(TASKS_KEY);
    if (stored) return JSON.parse(stored);
    const seeded = seedTasks();
    if (seeded.length) localStorage.setItem(TASKS_KEY, JSON.stringify(seeded));
    return seeded;
  });

  const [taskNotifications, setTaskNotifications] = useState<TaskNotification[]>(() =>
    JSON.parse(localStorage.getItem(TASK_NOTIFS_KEY) || '[]')
  );

  useEffect(() => { localStorage.setItem(TASKS_KEY, JSON.stringify(tasks)); }, [tasks]);
  useEffect(() => { localStorage.setItem(TASK_NOTIFS_KEY, JSON.stringify(taskNotifications)); }, [taskNotifications]);

  const addNotif = useCallback((notif: Omit<TaskNotification, 'id' | 'createdAt' | 'read'>) => {
    const n: TaskNotification = { ...notif, id: `tn_${Date.now()}_${Math.random()}`, read: false, createdAt: new Date().toISOString() };
    setTaskNotifications(prev => [n, ...prev]);
  }, []);

  const getClientList = useCallback((): LocalAccount[] => {
    const accounts: LocalAccount[] = JSON.parse(localStorage.getItem('cpl_accounts') || '[]');
    return accounts.filter(a => a.role === 'client');
  }, []);

  const assignTask = useCallback((data: Omit<Task, 'id' | 'createdAt' | 'updatedAt' | 'status'>) => {
    const now = new Date().toISOString();
    const task: Task = { ...data, id: `task_${Date.now()}`, status: 'Pending Acceptance', createdAt: now, updatedAt: now };
    setTasks(prev => [task, ...prev]);
    addNotif({ taskId: task.id, taskTitle: task.title, type: 'assigned', message: `New task "${task.title}" assigned to ${task.clientUsername}`, forRole: 'agency', forUserId: task.assignedByEmail });
    addNotif({ taskId: task.id, taskTitle: task.title, type: 'assigned', message: `You have been assigned a new task: "${task.title}"`, forRole: 'client', forUserId: task.clientId });
  }, [addNotif]);

  const acceptTask = useCallback((taskId: string) => {
    const now = new Date().toISOString();
    setTasks(prev => prev.map(t => t.id === taskId ? { ...t, status: 'Accepted', acceptedAt: now, updatedAt: now } : t));
    const task = tasks.find(t => t.id === taskId);
    if (task) {
      addNotif({ taskId, taskTitle: task.title, type: 'accepted', message: `${task.clientUsername} accepted task "${task.title}"`, forRole: 'agency', forUserId: task.assignedByEmail });
    }
  }, [tasks, addNotif]);

  const rejectTask = useCallback((taskId: string, reason: string) => {
    const now = new Date().toISOString();
    setTasks(prev => prev.map(t => t.id === taskId ? { ...t, status: 'Rejected', rejectionReason: reason, rejectedAt: now, updatedAt: now } : t));
    const task = tasks.find(t => t.id === taskId);
    if (task) {
      addNotif({ taskId, taskTitle: task.title, type: 'rejected', message: `${task.clientUsername} rejected task "${task.title}": ${reason}`, forRole: 'agency', forUserId: task.assignedByEmail });
    }
  }, [tasks, addNotif]);

  const updateTaskStatus = useCallback((taskId: string, status: TaskStatus) => {
    setTasks(prev => prev.map(t => t.id === taskId ? { ...t, status, updatedAt: new Date().toISOString() } : t));
    const task = tasks.find(t => t.id === taskId);
    if (task) {
      addNotif({ taskId, taskTitle: task.title, type: 'updated', message: `Task "${task.title}" status updated to ${status}`, forRole: 'client', forUserId: task.clientId });
    }
  }, [tasks, addNotif]);

  const getTasksForClient = useCallback((clientId: string) =>
    tasks.filter(t => t.clientId === clientId), [tasks]);

  const getTasksForAgency = useCallback(() => tasks, [tasks]);

  const markTaskNotificationsRead = useCallback((userId: string) => {
    setTaskNotifications(prev => prev.map(n => n.forUserId === userId ? { ...n, read: true } : n));
  }, []);

  const unreadCountForUser = useCallback((userId: string) =>
    taskNotifications.filter(n => n.forUserId === userId && !n.read).length, [taskNotifications]);

  const deleteTask = useCallback((taskId: string) => {
    setTasks(prev => prev.filter(t => t.id !== taskId));
  }, []);

  return (
    <TaskContext.Provider value={{
      tasks, taskNotifications, getClientList, assignTask, acceptTask, rejectTask,
      updateTaskStatus, getTasksForClient, getTasksForAgency, markTaskNotificationsRead,
      unreadCountForUser, deleteTask,
    }}>
      {children}
    </TaskContext.Provider>
  );
};

export const useTask = () => {
  const ctx = useContext(TaskContext);
  if (!ctx) throw new Error('useTask must be used within TaskProvider');
  return ctx;
};
