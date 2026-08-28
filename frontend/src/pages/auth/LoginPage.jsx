import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Badge } from '../../components/ui/Badge';
import { Mail, Lock, Building2, HeartHandshake, Truck, ShieldCheck } from 'lucide-react';

export default function LoginPage() {
  const { login, quickDemoLogin } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [demoLoading, setDemoLoading] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const res = await login(email, password);
    setLoading(false);

    if (res.success) {
      navigate('/dashboard');
    } else {
      setError(res.error);
    }
  };

  const handleDemoLogin = async (role) => {
    setError('');
    setDemoLoading(role);
    const res = await quickDemoLogin(role);
    setDemoLoading(null);

    if (res.success) {
      navigate('/dashboard');
    } else {
      setError(res.error);
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center p-4 sm:p-6 lg:p-8 bg-[#F8FAFC] bg-grid">
      <div className="w-full max-w-md space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-bold uppercase tracking-wider">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            MongoDB Auth &bull; RBAC Secured
          </div>
          <h2 className="text-3xl font-extrabold tracking-tight text-slate-900">
            Welcome Back
          </h2>
          <p className="text-xs text-slate-500">
            Sign in to access your surplus food rescue dashboard
          </p>
        </div>

        {/* Login Card */}
        <div className="rounded-2xl bg-white border border-slate-200 p-6 sm:p-7 shadow-lg space-y-4">
          {error && (
            <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-red-500" />
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Email Address"
              type="email"
              placeholder="you@restaurant.com"
              icon={Mail}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />

            <div className="space-y-1">
              <div className="flex justify-between items-center">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-600">
                  Password
                </label>
                <Link
                  to="/forgot-password"
                  className="text-xs text-emerald-600 hover:text-emerald-700 font-bold"
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
              />
            </div>

            <Button
              type="submit"
              variant="primary"
              size="lg"
              className="w-full mt-2 justify-center shadow-md shadow-emerald-500/20"
              isLoading={loading}
            >
              Sign In to Account
            </Button>
          </form>

          <div className="relative my-5">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-200" />
            </div>
            <div className="relative flex justify-center text-[10px] uppercase font-bold tracking-wider">
              <span className="bg-white px-3 text-slate-400">
                Or Quick Test With Demo Role
              </span>
            </div>
          </div>

          {/* Quick Demo Logins */}
          <div className="grid grid-cols-2 gap-2.5">
            <button
              type="button"
              onClick={() => handleDemoLogin('volunteer')}
              disabled={!!demoLoading}
              className="p-3 rounded-xl bg-slate-50 hover:bg-sky-50/50 border border-slate-200 hover:border-sky-300 text-left transition-all flex flex-col justify-between shadow-sm"
            >
              <div className="flex items-center justify-between w-full mb-1">
                <Truck className="w-4 h-4 text-sky-600" />
                <Badge variant="blue" size="sm">Volunteer #1</Badge>
              </div>
              <span className="text-xs font-bold text-slate-800">
                Kumaran (Hero Courier)
              </span>
            </button>

            <button
              type="button"
              onClick={() => handleDemoLogin('donor')}
              disabled={!!demoLoading}
              className="p-3 rounded-xl bg-slate-50 hover:bg-emerald-50/50 border border-slate-200 hover:border-emerald-300 text-left transition-all flex flex-col justify-between shadow-sm"
            >
              <div className="flex items-center justify-between w-full mb-1">
                <Building2 className="w-4 h-4 text-emerald-600" />
                <Badge variant="brand" size="sm">Donor</Badge>
              </div>
              <span className="text-xs font-bold text-slate-800">
                Deedarsh (Bistro)
              </span>
            </button>

            <button
              type="button"
              onClick={() => handleDemoLogin('recipient')}
              disabled={!!demoLoading}
              className="p-3 rounded-xl bg-slate-50 hover:bg-amber-50/50 border border-slate-200 hover:border-amber-300 text-left transition-all flex flex-col justify-between shadow-sm"
            >
              <div className="flex items-center justify-between w-full mb-1">
                <HeartHandshake className="w-4 h-4 text-amber-600" />
                <Badge variant="amber" size="sm">Recipient</Badge>
              </div>
              <span className="text-xs font-bold text-slate-800">
                Jersin (NGO Shelter)
              </span>
            </button>

            <button
              type="button"
              onClick={() => handleDemoLogin('admin')}
              disabled={!!demoLoading}
              className="p-3 rounded-xl bg-slate-50 hover:bg-purple-50/50 border border-slate-200 hover:border-purple-300 text-left transition-all flex flex-col justify-between shadow-sm"
            >
              <div className="flex items-center justify-between w-full mb-1">
                <ShieldCheck className="w-4 h-4 text-purple-600" />
                <Badge variant="purple" size="sm">Admin</Badge>
              </div>
              <span className="text-xs font-bold text-slate-800">
                Dharshan (Admin)
              </span>
            </button>
          </div>

          <div className="pt-2 text-center">
            <p className="text-xs text-slate-500">
              Don't have an account?{' '}
              <Link
                to="/register"
                className="font-bold text-emerald-600 hover:text-emerald-700 hover:underline"
              >
                Register now
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
