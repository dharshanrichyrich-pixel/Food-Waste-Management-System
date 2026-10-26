import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Badge } from '../../components/ui/Badge';
import {
  Mail,
  Lock,
  Building2,
  HeartHandshake,
  Truck,
  ShieldCheck,
  Leaf,
  ArrowRight,
} from 'lucide-react';

export default function LoginPage() {
  const { login, quickDemoLogin } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [demoLoading, setDemoLoading] = useState(null);

  const routeByRole = (role) => {
    switch (role) {
      case 'donor':
        return '/donor';
      case 'recipient':
        return '/recipient';
      case 'volunteer':
        return '/volunteer';
      case 'admin':
        return '/admin';
      default:
        return '/dashboard';
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const res = await login(email, password);
    setLoading(false);

    if (res.success) {
      const destination = routeByRole(res.user?.role);
      navigate(destination);
    } else {
      setError(res.error || 'Authentication failed. Please verify credentials.');
    }
  };

  const handleDemoLogin = async (role) => {
    setError('');
    setDemoLoading(role);
    const res = await quickDemoLogin(role);
    setDemoLoading(null);

    if (res.success) {
      const destination = routeByRole(res.user?.role || role);
      navigate(destination);
    } else {
      setError(res.error || 'Demo authentication failed. Server connection error.');
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-center items-center p-4 sm:p-6 lg:p-8 bg-[#FAF8F5] bg-warm-grid text-slate-800">
      <div className="w-full max-w-lg space-y-6">
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <Link to="/" className="inline-flex items-center gap-2 mb-2 focus:outline-none">
            <div className="w-9 h-9 rounded-xl bg-[#1b4332] text-white flex items-center justify-center shadow-sm">
              <Leaf className="w-5 h-5 fill-white stroke-white" />
            </div>
            <span className="font-extrabold text-2xl tracking-tight text-[#1b4332]">FoodFlow</span>
          </Link>
          <div className="flex items-center justify-center gap-2">
            <Badge variant="forest" size="sm" dot>
              VERIFIED AUTHENTICATION
            </Badge>
            <span className="text-xs text-slate-400">&bull;</span>
            <span className="text-xs text-slate-500 font-medium">RBAC Security</span>
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 mt-1">
            Sign in to FoodFlow
          </h1>
          <p className="text-xs text-slate-600 max-w-sm mx-auto">
            Access your surplus food rescue operations, matching telemetry, and logistics.
          </p>
        </div>

        {/* Login Card */}
        <div className="rounded-2xl bg-white border border-[#E5E2DC] p-6 sm:p-8 shadow-sm space-y-5">
          {error && (
            <div
              role="alert"
              className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2.5"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-rose-500 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Email Address"
              type="email"
              placeholder="you@organization.org"
              icon={Mail}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
            />

            <div className="space-y-1">
              <div className="flex justify-between items-center">
                <label className="text-xs font-semibold uppercase tracking-wider text-slate-700">
                  Password
                </label>
                <Link
                  to="/forgot-password"
                  className="text-xs text-[#1b4332] hover:text-[#143527] font-semibold hover:underline"
                >
                  Forgot password?
                </Link>
              </div>
              <Input
                type="password"
                placeholder="••••••••"
                icon={Lock}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="current-password"
              />
            </div>

            <Button
              type="submit"
              variant="primary"
              size="lg"
              className="w-full mt-2 justify-center"
              isLoading={loading}
              icon={ArrowRight}
              iconPosition="right"
            >
              Sign In to Account
            </Button>
          </form>

          {/* Divider */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-[#E5E2DC]" />
            </div>
            <div className="relative flex justify-center text-[10px] uppercase font-bold tracking-wider">
              <span className="bg-white px-3 text-slate-400">
                Explore With Dedicated Role
              </span>
            </div>
          </div>

          {/* Demo Role Selection Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* 1. Volunteer */}
            <button
              type="button"
              onClick={() => handleDemoLogin('volunteer')}
              disabled={!!demoLoading}
              className="p-3.5 rounded-xl bg-[#FAF8F5] hover:bg-[#F4EFE6] border border-[#E5E2DC] hover:border-[#1b4332]/40 text-left transition-all flex flex-col justify-between shadow-subtle group focus:outline-none focus-visible:ring-2 focus-visible:ring-[#1b4332]"
            >
              <div className="flex items-center justify-between w-full mb-1.5">
                <div className="w-7 h-7 rounded-lg bg-sky-100 text-sky-800 flex items-center justify-center">
                  <Truck className="w-4 h-4" />
                </div>
                <Badge variant="blue" size="sm">Volunteer</Badge>
              </div>
              <div>
                <span className="text-xs font-bold text-slate-900 group-hover:text-[#1b4332] transition-colors block">
                  Volunteer
                </span>
                <span className="text-[11px] text-slate-500 block leading-tight mt-0.5">
                  Food Rescue Volunteer
                </span>
              </div>
              {demoLoading === 'volunteer' && (
                <span className="text-[10px] text-sky-700 font-semibold mt-1">Authenticating...</span>
              )}
            </button>

            {/* 2. Donor */}
            <button
              type="button"
              onClick={() => handleDemoLogin('donor')}
              disabled={!!demoLoading}
              className="p-3.5 rounded-xl bg-[#FAF8F5] hover:bg-[#F4EFE6] border border-[#E5E2DC] hover:border-[#1b4332]/40 text-left transition-all flex flex-col justify-between shadow-subtle group focus:outline-none focus-visible:ring-2 focus-visible:ring-[#1b4332]"
            >
              <div className="flex items-center justify-between w-full mb-1.5">
                <div className="w-7 h-7 rounded-lg bg-emerald-100 text-[#1b4332] flex items-center justify-center">
                  <Building2 className="w-4 h-4" />
                </div>
                <Badge variant="forest" size="sm">Donor</Badge>
              </div>
              <div>
                <span className="text-xs font-bold text-slate-900 group-hover:text-[#1b4332] transition-colors block">
                  Donor
                </span>
                <span className="text-[11px] text-slate-500 block leading-tight mt-0.5">
                  Restaurant / Food Donor
                </span>
              </div>
              {demoLoading === 'donor' && (
                <span className="text-[10px] text-emerald-700 font-semibold mt-1">Authenticating...</span>
              )}
            </button>

            {/* 3. Recipient */}
            <button
              type="button"
              onClick={() => handleDemoLogin('recipient')}
              disabled={!!demoLoading}
              className="p-3.5 rounded-xl bg-[#FAF8F5] hover:bg-[#F4EFE6] border border-[#E5E2DC] hover:border-[#1b4332]/40 text-left transition-all flex flex-col justify-between shadow-subtle group focus:outline-none focus-visible:ring-2 focus-visible:ring-[#1b4332]"
            >
              <div className="flex items-center justify-between w-full mb-1.5">
                <div className="w-7 h-7 rounded-lg bg-amber-100 text-amber-800 flex items-center justify-center">
                  <HeartHandshake className="w-4 h-4" />
                </div>
                <Badge variant="amber" size="sm">Recipient</Badge>
              </div>
              <div>
                <span className="text-xs font-bold text-slate-900 group-hover:text-[#1b4332] transition-colors block">
                  Recipient
                </span>
                <span className="text-[11px] text-slate-500 block leading-tight mt-0.5">
                  NGO / Shelter
                </span>
              </div>
              {demoLoading === 'recipient' && (
                <span className="text-[10px] text-amber-700 font-semibold mt-1">Authenticating...</span>
              )}
            </button>

            {/* 4. Admin */}
            <button
              type="button"
              onClick={() => handleDemoLogin('admin')}
              disabled={!!demoLoading}
              className="p-3.5 rounded-xl bg-[#FAF8F5] hover:bg-[#F4EFE6] border border-[#E5E2DC] hover:border-[#1b4332]/40 text-left transition-all flex flex-col justify-between shadow-subtle group focus:outline-none focus-visible:ring-2 focus-visible:ring-[#1b4332]"
            >
              <div className="flex items-center justify-between w-full mb-1.5">
                <div className="w-7 h-7 rounded-lg bg-purple-100 text-purple-800 flex items-center justify-center">
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <Badge variant="purple" size="sm">Admin</Badge>
              </div>
              <div>
                <span className="text-xs font-bold text-slate-900 group-hover:text-[#1b4332] transition-colors block">
                  Admin
                </span>
                <span className="text-[11px] text-slate-500 block leading-tight mt-0.5">
                  System Administrator
                </span>
              </div>
              {demoLoading === 'admin' && (
                <span className="text-[10px] text-purple-700 font-semibold mt-1">Authenticating...</span>
              )}
            </button>
          </div>

          <div className="pt-2 text-center border-t border-[#E5E2DC]">
            <p className="text-xs text-slate-500">
              Need an organization account?{' '}
              <Link
                to="/register"
                className="font-bold text-[#1b4332] hover:text-[#143527] hover:underline"
              >
                Register your facility
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
