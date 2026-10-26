import React, { useState, useEffect, useRef } from 'react';
import Navbar from '../../components/layout/Navbar';
import apiClient from '../../api/client';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import {
  Send,
  Sparkles,
  Package,
  Heart,
  Truck,
  Leaf,
  MapPin,
  Bot,
  AlertCircle,
  ShieldCheck,
  Compass,
} from 'lucide-react';

export default function ChatbotPage() {
  const [prompt, setPrompt] = useState('');
  const [loading, setLoading] = useState(false);
  const [activeCategory, setActiveCategory] = useState('ALL');
  const [userLocation, setUserLocation] = useState(null);
  const [locationStatus, setLocationStatus] = useState('idle'); // 'idle' | 'requesting' | 'granted' | 'denied'
  const [manualCity, setManualCity] = useState('');
  const [messages, setMessages] = useState([
    {
      id: 'm-0',
      sender: 'ai',
      agent: 'FoodFlow Assistant',
      text: "👋 Welcome to the **FoodFlow AI Operations Assistant**!\n\nI can answer questions using genuine platform records, find nearby food facilities, check shelter availability, track deliveries, and provide food safety guidance.\n\nWhat would you like to explore today?",
      quickActions: [
        'Find restaurants near me',
        'Show available food donations',
        'Find verified NGO shelters',
        'How much food have we saved?',
        'What is the shelf life of cooked pasta?',
      ],
    },
  ]);

  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  // Request browser location if appropriate
  const requestLocation = () => {
    if (!navigator.geolocation) {
      setLocationStatus('denied');
      return;
    }
    setLocationStatus('requesting');
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setUserLocation({
          latitude: pos.coords.latitude,
          longitude: pos.coords.longitude,
        });
        setLocationStatus('granted');
      },
      (err) => {
        console.warn('[ChatbotPage] Geolocation note:', err.message);
        setLocationStatus('denied');
      },
      { timeout: 8000 }
    );
  };

  const handleSend = async (queryText) => {
    const textToSend = (queryText || prompt).trim();
    if (!textToSend || loading) return;

    // If query asks for nearby restaurants and location not yet requested, trigger location check
    const isNearbyQuery = textToSend.toLowerCase().includes('near me') || textToSend.toLowerCase().includes('restaurant');
    let currentCoords = userLocation;

    if (isNearbyQuery && !userLocation && locationStatus === 'idle') {
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
        latitude: currentCoords?.latitude,
        longitude: currentCoords?.longitude,
        locationName: manualCity || undefined,
      };

      const res = await apiClient.post('/chat/message', {
        message: textToSend,
        context,
      });

      if (res.data?.success) {
        const { reply, agent, quickActions, intent, data } = res.data.data;
        setMessages((prev) => [
          ...prev,
          {
            id: `ai-${Date.now()}`,
            sender: 'ai',
            agent: agent || 'FoodFlow Assistant',
            text: reply,
            quickActions: quickActions || [],
            intent,
            data,
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
          text: `⚠️ **Service Notice:** Unable to reach the FoodFlow assistant server. Please check your network connection or verify that the backend API is active.`,
          quickActions: ['Show available food donations', 'Find verified NGO shelters'],
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const categoryFilters = [
    { name: 'All Topics', id: 'ALL', icon: Bot, query: '' },
    { name: 'Nearby Places', id: 'PLACES', icon: MapPin, query: 'Find restaurants near me' },
    { name: 'Available Food', id: 'FOOD', icon: Package, query: 'Show available food donations' },
    { name: 'Shelters & NGOs', id: 'NGO', icon: Heart, query: 'Find verified NGO shelters' },
    { name: 'Deliveries', id: 'DELIVERY', icon: Truck, query: 'Track my delivery' },
    { name: 'Impact & CO2', id: 'IMPACT', icon: Leaf, query: 'How much food have we saved?' },
  ];

  return (
    <div className="min-h-screen bg-[#FAF8F5] text-slate-800 flex flex-col font-sans bg-warm-grid">
      <Navbar />

      <main className="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 py-8 space-y-6 flex flex-col">
        {/* Header Banner */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#E5E2DC] pb-5">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-bold uppercase tracking-wider text-[#1b4332]">
                FoodFlow AI Operations
              </span>
              <span className="text-slate-300">•</span>
              <Badge variant="forest" size="sm" dot>
                SYSTEM READY
              </Badge>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-1">
              FoodFlow AI Assistant
            </h1>
            <p className="text-xs text-slate-600 mt-0.5">
              Ask about surplus donations, search nearby verified food facilities, locate NGO shelters, and review food safety guidelines.
            </p>
          </div>

          {/* Location status pill */}
          <div className="flex items-center gap-2">
            {locationStatus === 'granted' ? (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#f0f7f3] border border-[#b9ddc8] text-[#1b4332] text-xs font-semibold">
                <Compass className="w-3.5 h-3.5 text-[#1b4332]" /> GPS Active
              </span>
            ) : locationStatus === 'denied' ? (
              <div className="flex items-center gap-1.5">
                <input
                  type="text"
                  placeholder="Enter city (e.g. Coimbatore)"
                  value={manualCity}
                  onChange={(e) => setManualCity(e.target.value)}
                  className="px-2.5 py-1 text-xs rounded-lg border border-[#E5E2DC] bg-white text-slate-800 placeholder-slate-400 focus:outline-none focus:border-[#1b4332]"
                />
              </div>
            ) : (
              <button
                onClick={requestLocation}
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white hover:bg-slate-50 border border-[#E5E2DC] text-slate-700 text-xs font-medium transition-colors shadow-sm"
              >
                <Compass className="w-3.5 h-3.5 text-slate-500" /> Enable GPS for Nearby Search
              </button>
            )}
          </div>
        </div>

        {/* Quick Topic Chips */}
        <div className="flex flex-wrap items-center gap-2">
          {categoryFilters.map((cat) => {
            const Icon = cat.icon;
            return (
              <button
                key={cat.id}
                onClick={() => {
                  setActiveCategory(cat.id);
                  if (cat.query) handleSend(cat.query);
                }}
                className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-medium transition-all ${
                  activeCategory === cat.id
                    ? 'bg-[#1b4332] text-white shadow-sm'
                    : 'bg-white text-slate-700 hover:bg-[#F4EFE6] border border-[#E5E2DC]'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${activeCategory === cat.id ? 'text-white' : 'text-[#1b4332]'}`} />
                <span>{cat.name}</span>
              </button>
            );
          })}
        </div>

        {/* Chat Window Container */}
        <div className="flex-1 rounded-2xl bg-white border border-[#E5E2DC] shadow-sm flex flex-col h-[600px] overflow-hidden">
          {/* Messages Stream */}
          <div className="flex-1 p-4 sm:p-6 overflow-y-auto space-y-4 bg-[#FAF8F5]/60">
            {messages.map((m) => (
              <div
                key={m.id}
                className={`flex flex-col ${m.sender === 'user' ? 'items-end' : 'items-start'}`}
              >
                {m.sender === 'ai' && (
                  <div className="flex items-center gap-2 text-xs font-medium text-[#1b4332] mb-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-[#1b4332]" />
                    <span>{m.agent}</span>
                  </div>
                )}

                <div
                  className={`max-w-[85%] rounded-2xl p-4 leading-relaxed whitespace-pre-line text-xs sm:text-sm ${
                    m.sender === 'user'
                      ? 'bg-[#1b4332] text-white font-medium shadow-sm'
                      : 'bg-white text-slate-800 border border-[#E5E2DC] shadow-subtle'
                  }`}
                >
                  {m.text}
                </div>

                {/* Quick Action Chips */}
                {m.quickActions && m.quickActions.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-2.5 max-w-[85%]">
                    {m.quickActions.map((action, idx) => (
                      <button
                        key={idx}
                        onClick={() => handleSend(action)}
                        className="px-3 py-1.5 rounded-xl bg-white hover:bg-[#F4EFE6] border border-[#E5E2DC] hover:border-[#1b4332]/40 text-xs text-slate-700 hover:text-[#1b4332] font-medium transition-all shadow-subtle text-left"
                      >
                        ⚡ {action}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ))}

            {loading && (
              <div className="flex items-center gap-2.5 text-xs text-slate-600 bg-white w-fit p-3.5 rounded-2xl border border-[#E5E2DC] shadow-subtle">
                <div className="w-2 h-2 rounded-full bg-[#1b4332] animate-ping" />
                <span className="font-mono text-xs">Querying FoodFlow operational records...</span>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Prompt Form */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="p-4 bg-white border-t border-[#E5E2DC] flex items-center gap-3"
          >
            <input
              type="text"
              placeholder="Ask FoodFlow: 'Find restaurants near me', 'Show available donations', 'What is the shelf life of cooked meals?'..."
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              className="flex-1 bg-[#FAF8F5] border border-[#E5E2DC] rounded-xl px-4 py-3 text-xs sm:text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:border-[#1b4332] focus:bg-white transition-colors"
            />
            <Button
              type="submit"
              variant="primary"
              size="md"
              icon={Send}
              disabled={!prompt.trim() || loading}
              className="px-5 py-3 rounded-xl shrink-0"
            >
              Send
            </Button>
          </form>
        </div>
      </main>
    </div>
  );
}
