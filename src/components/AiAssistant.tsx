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

  return (
    <>
      {/* Floating trigger button */}
      <button
        id="ai-assistant-btn"
        onClick={() => setOpen(true)}
        className={`fixed bottom-6 right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-blue-600 text-white shadow-xl shadow-blue-300 hover:bg-blue-700 transition-all duration-200 ${open ? 'scale-0 opacity-0' : 'scale-100 opacity-100'}`}
        title="Ask AI Assistant"
      >
        <Sparkles className="h-6 w-6" />
      </button>

      {/* Chat panel */}
      {open && (
        <div
          id="ai-assistant-panel"
          className="fixed bottom-6 right-6 z-50 flex w-[360px] max-w-[calc(100vw-2rem)] flex-col rounded-2xl border border-slate-200 bg-white shadow-2xl overflow-hidden"
          style={{ height: '520px' }}
        >
          {/* Header */}
          <div className="flex items-center justify-between bg-blue-600 px-4 py-3 text-white">
            <div className="flex items-center gap-2">
              <Bot className="h-5 w-5" />
              <div>
                <p className="text-sm font-bold leading-tight">Portal AI Assistant</p>
                <p className="text-[10px] text-blue-200">Powered by Gemini</p>
              </div>
            </div>
            <button onClick={() => setOpen(false)} className="rounded-lg p-1 hover:bg-blue-700 transition">
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-slate-50/50">
            {messages.length === 0 && (
              <div className="text-center py-8">
                <Sparkles className="h-8 w-8 text-blue-300 mx-auto mb-3" />
                <p className="text-xs font-semibold text-slate-600">Ask me anything about your projects!</p>
                <div className="mt-4 space-y-2">
                  {[
                    "What's the current progress?",
                    "Which tasks are still pending?",
                    "Are there any files awaiting review?",
                  ].map(q => (
                    <button
                      key={q}
                      onClick={() => { setInput(q); }}
                      className="block w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-left text-xs text-slate-600 hover:border-blue-300 hover:bg-blue-50 transition"
                    >
                      {q}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {messages.map((msg, i) => (
              <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 text-xs leading-relaxed ${
                  msg.role === 'user'
                    ? 'bg-blue-600 text-white rounded-br-sm'
                    : 'bg-white border border-slate-100 text-slate-700 shadow-sm rounded-bl-sm'
                }`}>
                  {msg.text}
                </div>
              </div>
            ))}

            {loading && (
              <div className="flex justify-start">
                <div className="flex items-center gap-2 rounded-2xl rounded-bl-sm bg-white border border-slate-100 px-3.5 py-2.5 shadow-sm">
                  <Loader2 className="h-3.5 w-3.5 animate-spin text-blue-500" />
                  <span className="text-xs text-slate-400">Thinking...</span>
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          {/* Input */}
          <div className="border-t border-slate-100 bg-white p-3 flex gap-2">
            <input
              type="text"
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask about projects, tasks, files..."
              className="flex-1 rounded-xl border border-slate-200 px-3 py-2 text-xs outline-none focus:border-blue-500 transition"
            />
            <button
              onClick={handleSend}
              disabled={!input.trim() || loading}
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-40 transition"
            >
              <Send className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}
    </>
  );
};
