import { Project, Deliverable, Activity, Notification, AgencyProfile, TeamMember } from '../types';

export const mockTeamMembers: TeamMember[] = [
  { id: 't1', name: 'Sarah Connor', role: 'UI/UX Designer', avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=100&h=100&q=80' },
  { id: 't2', name: 'John Doe', role: 'Frontend Engineer', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=100&h=100&q=80' },
  { id: 't3', name: 'Alex Mercer', role: 'Fullstack Dev', avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=100&h=100&q=80' },
  { id: 't4', name: 'Elena Rostova', role: 'Content Writer', avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=100&h=100&q=80' },
];

export const mockProjects: Project[] = [
  {
    id: 'p1',
    name: 'Acme SaaS Web App redesign',
    description: 'Complete overhaul of the Acme user dashboard and landing page for their core SaaS product. Focusing on modern design trends, faster page speeds, and fully accessible React components.',
    clientName: 'Acme Corp',
    clientEmail: 'client@acme.com',
    deadline: '2026-08-15',
    priority: 'high',
    status: 'active',
    assignedTeam: [mockTeamMembers[0], mockTeamMembers[1]],
    milestones: [
      { id: 'm1_1', title: 'Wireframing & UX Flow Approval', dueDate: '2026-07-20', status: 'completed' },
      { id: 'm1_2', title: 'High-Fidelity UI Design Deliverables', dueDate: '2026-07-30', status: 'in-progress' },
      { id: 'm1_3', title: 'Frontend React Development', dueDate: '2026-08-10', status: 'pending' },
    ],
    comments: [
      {
        id: 'c1',
        authorName: 'Sarah Connor',
        authorRole: 'agency',
        text: "I have uploaded the initial wireframes in the deliverables tab. Please let me know your thoughts!",
        timestamp: '2026-07-08T10:00:00Z',
      },
      {
        id: 'c2',
        authorName: 'Robert Vance',
        authorRole: 'client',
        text: 'The layouts look incredibly clean! I especially love the dashboard overview concept. Approved to proceed to high-fidelity mockups.',
        timestamp: '2026-07-08T14:30:00Z',
      },
    ],
    progress: 45,
    createdAt: '2026-07-01',
  },
  {
    id: 'p2',
    name: 'Stellar Branding & Style Guide',
    description: 'Developing a comprehensive brand visual language, color palette, typographic system, logo design, and detailed guideline documentation for Stellar Tech.',
    clientName: 'Stellar Tech',
    clientEmail: 'hello@stellar.co',
    deadline: '2026-09-01',
    priority: 'medium',
    status: 'active',
    assignedTeam: [mockTeamMembers[0], mockTeamMembers[3]],
    milestones: [
      { id: 'm2_1', title: 'Logo Concepts Draft', dueDate: '2026-07-25', status: 'in-progress' },
      { id: 'm2_2', title: 'Brand Book & Typography Style Guide', dueDate: '2026-08-15', status: 'pending' },
    ],
    comments: [],
    progress: 20,
    createdAt: '2026-07-05',
  },
  {
    id: 'p3',
    name: 'Quantum Mobile App MVP',
    description: 'An elegant react native workspace mockup and responsive web application landing page for Quantum Systems. Fully integrated with their custom API wrappers.',
    clientName: 'Quantum Systems',
    clientEmail: 'contact@quantumsys.io',
    deadline: '2026-07-15',
    priority: 'high',
    status: 'completed',
    assignedTeam: [mockTeamMembers[1], mockTeamMembers[2]],
    milestones: [
      { id: 'm3_1', title: 'MVP Scoping Document', dueDate: '2026-06-15', status: 'completed' },
      { id: 'm3_2', title: 'Landing Page Interactive Prototype', dueDate: '2026-06-30', status: 'completed' },
      { id: 'm3_3', title: 'Final Hand-off & Sign-off', dueDate: '2026-07-08', status: 'completed' },
    ],
    comments: [
      {
        id: 'c3',
        authorName: 'Alex Mercer',
        authorRole: 'agency',
        text: 'We have finalized the deployments and handed over all documentation. Thank you for the wonderful partnership!',
        timestamp: '2026-07-08T09:15:00Z',
      },
    ],
    progress: 100,
    createdAt: '2026-06-10',
  }
];

export const mockDeliverables: Deliverable[] = [
  {
    id: 'd1',
    projectId: 'p1',
    projectName: 'Acme SaaS Web App redesign',
    fileName: 'acme_dashboard_wireframes_v1.pdf',
    version: 'v1.0',
    fileSize: '4.2 MB',
    status: 'approved',
    approvalStatus: 'Approved',
    comments: [
      {
        id: 'dc1',
        authorName: 'Robert Vance',
        authorRole: 'client',
        text: 'Verified and approved. Exactly what we wanted.',
        timestamp: '2026-07-08T14:30:00Z'
      }
    ],
    uploadedBy: 'Sarah Connor',
    uploadedAt: '2026-07-07T10:30:00Z',
  },
  {
    id: 'd2',
    projectId: 'p1',
    projectName: 'Acme SaaS Web App redesign',
    fileName: 'acme_design_system_v1.figma_link',
    version: 'v1.2',
    fileSize: 'Link',
    status: 'review',
    approvalStatus: 'Pending',
    comments: [],
    uploadedBy: 'Sarah Connor',
    uploadedAt: '2026-07-09T08:00:00Z',
  },
  {
    id: 'd3',
    projectId: 'p2',
    projectName: 'Stellar Branding & Style Guide',
    fileName: 'stellar_logo_drafts_v1.png',
    version: 'v1.0',
    fileSize: '8.5 MB',
    status: 'review',
    approvalStatus: 'Pending',
    comments: [
      {
        id: 'dc2',
        authorName: 'Stellar Team',
        authorRole: 'client',
        text: 'Could we explore some options with darker blues? The current gradient is nice but we want more trust factor.',
        timestamp: '2026-07-08T16:00:00Z'
      }
    ],
    uploadedBy: 'Sarah Connor',
    uploadedAt: '2026-07-07T15:20:00Z',
  }
];

export const mockActivities: Activity[] = [
  {
    id: 'a1',
    type: 'deliverable',
    title: 'New Deliverable Uploaded',
    description: 'Sarah Connor uploaded acme_design_system_v1.figma_link for Acme SaaS Web App redesign',
    timestamp: '2026-07-09T08:00:00Z',
    user: { name: 'Sarah Connor', role: 'agency' },
    projectId: 'p1',
  },
  {
    id: 'a2',
    type: 'approval',
    title: 'Deliverable Approved',
    description: 'Robert Vance approved acme_dashboard_wireframes_v1.pdf',
    timestamp: '2026-07-08T14:30:00Z',
    user: { name: 'Robert Vance', role: 'client' },
    projectId: 'p1',
  },
  {
    id: 'a3',
    type: 'comment',
    title: 'New Comment on Project',
    description: 'Stellar Team requested changes on stellar_logo_drafts_v1.png',
    timestamp: '2026-07-08T16:00:00Z',
    user: { name: 'Stellar Team', role: 'client' },
    projectId: 'p2',
  },
  {
    id: 'a4',
    type: 'project',
    title: 'Project Completed',
    description: 'Quantum Mobile App MVP has been set to Completed',
    timestamp: '2026-07-08T09:15:00Z',
    user: { name: 'Alex Mercer', role: 'agency' },
    projectId: 'p3',
  }
];

export const mockNotifications: Notification[] = [
  {
    id: 'n1',
    type: 'update',
    title: 'Deliverable Approved',
    description: 'Robert Vance approved "acme_dashboard_wireframes_v1.pdf" for Acme SaaS Web App redesign.',
    timestamp: '2026-07-08T14:30:00Z',
    read: false,
    projectId: 'p1',
  },
  {
    id: 'n2',
    type: 'message',
    title: 'New Client Message',
    description: 'Stellar Team commented on stellar_logo_drafts_v1.png: "Could we explore some options with darker blues?"',
    timestamp: '2026-07-08T16:00:00Z',
    read: false,
    projectId: 'p2',
  },
  {
    id: 'n3',
    type: 'alert',
    title: 'Upcoming Deadline Alert',
    description: 'Project "Quantum Mobile App MVP" final hand-off deadline was reached.',
    timestamp: '2026-07-08T09:00:00Z',
    read: true,
    projectId: 'p3',
  }
];

export const mockAgencyProfile: AgencyProfile = {
  name: 'Vortex Creative Agency',
  email: 'contact@vortexagency.com',
  companyName: 'Vortex Digital LLC',
  website: 'https://vortexagency.com',
  phone: '+1 (555) 019-2834',
  logo: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=150&h=150&q=80',
};
