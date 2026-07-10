<<<<<<< Updated upstream
import React, { useState, useRef, useEffect } from 'react';
import { usePortal } from '../context/PortalContext';
import { Bot, X, Send, Loader2, Sparkles } from 'lucide-react';

interface Message {
  role: 'user' | 'assistant';
  text: string;
}

function buildReply(input: string, projects: any[], deliverables: any[], currentRole: string): string {
  const q = input.toLowerCase();

  // Progress
  if (q.includes('progress')) {
    if (!projects.length) return 'No projects found in your workspace.';
    return projects.map(p => `• ${p.name}: ${p.progress}% (${p.status})`).join('\n');
  }

  // Pending / tasks
  if (q.includes('pending') || q.includes('task')) {
    const pending = projects.flatMap(p =>
      p.milestones.filter((m: any) => m.status !== 'completed').map((m: any) => `• ${m.title} — ${p.name} (due ${m.dueDate})`)
    );
    return pending.length ? pending.join('\n') : 'No pending milestones right now.';
  }

  // Files / review
  if (q.includes('file') || q.includes('review') || q.includes('deliverable')) {
    const review = deliverables.filter(d => d.status === 'review').map(d => `• ${d.fileName} (${d.projectName})`);
    const approved = deliverables.filter(d => d.status === 'approved').map(d => `• ${d.fileName} (${d.projectName})`);
    let reply = '';
    if (review.length) reply += `Awaiting review:\n${review.join('\n')}\n`;
    if (approved.length) reply += `\nApproved:\n${approved.join('\n')}`;
    return reply.trim() || 'No deliverables found.';
  }

  // Deadline
  if (q.includes('deadline') || q.includes('due')) {
    if (!projects.length) return 'No projects found.';
    return projects.map(p => `• ${p.name}: due ${p.deadline}`).join('\n');
  }

  // Projects list
  if (q.includes('project')) {
    if (!projects.length) return 'No projects in your workspace yet.';
    return projects.map(p => `• ${p.name} — ${p.status}, ${p.priority} priority`).join('\n');
  }

  // Priority
  if (q.includes('priority') || q.includes('urgent') || q.includes('high')) {
    const high = projects.filter(p => p.priority === 'high').map(p => `• ${p.name}`);
    return high.length ? `High priority projects:\n${high.join('\n')}` : 'No high priority projects currently.';
  }

  // Team
  if (q.includes('team') || q.includes('member') || q.includes('assigned')) {
    const info = projects.map(p => `• ${p.name}: ${p.assignedTeam.map((t: any) => t.name).join(', ') || 'No team assigned'}`);
    return info.length ? info.join('\n') : 'No team data found.';
  }

  // Summary / overview
  if (q.includes('summary') || q.includes('overview') || q.includes('status')) {
    const active = projects.filter(p => p.status === 'active').length;
    const completed = projects.filter(p => p.status === 'completed').length;
    const onHold = projects.filter(p => p.status === 'on-hold').length;
    const pendingFiles = deliverables.filter(d => d.status === 'review').length;
    return `Workspace Summary:\n• ${active} active, ${completed} completed, ${onHold} on-hold projects\n• ${pendingFiles} file(s) awaiting review`;
  }

  // Help
  if (q.includes('help') || q.includes('what can')) {
    return 'I can help you with:\n• Project progress & status\n• Pending tasks & milestones\n• Files awaiting review\n• Deadlines\n• Team assignments\n• High priority projects\n\nJust ask!';
  }

  return `I'm not sure about that. Try asking about:\n• progress, deadlines, pending tasks\n• files, deliverables, team, priority`;
}

export const AiAssistant: React.FC = () => {
  const { projects, deliverables, currentRole } = usePortal();
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const handleSend = async () => {
    const text = input.trim();
    if (!text || loading) return;
    setMessages(prev => [...prev, { role: 'user', text }]);
    setInput('');
    setLoading(true);
    setTimeout(() => {
      const reply = buildReply(text, projects, deliverables, currentRole);
      setMessages(prev => [...prev, { role: 'assistant', text: reply }]);
      setLoading(false);
    }, 500);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); }
  };

=======
import React from "react";

export const AiAssistant: React.FC = () => {
>>>>>>> Stashed changes
  return (
    <div className="fixed bottom-6 right-6 z-50">
      <button
        className="flex h-14 w-14 items-center justify-center rounded-full bg-blue-600 text-white shadow-xl hover:bg-blue-700"
        onClick={() =>
          alert("AI Assistant is disabled. Configure a Gemini API key to enable it.")
        }
      >
        AI
      </button>
    </div>
  );
};