import { useState } from 'react';
import { Music, Eye, EyeOff, Loader2, MailCheck } from 'lucide-react';
import { useStore } from '@/store/useStore';

export default function AuthModal() {
  const { login, register } = useStore();
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [awaitingConfirm, setAwaitingConfirm] = useState(false);

  const handleSubmit = async () => {
    setError('');
    if (!email || !password) { setError('Email and password are required'); return; }
    if (mode === 'register' && !name) { setError('Name is required'); return; }
    if (password.length < 6) { setError('Password must be at least 6 characters'); return; }

    setLoading(true);
    if (mode === 'login') {
      const ok = await login(email, password);
      if (!ok) setError("Invalid email or password — or your email hasn't been confirmed yet.");
    } else {
      const result = await register(email, password, name);
      if (result === ('confirm' as unknown as boolean)) {
        setAwaitingConfirm(true);
      } else if (!result) {
        setError('Registration failed — try a different email');
      }
    }
    setLoading(false);
  };

  const inputStyle = {
    background: 'rgba(255,255,255,0.05)',
    border: '1px solid rgba(255,255,255,0.1)',
  };

  if (awaitingConfirm) {
    return (
      <div className="fixed inset-0 z-[300] flex items-center justify-center p-4" style={{ backgroundColor: '#0B0B0D' }}>
        <div className="grain-overlay" />
        <div className="relative w-full max-w-md text-center">
          <div className="w-16 h-16 rounded-2xl bg-[#C9FF3B]/10 flex items-center justify-center mx-auto mb-6">
            <MailCheck size={28} className="text-[#C9FF3B]" />
          </div>
          <h2 className="text-[#F2F2F2] text-2xl font-semibold mb-3">Check your email</h2>
          <p className="text-[#B8B8B8] text-sm leading-relaxed mb-2">We sent a confirmation link to</p>
          <p className="text-[#C9FF3B] font-medium mb-6">{email}</p>
          <p className="text-[#666] text-sm leading-relaxed mb-8">
            Click the link in that email to activate your account, then come back here and sign in.
          </p>
          <button
            onClick={() => { setAwaitingConfirm(false); setMode('login'); setPassword(''); }}
            className="btn-primary w-full"
          >
            Back to Sign In
          </button>
          <p className="text-[#444] text-xs mt-4">Can't find it? Check your spam folder.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-[300] flex items-center justify-center p-4" style={{ backgroundColor: '#0B0B0D' }}>
      <div className="grain-overlay" />
      <div className="relative w-full max-w-md">
        <div className="text-center mb-10">
          <div className="w-16 h-16 rounded-2xl bg-[#C9FF3B]/10 flex items-center justify-center mx-auto mb-4">
            <Music size={28} className="text-[#C9FF3B]" />
          </div>
          <h1 className="text-[#F2F2F2] text-2xl font-semibold tracking-tight">OKComputer</h1>
          <p className="text-[#666] text-sm mt-1">Personal Radio Station</p>
        </div>

        <div className="glass-card p-8">
          <div className="flex rounded-xl p-1 mb-8" style={{ background: 'rgba(255,255,255,0.04)' }}>
            {(['login', 'register'] as const).map((m) => (
              <button
                key={m}
                onClick={() => { setMode(m); setError(''); }}
                className="flex-1 py-2 rounded-lg text-sm font-medium transition-all capitalize"
                style={{
                  background: mode === m ? 'rgba(255,255,255,0.08)' : 'transparent',
                  color: mode === m ? '#F2F2F2' : '#666',
                }}
              >
                {m === 'login' ? 'Sign In' : 'Create Account'}
              </button>
            ))}
          </div>

          <div className="space-y-4">
            {mode === 'register' && (
              <div>
                <label className="block text-[#B8B8B8] text-xs mb-1.5 uppercase tracking-wide">Your Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Alex Rivera"
                  className="w-full px-4 py-3 rounded-xl text-[#F2F2F2] text-sm outline-none transition-all"
                  style={inputStyle}
                  onFocus={(e) => (e.target.style.borderColor = 'rgba(201,255,59,0.4)')}
                  onBlur={(e) => (e.target.style.borderColor = 'rgba(255,255,255,0.1)')}
                />
              </div>
            )}

            <div>
              <label className="block text-[#B8B8B8] text-xs mb-1.5 uppercase tracking-wide">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
                className="w-full px-4 py-3 rounded-xl text-[#F2F2F2] text-sm outline-none transition-all"
                style={inputStyle}
                onFocus={(e) => (e.target.style.borderColor = 'rgba(201,255,59,0.4)')}
                onBlur={(e) => (e.target.style.borderColor = 'rgba(255,255,255,0.1)')}
              />
            </div>

            <div>
              <label className="block text-[#B8B8B8] text-xs mb-1.5 uppercase tracking-wide">Password</label>
              <div className="relative">
                <input
                  type={showPass ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
                  className="w-full px-4 py-3 pr-12 rounded-xl text-[#F2F2F2] text-sm outline-none transition-all"
                  style={inputStyle}
                  onFocus={(e) => (e.target.style.borderColor = 'rgba(201,255,59,0.4)')}
                  onBlur={(e) => (e.target.style.borderColor = 'rgba(255,255,255,0.1)')}
                />
                <button
                  type="button"
                  onClick={() => setShowPass(!showPass)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-[#666] hover:text-[#B8B8B8] transition-colors"
                >
                  {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {error && <p className="text-red-400 text-sm px-1">{error}</p>}

            <button
              onClick={handleSubmit}
              disabled={loading}
              className="w-full btn-primary flex items-center justify-center gap-2 mt-2 disabled:opacity-60"
            >
              {loading
                ? <><Loader2 size={16} className="animate-spin" /> {mode === 'login' ? 'Signing in…' : 'Creating account…'}</>
                : mode === 'login' ? 'Sign In' : 'Create Account'
              }
            </button>
          </div>
        </div>

        <p className="text-center text-[#444] text-xs mt-6">
          Your data is stored securely in the cloud and only accessible to you.
        </p>
      </div>
    </div>
  );
}
