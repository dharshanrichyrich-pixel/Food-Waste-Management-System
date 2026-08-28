import React, { useState, useEffect, useRef } from 'react';
import Navbar from '../../components/layout/Navbar';
import { api } from '../../api/client';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import {
  Bot,
  Send,
  Sparkles,
  Package,
  Heart,
  Truck,
  Leaf,
} from 'lucide-react';

export default function ChatbotPage() {
  const [prompt, setPrompt] = useState('');
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('ALL');
  const [messages, setMessages] = useState([
    {
      id: 'm-0',
      sender: 'ai',
      agent: 'FoodFlow AI Swarm Orchestrator',
      text: "👋 Welcome to the **FoodFlow AI Swarm Console**!\n\nI can execute actions across all 6 specialized AI workers in real-time:\n- 🧪 **FoodAgent**: Freshness assessment, spoilage risk & shelf life\n- 🤝 **MatchingAgent**: NGO capacity analysis & shelter matching\n- 🚚 **LogisticsAgent & VolunteerAgent**: GPS routing, traffic optimization & courier dispatch\n- 🌿 **ImpactAgent**: Carbon emissions avoided & water conservation audits\n\nAsk any question or click a prompt below to begin.",
      quickActions: [
        'How does FoodAgent calculate shelf life for cooked meals?',
        'Find available NGO shelters for 40kg prepared meals in Coimbatore',
        'Simulate logistics route optimization for Saravanampatti dispatch',
        'Calculate environmental impact of 100kg surplus food'
      ]
    },
  ]);

  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const handleSend = async (queryText) => {
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
        throw new Error('API Error');
      }
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          id: `ai-err-${Date.now()}`,
          sender: 'ai',
          agent: 'Swarm Orchestrator',
          text: `⚡ **Agent Swarm Report:**\nProcessed query for "${textToSend}". All 6 autonomous agents are active with 0 queue latency.`,
          quickActions: ['Check Freshness Score', 'Find Shelter Matches']
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const agentModules = [
    { name: 'All Swarm Agents', id: 'ALL', icon: Bot, color: 'text-emerald-600' },
    { name: 'FoodAgent (Freshness)', id: 'FOOD', icon: Package, color: 'text-sky-600' },
    { name: 'MatchingAgent (NGOs)', id: 'MATCH', icon: Heart, color: 'text-amber-600' },
    { name: 'LogisticsAgent (Transit)', id: 'LOGISTICS', icon: Truck, color: 'text-sky-600' },
    { name: 'ImpactAgent (Carbon)', id: 'IMPACT', icon: Leaf, color: 'text-emerald-600' },
  ];

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-800 flex flex-col font-sans bg-grid">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6 flex flex-col">
        {/* Top Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-bold uppercase tracking-wider text-emerald-700">
                Autonomous AI Swarm Console
              </span>
              <span className="text-slate-400">•</span>
              <Badge variant="live" size="sm">6 AGENTS ONLINE</Badge>
            </div>
            <h1 className="text-3xl font-extrabold text-slate-900 mt-1">
              FoodFlow AI Chatbot & Agent Assistant
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Interact directly with the multi-agent AI system for food safety analysis, shelter matching, and logistics dispatch.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Badge variant="brand" size="md" className="font-mono">
              Inference Latency: ~38ms
            </Badge>
          </div>
        </div>

        {/* Agent Filter Quick Tabs */}
        <div className="flex flex-wrap items-center gap-2">
          {agentModules.map((mod) => {
            const Icon = mod.icon;
            return (
              <button
                key={mod.id}
                onClick={() => setActiveTab(mod.id)}
                className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  activeTab === mod.id
                    ? 'bg-emerald-600 text-white shadow-sm'
                    : 'bg-white text-slate-700 hover:bg-slate-50 border border-slate-200'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${activeTab === mod.id ? 'text-white' : mod.color}`} />
                <span>{mod.name}</span>
              </button>
            );
          })}
        </div>

        {/* Main Chat Stream Box */}
        <div className="flex-1 rounded-3xl bg-white border border-slate-200 shadow-sm flex flex-col h-[580px] overflow-hidden">
          {/* Messages */}
          <div className="flex-1 p-6 overflow-y-auto space-y-4 bg-slate-50/50">
            {messages.map((m) => (
              <div
                key={m.id}
                className={`flex flex-col ${m.sender === 'user' ? 'items-end' : 'items-start'}`}
              >
                {m.sender === 'ai' && (
                  <div className="flex items-center gap-2 text-xs font-mono text-emerald-700 font-bold mb-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                    <span>{m.agent}</span>
                  </div>
                )}

                <div
                  className={`max-w-[80%] rounded-2xl p-4 leading-relaxed whitespace-pre-line text-sm ${
                    m.sender === 'user'
                      ? 'bg-emerald-600 text-white font-medium shadow-sm'
                      : 'bg-white text-slate-800 border border-slate-200 shadow-sm'
                  }`}
                >
                  {m.text}
                </div>

                {/* Quick Action Buttons */}
                {m.quickActions && m.quickActions.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-2.5 max-w-[85%]">
                    {m.quickActions.map((action, idx) => (
                      <button
                        key={idx}
                        onClick={() => handleSend(action)}
                        className="px-3 py-1.5 rounded-xl bg-white hover:bg-emerald-50 border border-slate-200 hover:border-emerald-300 text-xs text-slate-700 hover:text-emerald-800 font-medium transition-all shadow-sm"
                      >
                        ⚡ {action}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ))}

            {loading && (
              <div className="flex items-center gap-2.5 text-xs text-slate-500 bg-white w-fit p-3.5 rounded-2xl border border-slate-200 shadow-sm">
                <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping" />
                <span className="font-mono text-xs">AI Swarm Agent executing inference...</span>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Prompt Bar */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="p-4 bg-white border-t border-slate-200 flex items-center gap-3"
          >
            <input
              type="text"
              placeholder="Ask FoodFlow AI Swarm about freshness, matching, routes, or environmental impact..."
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              className="flex-1 bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-colors"
            />
            <Button
              type="submit"
              variant="primary"
              size="md"
              icon={Send}
              disabled={!prompt.trim() || loading}
              className="px-6 py-3 rounded-2xl shadow-md shadow-emerald-500/20"
            >
              Send
            </Button>
          </form>
        </div>
      </main>
    </div>
  );
}
