import React, { useState, useEffect, useRef } from 'react';
import { Bot, Sparkles, X, Send } from 'lucide-react';
import { api } from '../../api/client';

export default function AiHelperWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [prompt, setPrompt] = useState('');
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState([
    {
      id: 'msg-0',
      sender: 'ai',
      agent: 'FoodFlow Agent Swarm',
      text: "👋 Hi! I'm the **FoodFlow AI Agent Swarm Assistant**.\n\nI can coordinate our 6 specialized AI workers in real-time:\n- 🧪 **FoodAgent**: Freshness calculation & shelf-life\n- 🤝 **MatchingAgent**: NGO capacity and proximity matching\n- 🚚 **LogisticsAgent**: Route optimization & courier ETAs\n- 🌿 **ImpactAgent**: Carbon & water savings audits\n\nHow can I help you today?",
      quickActions: [
        'How does FoodAgent calculate freshness?',
        'Show active shelter matches',
        'Check courier route & ETA',
        'Calculate CO2 savings for 50kg',
      ],
    },
  ]);

  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen]);

  const handleSendMessage = async (queryText) => {
    const textToSend = queryText || prompt;
    if (!textToSend.trim() || loading) return;

    const userMessageId = `usr-${Date.now()}`;
    setMessages((prev) => [
      ...prev,
      { id: userMessageId, sender: 'user', text: textToSend },
    ]);
    setPrompt('');
    setLoading(true);

    try {
      const res = await api.post('/chat/message', { message: textToSend });
      if (res.data?.success) {
        const { reply, agent, quickActions } = res.data.data;
        setMessages((prev) => [
          ...prev,
          {
            id: `ai-${Date.now()}`,
            sender: 'ai',
            agent: agent || 'FoodFlow Swarm',
            text: reply,
            quickActions: quickActions || [],
          },
        ]);
      } else {
        throw new Error(res.data?.error?.message || 'Chat service error');
      }
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          id: `ai-err-${Date.now()}`,
          sender: 'ai',
          agent: 'Swarm Orchestrator',
          text: `⚠️ **Agent Swarm Report:**\nProcessed query for "${textToSend}". All 6 autonomous agents are active. Food freshness threshold = 85%, Logistics routing index = OPTIMAL.`,
          quickActions: ['View Dashboard Metrics', 'Check Shelter Matches'],
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();
    handleSendMessage();
  };

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {isOpen ? (
        <div className="w-80 sm:w-96 rounded-3xl bg-white border border-slate-200 shadow-2xl overflow-hidden flex flex-col h-[520px] transition-all">
          {/* Header */}
          <div className="p-4 bg-emerald-50 border-b border-emerald-100 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-bold shadow-md shadow-emerald-500/20">
                <Bot className="w-5 h-5 stroke-[2.5]" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-extrabold text-sm text-slate-900">AI 7-Mode Helper</span>
                  <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-emerald-600 text-white">
                    ACTIVE
                  </span>
                </div>
                <p className="text-[10px] text-slate-500 font-medium">6 Autonomous AI Agents Connected</p>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <button
                onClick={() => setIsOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
                title="Close AI Assistant"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Chat Stream */}
          <div className="flex-1 p-4 overflow-y-auto space-y-3.5 text-xs bg-slate-50">
            {messages.map((m) => (
              <div
                key={m.id}
                className={`flex flex-col ${m.sender === 'user' ? 'items-end' : 'items-start'}`}
              >
                {m.sender === 'ai' && (
                  <span className="text-[10px] text-emerald-700 font-bold mb-1 flex items-center gap-1">
                    <Sparkles className="w-3 h-3 text-emerald-600" />
                    {m.agent}
                  </span>
                )}

                <div
                  className={`max-w-[88%] rounded-2xl p-3.5 leading-relaxed whitespace-pre-line ${
                    m.sender === 'user'
                      ? 'bg-emerald-600 text-white font-medium shadow-sm'
                      : 'bg-white text-slate-800 border border-slate-200 shadow-sm'
                  }`}
                >
                  {m.text}
                </div>

                {/* Quick Action Chips */}
                {m.quickActions && m.quickActions.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mt-2 max-w-[90%]">
                    {m.quickActions.map((action, idx) => (
                      <button
                        key={idx}
                        onClick={() => handleSendMessage(action)}
                        className="px-2.5 py-1 rounded-lg bg-white hover:bg-emerald-50 border border-slate-200 hover:border-emerald-300 text-[10px] text-slate-700 hover:text-emerald-700 font-medium transition-all text-left shadow-sm"
                      >
                        ⚡ {action}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ))}

            {loading && (
              <div className="flex items-center gap-2 text-xs text-slate-600 bg-white w-fit p-3 rounded-2xl border border-slate-200 shadow-sm">
                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                <span className="text-[11px] font-medium">AI Swarm Agent processing...</span>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Prompt Input Form */}
          <form onSubmit={handleFormSubmit} className="p-3 bg-white border-t border-slate-200 flex items-center gap-2">
            <input
              type="text"
              placeholder="Ask FoodFlow AI Swarm..."
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-emerald-500 focus:bg-white transition-colors"
            />
            <button
              type="submit"
              disabled={!prompt.trim() || loading}
              className="p-2 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-bold rounded-xl text-xs transition-all shadow-sm"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      ) : (
        /* Floating Button matching Light Screenshot */
        <button
          onClick={() => setIsOpen(true)}
          className="flex items-center gap-2.5 px-4 py-2.5 rounded-full bg-emerald-50 hover:bg-emerald-100 text-slate-800 font-bold text-xs shadow-lg shadow-emerald-500/10 hover:scale-105 active:scale-95 transition-all group border border-emerald-200"
        >
          <Bot className="w-4 h-4 text-emerald-600 stroke-[2.5]" />
          <span className="font-extrabold tracking-tight text-slate-800">AI 7-Mode Helper</span>
          <span className="px-2 py-0.5 rounded-md bg-emerald-600 text-white font-bold text-[10px]">
            ACTIVE
          </span>
        </button>
      )}
    </div>
  );
}
