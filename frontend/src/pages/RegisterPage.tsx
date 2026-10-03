import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { Input } from '../components/common/Input';
import { Button } from '../components/common/Button';
import { getErrorMessage } from '../api/client';
import { Eye, EyeOff, ArrowRight, UserPlus, CheckCircle2 } from 'lucide-react';

export const RegisterPage: React.FC = () => {
  const { register, login } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim() || !email.trim() || !password) {
      setError('Please fill out all required fields.');
      return;
    }

    if (password.length < 8) {
      setError('Password must contain at least 8 characters.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match. Please verify.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await register({ username, email, password });
    } catch (err) {
      const msg = getErrorMessage(err);
      setError(msg);
      showToast(msg, 'error');
      setLoading(false);
      return;
    }

    // Attempt automatic login
    try {
      showToast('Registration successful! Logging you in...', 'success');
      await login({ username, password });
      navigate('/dashboard');
    } catch (loginErr) {
      // If auto-login fails, inform user that account was created and redirect to /login
      showToast('Account created successfully. Please sign in to continue.', 'info');
      navigate('/login');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-5rem)] grid grid-cols-1 lg:grid-cols-12 max-w-7xl mx-auto px-6 py-12 items-center gap-12">
      {/* Left Artwork & Instructions */}
      <div className="lg:col-span-6 space-y-8 pr-0 lg:pr-12">
        <div className="inline-block text-2xs font-mono uppercase tracking-widest text-accent font-semibold px-2.5 py-1 border border-accent/30">
          Patient Registration
        </div>

        <h1 className="font-display font-black text-5xl sm:text-7xl uppercase tracking-tightest leading-[0.95] text-ink">
          Create<br />
          <span className="font-serif italic font-normal text-accent lowercase text-6xl sm:text-8xl">your</span><br />
          Profile.
        </h1>

        <p className="text-sm text-ink-muted font-light leading-relaxed max-w-md">
          Register to schedule diagnostic imaging appointments, track scan history, and access verified
          clinical booking slots across our certified facility network.
        </p>

        <div className="space-y-3 pt-4">
          {[
            'Instant booking confirmation with zero waiting lines',
            'Full control to cancel or reschedule appointments anytime',
            'Direct walk-in check-in verification at diagnostic labs',
          ].map((feature, i) => (
            <div key={i} className="flex items-center gap-3 text-xs text-ink-muted font-medium">
              <CheckCircle2 className="w-4 h-4 text-ink flex-shrink-0" />
              <span>{feature}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Right Registration Form */}
      <div className="lg:col-span-6">
        <div className="bg-[#FAF8F5] border border-ink p-8 sm:p-12 shadow-xl space-y-8">
          <div>
            <span className="text-2xs font-mono uppercase tracking-widest text-ink-muted block pb-1">
              New Account
            </span>
            <h2 className="font-display font-bold text-2xl sm:text-3xl uppercase tracking-tight text-ink">
              Enter Details
            </h2>
          </div>

          {error && (
            <div className="p-4 bg-accent/10 border border-accent text-accent text-xs font-mono uppercase tracking-wide">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <Input
              label="Username"
              type="text"
              placeholder="e.g. john_doe"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />

            <Input
              label="Email Address"
              type="email"
              placeholder="e.g. john@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />

            <div className="relative">
              <Input
                label="Password (min 8 characters)"
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

            <Input
              label="Confirm Password"
              type={showPassword ? 'text' : 'password'}
              placeholder="••••••••••••"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />

            <Button
              type="submit"
              variant="primary"
              size="lg"
              loading={loading}
              className="w-full flex items-center justify-center gap-2"
            >
              <span>Create Patient Profile</span>
              <ArrowRight className="w-4 h-4" />
            </Button>
          </form>

          <div className="pt-6 border-t border-border flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-medium text-ink-muted">
            <span>Already have an account?</span>
            <Link
              to="/login"
              className="text-ink font-bold uppercase tracking-wider hover:text-accent transition-colors underline underline-offset-4"
            >
              Sign In to Existing Account
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
