import React, { useState, useRef, useEffect } from 'react';
import { GoogleGenAI } from '@google/genai';
import { usePortal } from '../context/PortalContext';
import { Bot, X, Send, Loader2, Sparkles } from 'lucide-react';

interface Message {
  role: 'user' | 'assistant';
  text: string;
}

const ai = new GoogleGenAI({ apiKey: import.meta.env.VITE_GEMINI_API_KEY });

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

  const buildContext = () => {
    const projectSummaries = projects.map(p => {
      const files = deliverables.filter(d => d.projectId === p.id);
      const pendingFiles = files.filter(d => d.status === 'review').map(d => d.fileName);
      const approvedFiles = files.filter(d => d.status === 'approved').map(d => d.fileName);
      const pendingMilestones = p.milestones.filter(m => m.status !== 'completed').map(m => `${m.title} (due ${m.dueDate})`);
      const completedMilestones = p.milestones.filter(m => m.status === 'completed').map(m => m.title);
      return `
Project: "${p.name}"
  Client: ${p.clientName}
  Status: ${p.status} | Priority: ${p.priority} | Progress: ${p.progress}%
  Deadline: ${p.deadline}
  Description: ${p.description}
  Completed milestones: ${completedMilestones.join(', ') || 'none'}
  Pending milestones: ${pendingMilestones.join(', ') || 'none'}
  Approved files: ${approvedFiles.join(', ') || 'none'}
  Files awaiting review: ${pendingFiles.join(', ') || 'none'}`;
    }).join('\n');

    return `You are a helpful project assistant for Client Portal Lite. You help ${currentRole === 'agency' ? 'agency staff' : 'clients'} get quick answers about their projects. Be concise and friendly. Here is the current workspace data:\n${projectSummaries}\n\nAnswer questions based only on this data. If something is not in the data, say so politely.`;
  };

  const handleSend = async () => {
    const text = input.trim();
    if (!text || loading) return;

    const userMsg: Message = { role: 'user', text };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const systemInstruction = buildContext();
      const history = messages.map(m => ({
        role: m.role === 'user' ? 'user' as const : 'model' as const,
        parts: [{ text: m.text }],
      }));

      const chat = ai.chats.create({
        model: 'gemini-2.0-flash',
        config: { systemInstruction },
        history,
      });

      const response = await chat.sendMessage({ message: text });
      setMessages(prev => [...prev, { role: 'assistant', text: response.text ?? 'No response.' }]);
    } catch {
      setMessages(prev => [...prev, { role: 'assistant', text: 'Sorry, I could not reach the AI service. Please check your API key.' }]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
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
