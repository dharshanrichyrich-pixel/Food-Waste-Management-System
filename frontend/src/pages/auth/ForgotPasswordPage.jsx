import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import apiClient from '../../api/client';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Mail, ArrowLeft, KeyRound, CheckCircle2 } from 'lucide-react';

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
        setSuccessMsg('A password reset authorization token has been dispatched to your email.');
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
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center p-4 sm:p-6 bg-[#F8FAFC] bg-grid">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-bold uppercase tracking-wider">
            <KeyRound className="w-3.5 h-3.5 text-emerald-600" />
            Security Center
          </div>
          <h2 className="text-3xl font-extrabold tracking-tight text-slate-900">
            Reset Password
          </h2>
          <p className="text-xs text-slate-500">
            Enter your email to receive a secure recovery token
          </p>
        </div>

        <div className="rounded-2xl bg-white border border-slate-200 p-6 sm:p-7 shadow-lg space-y-4">
          {error && (
            <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs">
              {error}
            </div>
          )}

          {successMsg ? (
            <div className="space-y-4 text-center py-4">
              <div className="w-12 h-12 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto border border-emerald-200 shadow-sm">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <p className="text-xs text-slate-700 font-medium">{successMsg}</p>
              {demoResetToken && (
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-left font-mono text-xs text-emerald-700 break-all">
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
                placeholder="name@organization.com"
                icon={Mail}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />

              <Button
                type="submit"
                variant="primary"
                size="lg"
                className="w-full mt-2 justify-center shadow-md shadow-emerald-500/20"
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
