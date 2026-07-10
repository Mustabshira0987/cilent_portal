export type UserRole = 'agency' | 'client';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar?: string;
  companyName: string;
}

export interface TeamMember {
  id: string;
  name: string;
  role: string;
  avatar?: string;
}

export interface Comment {
  id: string;
  authorName: string;
  authorRole: UserRole;
  authorAvatar?: string;
  text: string;
  timestamp: string;
}

export interface Deliverable {
  id: string;
  projectId: string;
  projectName: string;
  fileName: string;
  version: string;
  fileSize: string;
  status: 'pending' | 'review' | 'approved' | 'rejected';
  approvalStatus: 'Pending' | 'Approved' | 'Changes Requested';
  comments: Comment[];
  uploadedBy: string;
  uploadedAt: string;
  downloadUrl?: string;
}

export interface Milestone {
  id: string;
  title: string;
  dueDate: string;
  status: 'completed' | 'in-progress' | 'pending';
}

export interface Project {
  id: string;
  name: string;
  description: string;
  clientName: string;
  clientEmail: string;
  deadline: string;
  priority: 'low' | 'medium' | 'high';
  status: 'active' | 'completed' | 'on-hold';
  assignedTeam: TeamMember[];
  milestones: Milestone[];
  comments: Comment[];
  progress: number; // 0 to 100
  createdAt: string;
}

export interface Activity {
  id: string;
  type: 'project' | 'deliverable' | 'comment' | 'approval' | 'system';
  title: string;
  description: string;
  timestamp: string;
  user: {
    name: string;
    role: UserRole;
  };
  projectId?: string;
}

export interface Notification {
  id: string;
  type: 'update' | 'message' | 'alert';
  title: string;
  description: string;
  timestamp: string;
  read: boolean;
  projectId?: string;
}

export interface AgencyProfile {
  name: string;
  email: string;
  companyName: string;
  website: string;
  phone: string;
  logo?: string;
}
