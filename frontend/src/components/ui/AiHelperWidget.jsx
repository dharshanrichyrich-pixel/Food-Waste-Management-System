import React, { useState, useEffect, useRef } from 'react';
import { Bot, Sparkles, X, Send, MapPin, Compass } from 'lucide-react';
import apiClient from '../../api/client';
import { Badge } from './Badge';

export default function AiHelperWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [prompt, setPrompt] = useState('');
  const [loading, setLoading] = useState(false);
  const [userLocation, setUserLocation] = useState(null);
  const [manualCity, setManualCity] = useState('');
  const [messages, setMessages] = useState([
    {
      id: 'msg-0',
      sender: 'ai',
      agent: 'FoodFlow Assistant',
      text: "👋 Hi! I'm the **FoodFlow AI Operations Assistant**.\n\nI can answer questions using real platform records, find nearby food donors, locate verified shelters, track active dispatches, or provide food safety and shelf-life guidance.\n\nHow can I help you today?",
      quickActions: [
        'Find restaurants near me',
        'Show available food donations',
        'Find verified NGO shelters',
        'How much food have we saved?',
        'What is the shelf life of cooked meals?',
      ],
    },
  ]);

  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen]);

  // Request browser geolocation on demand
  const requestLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setUserLocation({
            latitude: pos.coords.latitude,
            longitude: pos.coords.longitude,
          });
        },
        (err) => {
          console.warn('[AiHelperWidget] Geolocation note:', err.message);
        },
        { timeout: 7000 }
      );
    }
  };

  const handleSendMessage = async (queryText) => {
    const textToSend = (queryText || prompt).trim();
    if (!textToSend || loading) return;

    if (textToSend.toLowerCase().includes('near me') && !userLocation) {
      requestLocation();
    }

    const userMessageId = `usr-${Date.now()}`;
    setMessages((prev) => [
      ...prev,
      { id: userMessageId, sender: 'user', text: textToSend },
    ]);
    setPrompt('');
    setLoading(true);

    try {
      const context = {
        latitude: userLocation?.latitude,
        longitude: userLocation?.longitude,
        locationName: manualCity || undefined,
      };

      const res = await apiClient.post('/chat/message', {
        message: textToSend,
        context,
      });

      if (res.data?.success) {
        const { reply, agent, quickActions } = res.data.data;
        setMessages((prev) => [
          ...prev,
          {
            id: `ai-${Date.now()}`,
            sender: 'ai',
            agent: agent || 'FoodFlow Assistant',
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
          agent: 'FoodFlow System',
          text: `⚠️ **Service Notice:** Unable to reach the FoodFlow assistant endpoint. Please ensure the backend server is running.`,
          quickActions: ['Show available food donations', 'Find verified NGO shelters'],
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
        <div className="w-[340px] sm:w-[390px] rounded-2xl bg-white border border-[#E5E2DC] shadow-elevated overflow-hidden flex flex-col h-[520px] transition-all">
          {/* Header */}
          <div className="p-3.5 bg-[#FAF8F5] border-b border-[#E5E2DC] flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-[#1b4332] text-white flex items-center justify-center font-bold shadow-sm">
                <Bot className="w-4 h-4 stroke-[2.2]" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="font-bold text-xs text-slate-900">FoodFlow Assistant</span>
                  <span className="w-1.5 h-1.5 rounded-full bg-[#1b4332] animate-pulse" />
                </div>
                <p className="text-[10px] text-slate-500">Live Rescue & Telemetry Data</p>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <button
                onClick={() => setIsOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
                title="Close Assistant"
                aria-label="Close Assistant"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Chat Stream */}
          <div className="flex-1 p-3.5 overflow-y-auto space-y-3 text-xs bg-[#FAF8F5]/50">
            {messages.map((m) => (
              <div
                key={m.id}
                className={`flex flex-col ${m.sender === 'user' ? 'items-end' : 'items-start'}`}
              >
                {m.sender === 'ai' && (
                  <span className="text-[10px] text-[#1b4332] font-semibold mb-1 flex items-center gap-1">
                    <Sparkles className="w-3 h-3 text-[#1b4332]" />
                    {m.agent}
                  </span>
                )}

                <div
                  className={`max-w-[88%] rounded-xl p-3 leading-relaxed whitespace-pre-line text-xs ${
                    m.sender === 'user'
                      ? 'bg-[#1b4332] text-white font-medium shadow-sm'
                      : 'bg-white text-slate-800 border border-[#E5E2DC] shadow-subtle'
                  }`}
                >
                  {m.text}
                </div>

                {/* Quick Action Chips */}
                {m.quickActions && m.quickActions.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mt-2 max-w-[92%]">
                    {m.quickActions.map((action, idx) => (
                      <button
                        key={idx}
                        onClick={() => handleSendMessage(action)}
                        className="px-2.5 py-1 rounded-lg bg-white hover:bg-[#F4EFE6] border border-[#E5E2DC] hover:border-[#1b4332]/40 text-[10px] text-slate-700 hover:text-[#1b4332] font-medium transition-all text-left shadow-subtle"
                      >
                        ⚡ {action}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ))}

            {loading && (
              <div className="flex items-center gap-2 text-xs text-slate-600 bg-white w-fit p-2.5 rounded-xl border border-[#E5E2DC] shadow-subtle">
                <div className="w-2 h-2 rounded-full bg-[#1b4332] animate-ping" />
                <span className="text-[11px] font-medium">Fetching real platform data...</span>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Prompt Input Form */}
          <form onSubmit={handleFormSubmit} className="p-2.5 bg-white border-t border-[#E5E2DC] flex items-center gap-2">
            <input
              type="text"
              placeholder="Ask FoodFlow Assistant..."
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              className="flex-1 bg-[#FAF8F5] border border-[#E5E2DC] rounded-xl px-3 py-2 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-[#1b4332] focus:bg-white transition-colors"
            />
            <button
              type="submit"
              disabled={!prompt.trim() || loading}
              className="p-2 bg-[#1b4332] hover:bg-[#143527] disabled:opacity-50 text-white font-bold rounded-xl text-xs transition-all shadow-sm"
              aria-label="Send query"
            >
              <Send className="w-3.5 h-3.5" />
            </button>
          </form>
        </div>
      ) : (
        /* Floating Button matching Forest & Ivory styling */
        <button
          onClick={() => setIsOpen(true)}
          className="flex items-center gap-2 px-3.5 py-2 rounded-full bg-white hover:bg-[#FAF8F5] text-slate-800 font-semibold text-xs shadow-elevated border border-[#E5E2DC] transition-all group focus:outline-none focus-visible:ring-2 focus-visible:ring-[#1b4332]"
        >
          <div className="w-6 h-6 rounded-lg bg-[#1b4332] text-white flex items-center justify-center">
            <Bot className="w-3.5 h-3.5" />
          </div>
          <span className="tracking-tight text-slate-900">FoodFlow Assistant</span>
          <span className="w-2 h-2 rounded-full bg-[#1b4332] animate-pulse" />
        </button>
      )}
    </div>
  );
}
