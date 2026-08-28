import React from 'react';
import { Routes, Route, Link, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Navbar from './components/layout/Navbar';
import AiHelperWidget from './components/ui/AiHelperWidget';
import DashboardPage from './pages/dashboard/DashboardPage';
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';
import ForgotPasswordPage from './pages/auth/ForgotPasswordPage';
import DonorDashboard from './pages/donor/DonorDashboard';
import RecipientDashboard from './pages/recipient/RecipientDashboard';
import VolunteerDashboard from './pages/volunteer/VolunteerDashboard';
import AdminDashboard from './pages/admin/AdminDashboard';
import ChatbotPage from './pages/chatbot/ChatbotPage';
import LiveTrackingMapPage from './pages/map/LiveTrackingMapPage';
import { Button } from './components/ui/Button';
import {
  ArrowRight,
  ShieldCheck,
  Globe,
  Users,
  Lock,
  Package,
  Leaf,
  Recycle,
  Clock,
  Sparkles,
  Building2,
  Heart,
  Truck
} from 'lucide-react';

function LandingPage() {
  const { isAuthenticated, user } = useAuth();

  return (
    <div className="min-h-screen flex flex-col bg-[#070B14] text-slate-100 font-sans bg-grid">
      <Navbar />

      {/* Hero Section (Matching Screenshot 2 Exactly) */}
      <section className="flex-1 flex flex-col items-center justify-center text-center px-4 sm:px-6 lg:px-8 pt-16 pb-12 relative overflow-hidden">
        {/* Background glow circle */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-emerald-500/10 blur-[120px] rounded-full pointer-events-none" />

        <div className="max-w-4xl mx-auto space-y-6 relative z-10">
          {/* Top Pill from Screenshot 2 */}
          <Link
            to="/admin"
            className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-950/60 border border-emerald-500/30 text-emerald-400 text-xs font-mono font-semibold tracking-wider hover:border-emerald-400 transition-colors"
          >
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>AGENTIC AI PLATFORM - LIVE NOW</span>
            <span className="text-emerald-500">›</span>
          </Link>

          {/* Main Hero Heading from Screenshot 2 */}
          <h1 className="text-5xl sm:text-6xl md:text-7xl font-extrabold tracking-tight text-white leading-[1.1]">
            Turning Surplus Food <br />
            <span className="gradient-text">into Community Impact</span>
          </h1>

          {/* Subtitle from Screenshot 2 */}
          <p className="text-base sm:text-lg text-slate-400 max-w-2xl mx-auto leading-relaxed">
            Food Flow connects donors, NGOs, and volunteers through a fleet of 6 autonomous AI agents — assessing freshness, matching recipients, optimizing routes, and measuring impact. All in real time.
          </p>

          {/* Main CTA Button from Screenshot 2 */}
          <div className="pt-3">
            <Link to="/dashboard">
              <Button
                variant="gradient"
                size="lg"
                icon={ArrowRight}
                iconPosition="right"
                className="px-8 py-3.5 text-base rounded-2xl shadow-xl shadow-emerald-500/25 group"
              >
                Go to Dashboard
              </Button>
            </Link>
          </div>

          {/* Trust Metrics Strip from Screenshot 2 */}
          <div className="pt-6 flex flex-wrap items-center justify-center gap-6 sm:gap-8 text-xs text-slate-400 font-medium">
            <div className="flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>SOC2 Compliant</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Globe className="w-4 h-4 text-cyan-400" />
              <span>12 Cities Active</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Users className="w-4 h-4 text-amber-400" />
              <span>2,400+ Volunteers</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Lock className="w-4 h-4 text-emerald-400" />
              <span>Zero Trust Security</span>
            </div>
          </div>
        </div>

        {/* LIVE PLATFORM METRICS Strip (Matching Screenshot 2 Bottom Row) */}
        <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 space-y-3">
          <div className="text-[11px] font-mono font-bold tracking-widest text-slate-500 uppercase text-center">
            LIVE PLATFORM METRICS
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 text-left">
            {/* 1. Total Food Donated */}
            <div className="rounded-2xl bg-[#0D1424] border border-[#1A2438] p-5 shadow-xl flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
                    <Package className="w-4 h-4" />
                  </div>
                  <span className="inline-flex items-center gap-1 text-[10px] font-mono text-emerald-400 font-bold">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" /> LIVE
                  </span>
                </div>
                <h3 className="text-2xl sm:text-3xl font-extrabold text-white font-mono">25kg</h3>
                <p className="text-xs font-semibold text-emerald-400 mt-1">Total Food Donated</p>
                <p className="text-[11px] text-slate-500">Surplus food posted</p>
              </div>
              <div className="mt-3 pt-2 border-t border-slate-800/80 text-[10px] font-mono text-emerald-400 flex items-center gap-1">
                <span>↗</span> +12% this week
              </div>
            </div>

            {/* 2. Food Saved */}
            <div className="rounded-2xl bg-[#0D1424] border border-[#1A2438] p-5 shadow-xl flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
                    <Leaf className="w-4 h-4" />
                  </div>
                  <span className="inline-flex items-center gap-1 text-[10px] font-mono text-emerald-400 font-bold">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" /> LIVE
                  </span>
                </div>
                <h3 className="text-2xl sm:text-3xl font-extrabold text-white font-mono">24kg</h3>
                <p className="text-xs font-semibold text-emerald-400 mt-1">Food Saved</p>
                <p className="text-[11px] text-slate-500">Diverted from landfills</p>
              </div>
              <div className="mt-3 pt-2 border-t border-slate-800/80 text-[10px] font-mono text-emerald-400 flex items-center gap-1">
                <span>↗</span> +8% this week
              </div>
            </div>

            {/* 3. People Helped */}
            <div className="rounded-2xl bg-[#0D1424] border border-[#1A2438] p-5 shadow-xl flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="w-8 h-8 rounded-lg bg-amber-500/10 text-amber-400 flex items-center justify-center">
                    <Users className="w-4 h-4" />
                  </div>
                  <span className="inline-flex items-center gap-1 text-[10px] font-mono text-amber-400 font-bold">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" /> LIVE
                  </span>
                </div>
                <h3 className="text-2xl sm:text-3xl font-extrabold text-white font-mono">50 meals</h3>
                <p className="text-xs font-semibold text-amber-400 mt-1">People Helped</p>
                <p className="text-[11px] text-slate-500">Meals served to shelters</p>
              </div>
              <div className="mt-3 pt-2 border-t border-slate-800/80 text-[10px] font-mono text-amber-400 flex items-center gap-1">
                <span>↗</span> +15% this week
              </div>
            </div>

            {/* 4. Food Waste Reduced */}
            <div className="rounded-2xl bg-[#0D1424] border border-[#1A2438] p-5 shadow-xl flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="w-8 h-8 rounded-lg bg-cyan-500/10 text-cyan-400 flex items-center justify-center">
                    <Recycle className="w-4 h-4" />
                  </div>
                  <span className="inline-flex items-center gap-1 text-[10px] font-mono text-cyan-400 font-bold">
                    <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" /> LIVE
                  </span>
                </div>
                <h3 className="text-2xl sm:text-3xl font-extrabold text-white font-mono">20 kg CO₂e</h3>
                <p className="text-xs font-semibold text-cyan-400 mt-1">Food Waste Reduced</p>
                <p className="text-[11px] text-slate-500">CO2 emissions prevented</p>
              </div>
              <div className="mt-3 pt-2 border-t border-slate-800/80 text-[10px] font-mono text-cyan-400 flex items-center gap-1">
                <span>↗</span> +11% this week
              </div>
            </div>

            {/* 5. Pending Requests */}
            <div className="rounded-2xl bg-[#0D1424] border border-[#1A2438] p-5 shadow-xl flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="w-8 h-8 rounded-lg bg-amber-500/10 text-amber-400 flex items-center justify-center">
                    <Clock className="w-4 h-4" />
                  </div>
                  <span className="inline-flex items-center gap-1 text-[10px] font-mono text-amber-400 font-bold">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" /> LIVE
                  </span>
                </div>
                <h3 className="text-2xl sm:text-3xl font-extrabold text-white font-mono">4</h3>
                <p className="text-xs font-semibold text-amber-400 mt-1">Pending Requests</p>
                <p className="text-[11px] text-slate-500">Active matching queue</p>
              </div>
              <div className="mt-3 pt-2 border-t border-slate-800/80 text-[10px] font-mono text-amber-400 flex items-center gap-1">
                <span>↗</span> +3% this week
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Floating AI Helper Widget from Screenshot */}
      <AiHelperWidget />

      {/* Sleek Footer */}
      <footer className="border-t border-[#151F33] py-8 text-xs text-slate-500 bg-[#070B14]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="font-bold text-white">FoodFlow</span>
            <span>• AI-Powered Autonomous Food Waste Management Network</span>
          </div>
          <p>© 2026 FoodFlow. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <div className="min-h-screen bg-[#F8FAFC] text-slate-900 font-sans">
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />

          {/* Role Dashboards & Live Map */}
          <Route path="/donor" element={<DonorDashboard />} />
          <Route path="/recipient" element={<RecipientDashboard />} />
          <Route path="/volunteer" element={<VolunteerDashboard />} />
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/chatbot" element={<ChatbotPage />} />
          <Route path="/live-map" element={<LiveTrackingMapPage />} />
          <Route path="/map" element={<LiveTrackingMapPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </AuthProvider>
  );
}
