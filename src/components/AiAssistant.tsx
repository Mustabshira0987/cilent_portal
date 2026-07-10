import React, { useState, useRef, useEffect } from 'react';
import { usePortal } from '../context/PortalContext';
import { Bot, X, Send, Loader2, Sparkles } from 'lucide-react';

interface Message {
  role: 'user' | 'assistant';
  text: string;
}

function buildReply(input: string, projects: any[], deliverables: any[], currentRole: string): string {
  const q = input.toLowerCase();

  if (q.includes('progress')) {
    if (!projects.length) return 'No projects found in your workspace.';
    return projects.map(p => `• ${p.name}: ${p.progress}% (${p.status})`).join('\n');
  }

  if (q.includes('pending') || q.includes('task')) {
    const pending = projects.flatMap(p =>
      p.milestones.filter((m: any) => m.status !== 'completed').map((m: any) => `• ${m.title} — ${p.name} (due ${m.dueDate})`)
    );
    return pending.length ? pending.join('\n') : 'No pending milestones right now.';
  }

  if (q.includes('file') || q.includes('review') || q.includes('deliverable')) {
    const review = deliverables.filter(d => d.status === 'review').map(d => `• ${d.fileName} (${d.projectName})`);
    const approved = deliverables.filter(d => d.status === 'approved').map(d => `• ${d.fileName} (${d.projectName})`);
    let reply = '';
    if (review.length) reply += `Awaiting review:\n${review.join('\n')}\n`;
    if (approved.length) reply += `\nApproved:\n${approved.join('\n')}`;
    return reply.trim() || 'No deliverables found.';
  }

  if (q.includes('deadline') || q.includes('due')) {
    if (!projects.length) return 'No projects found.';
    return projects.map(p => `• ${p.name}: due ${p.deadline}`).join('\n');
  }

  if (q.includes('project')) {
    if (!projects.length) return 'No projects in your workspace yet.';
    return projects.map(p => `• ${p.name} — ${p.status}, ${p.priority} priority`).join('\n');
  }

  if (q.includes('priority') || q.includes('urgent') || q.includes('high')) {
    const high = projects.filter(p => p.priority === 'high').map(p => `• ${p.name}`);
    return high.length ? `High priority projects:\n${high.join('\n')}` : 'No high priority projects currently.';
  }

  if (q.includes('team') || q.includes('member') || q.includes('assigned')) {
    const info = projects.map(p => `• ${p.name}: ${p.assignedTeam.map((t: any) => t.name).join(', ') || 'No team assigned'}`);
    return info.length ? info.join('\n') : 'No team data found.';
  }

  if (q.includes('summary') || q.includes('overview') || q.includes('status')) {
    const active = projects.filter(p => p.status === 'active').length;
    const completed = projects.filter(p => p.status === 'completed').length;
    const onHold = projects.filter(p => p.status === 'on-hold').length;
    const pendingFiles = deliverables.filter(d => d.status === 'review').length;
    return `Workspace Summary:\n• ${active} active, ${completed} completed, ${onHold} on-hold projects\n• ${pendingFiles} file(s) awaiting review`;
  }

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
    <div className="fixed bottom-6 right-6 z-50">
      {/* Toggle button */}
      <button
        onClick={() => setOpen(v => !v)}
        className="flex h-14 w-14 items-center justify-center rounded-full text-white shadow-2xl transition-all duration-200 hover:scale-105 btn-primary"
      >
        {open ? <X className="h-6 w-6" /> : <Bot className="h-6 w-6" />}
      </button>

      {/* Chat panel */}
      {open && (
        <div
          className="absolute bottom-16 right-0 w-80 rounded-2xl overflow-hidden flex flex-col"
          style={{
            background: 'rgba(10,15,30,0.97)',
            border: '1px solid rgba(99,102,241,0.25)',
            boxShadow: '0 24px 64px rgba(0,0,0,0.6)',
            height: '500px',
          }}
        >
          {/* Header */}
          <div className="flex items-center gap-2.5 px-4 py-3" style={{ borderBottom: '1px solid rgba(99,102,241,0.12)' }}>
            <div className="flex h-8 w-8 items-center justify-center rounded-lg btn-primary">
              <Sparkles className="h-4 w-4 text-white" />
            </div>
            <div>
              <p className="text-xs font-bold text-white">Portal Assistant</p>
              <p className="text-[10px]" style={{ color: '#475569' }}>Ask about your workspace</p>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto px-3 py-3 space-y-3">
            {messages.length === 0 && (
              <div className="flex flex-col gap-3 pt-2">
                <div className="text-center py-4">
                  <Bot className="h-8 w-8 mx-auto mb-2" style={{ color: '#334155' }} />
                  <p className="text-xs" style={{ color: '#475569' }}>Hi! Ask me anything about your workspace.</p>
                </div>
                <div className="flex flex-col gap-1.5">
                  {[
                    '📊 Show project progress',
                    '⏳ What tasks are pending?',
                    '📁 Files awaiting review',
                    '📅 Upcoming deadlines',
                    '🔥 High priority projects',
                    '👥 Team assignments',
                    '🗂️ Workspace summary',
                  ].map(suggestion => (
                    <button
                      key={suggestion}
                      onClick={() => {
                        setInput(suggestion);
                        setTimeout(() => {
                          const text = suggestion.replace(/^[^a-zA-Z]+/, '').trim();
                          setMessages(prev => [...prev, { role: 'user', text: suggestion }]);
                          setInput('');
                          setLoading(true);
                          setTimeout(() => {
                            const reply = buildReply(text, projects, deliverables, currentRole);
                            setMessages(prev => [...prev, { role: 'assistant', text: reply }]);
                            setLoading(false);
                          }, 500);
                        }, 0);
                      }}
                      className="text-left rounded-xl px-3 py-2 text-xs transition-all hover:scale-[1.01]"
                      style={{ background: 'rgba(99,102,241,0.08)', border: '1px solid rgba(99,102,241,0.18)', color: '#94A3B8' }}
                    >
                      {suggestion}
                    </button>
                  ))}
                </div>
              </div>
            )}
            {messages.map((m, i) => (
              <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div
                  className="max-w-[85%] rounded-xl px-3 py-2 text-xs whitespace-pre-wrap leading-relaxed"
                  style={m.role === 'user'
                    ? { background: 'linear-gradient(135deg,#6366F1,#3B82F6)', color: '#fff' }
                    : { background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', color: '#CBD5E1' }
                  }
                >
                  {m.text}
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex justify-start">
                <div className="rounded-xl px-3 py-2" style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}>
                  <Loader2 className="h-4 w-4 animate-spin" style={{ color: '#6366F1' }} />
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          {/* Input */}
          <div className="flex gap-2 p-3" style={{ borderTop: '1px solid rgba(99,102,241,0.1)' }}>
            <input
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask something…"
              className="flex-1 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-600 outline-none input-glow transition"
              style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}
            />
            <button
              onClick={handleSend}
              disabled={!input.trim() || loading}
              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl text-white btn-primary disabled:opacity-40 transition"
            >
              <Send className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
