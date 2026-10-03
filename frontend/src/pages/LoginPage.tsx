import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { Input } from '../components/common/Input';
import { Button } from '../components/common/Button';
import { getErrorMessage } from '../api/client';
import { Eye, EyeOff, ArrowRight, ShieldCheck } from 'lucide-react';

export const LoginPage: React.FC = () => {
  const { login } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const from =
    (location.state as { from?: { pathname?: string } } | null)?.from?.pathname || '/dashboard';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim() || !password) {
      setError('Please enter both username and password.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await login({ username, password });
      showToast('Signed in successfully.', 'success');
      navigate(from, { replace: true });
    } catch (err) {
      const msg = getErrorMessage(err);
      setError(msg);
      showToast(msg, 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-5rem)] grid grid-cols-1 lg:grid-cols-12 max-w-7xl mx-auto px-6 py-12 items-center gap-12">
      {/* Left Typographic Artwork (Span 6) */}
      <div className="lg:col-span-6 space-y-8 pr-0 lg:pr-12">
        <div className="inline-block text-2xs font-mono uppercase tracking-widest text-accent font-semibold px-2.5 py-1 border border-accent/30">
          Account Authorization
        </div>

        <h1 className="font-display font-black text-5xl sm:text-7xl uppercase tracking-tightest leading-[0.95] text-ink">
          Patient &<br />
          <span className="font-serif italic font-normal text-accent lowercase text-6xl sm:text-8xl">Staff</span><br />
          Portal.
        </h1>

        <p className="text-sm text-ink-muted font-light leading-relaxed max-w-md">
          Access your confirmed appointments, schedule clinical diagnostic scans, or manage
          operational laboratory registries with cryptographic JWT credentials.
        </p>

        <div className="pt-6 border-t border-border flex items-center gap-6 text-2xs font-mono text-ink-muted uppercase tracking-wider">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-ink" />
            <span>256-Bit Encrypted Session</span>
          </div>
          <div>•</div>
          <div>Multi-Role Access</div>
        </div>
      </div>

      {/* Right Login Form (Span 6) */}
      <div className="lg:col-span-6">
        <div className="bg-[#FAF8F5] border border-ink p-8 sm:p-12 shadow-xl space-y-8">
          <div>
            <span className="text-2xs font-mono uppercase tracking-widest text-ink-muted block pb-1">
              Secure Sign In
            </span>
            <h2 className="font-display font-bold text-2xl sm:text-3xl uppercase tracking-tight text-ink">
              Enter Credentials
            </h2>
          </div>

          {error && (
            <div className="p-4 bg-accent/10 border border-accent text-accent text-xs font-mono uppercase tracking-wide">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <Input
              label="Username"
              type="text"
              placeholder="e.g. alice_smith"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              autoFocus
            />

            <div className="relative">
              <Input
                label="Password"
                type={showPassword ? 'text' : 'password'}
                placeholder="••••••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-8 text-ink-muted hover:text-ink transition-colors p-1"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>

            <Button
              type="submit"
              variant="primary"
              size="lg"
              loading={loading}
              className="w-full flex items-center justify-center gap-2"
            >
              <span>Authenticate Session</span>
              <ArrowRight className="w-4 h-4" />
            </Button>
          </form>

          <div className="pt-6 border-t border-border flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-medium text-ink-muted">
            <span>Don't have an account yet?</span>
            <Link
              to="/register"
              className="text-ink font-bold uppercase tracking-wider hover:text-accent transition-colors underline underline-offset-4"
            >
              Create Patient Account
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
