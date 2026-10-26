import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import apiClient from '../../api/client';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Badge } from '../../components/ui/Badge';
import { Mail, ArrowLeft, KeyRound, CheckCircle2, Leaf } from 'lucide-react';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [demoResetToken, setDemoResetToken] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');
    setLoading(true);

    try {
      const res = await apiClient.post('/auth/forgot-password', { email });
      if (res.data?.success) {
        setSuccessMsg('A password recovery authorization token has been generated for your account.');
        if (res.data.data?.resetToken) {
          setDemoResetToken(res.data.data.resetToken);
        }
      } else {
        setError(res.data?.error?.message || 'Password recovery failed');
      }
    } catch (err) {
      setError(err.response?.data?.error?.message || err.message || 'Request failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-center items-center p-4 sm:p-6 lg:p-8 bg-[#FAF8F5] bg-warm-grid text-slate-800">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center space-y-2">
          <Link to="/" className="inline-flex items-center gap-2 mb-2 focus:outline-none">
            <div className="w-9 h-9 rounded-xl bg-[#1b4332] text-white flex items-center justify-center shadow-sm">
              <Leaf className="w-5 h-5 fill-white stroke-white" />
            </div>
            <span className="font-extrabold text-2xl tracking-tight text-[#1b4332]">FoodFlow</span>
          </Link>
          <div className="flex items-center justify-center gap-2">
            <Badge variant="forest" size="sm" dot>
              SECURITY PORTAL
            </Badge>
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 mt-1">
            Reset Your Password
          </h1>
          <p className="text-xs text-slate-600 max-w-sm mx-auto">
            Enter your registered email address to receive secure recovery credentials.
          </p>
        </div>

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

          {successMsg ? (
            <div className="space-y-4 text-center py-4">
              <div className="w-12 h-12 rounded-full bg-[#f0f7f3] text-[#1b4332] flex items-center justify-center mx-auto border border-[#b9ddc8] shadow-sm">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <p className="text-xs text-slate-700 font-medium">{successMsg}</p>
              {demoResetToken && (
                <div className="p-3 bg-[#FAF8F5] rounded-xl border border-[#E5E2DC] text-left font-mono text-xs text-[#1b4332] break-all">
                  <span className="text-slate-500 block mb-1 uppercase text-[10px] font-bold">Verification Token:</span>
                  {demoResetToken}
                </div>
              )}
              <Link to="/login">
                <Button variant="secondary" size="md" className="w-full mt-4">
                  Back to Sign In
                </Button>
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <Input
                label="Registered Email Address"
                type="email"
                placeholder="name@organization.org"
                icon={Mail}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />

              <Button
                type="submit"
                variant="primary"
                size="lg"
                className="w-full mt-2 justify-center"
                isLoading={loading}
              >
                Send Reset Token
              </Button>

              <div className="text-center pt-2">
                <Link to="/login" className="inline-flex items-center gap-1 text-xs text-slate-500 hover:text-slate-800">
                  <ArrowLeft className="w-3.5 h-3.5" /> Back to Login
                </Link>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
