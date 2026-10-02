import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Menu, X, ArrowRight, User as UserIcon, LogOut, ShieldCheck } from 'lucide-react';

export const Navbar: React.FC = () => {
  const { user, isAuthenticated, isStaff, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const isActive = (path: string) => location.pathname === path;

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="sticky top-0 z-40 bg-[#FAF8F5]/90 backdrop-blur-md border-b border-border transition-all">
      <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
        {/* Brand Logo */}
        <Link to="/" className="flex items-baseline gap-2 group">
          <span className="font-display font-black text-2xl tracking-tight text-ink uppercase group-hover:text-accent transition-colors">
            DIAGNO
          </span>
          <span className="w-1.5 h-1.5 rounded-full bg-accent inline-block"></span>
          <span className="text-2xs font-mono tracking-widest text-ink-muted uppercase hidden sm:inline-block">
            Diagnostic Booking Platform
          </span>
        </Link>

        {/* Desktop Nav Links */}
        <nav className="hidden md:flex items-center gap-8 text-xs font-semibold tracking-wide uppercase">
          <Link
            to="/centers"
            className={`transition-colors hover:text-accent ${
              isActive('/centers') ? 'text-accent border-b border-accent pb-0.5' : 'text-ink-muted'
            }`}
          >
            Diagnostic Centers
          </Link>
          <Link
            to="/scans"
            className={`transition-colors hover:text-accent ${
              isActive('/scans') ? 'text-accent border-b border-accent pb-0.5' : 'text-ink-muted'
            }`}
          >
            Tests & Scans
          </Link>
          
          {isAuthenticated && !isStaff && (
            <Link
              to="/dashboard"
              className={`transition-colors hover:text-accent ${
                isActive('/dashboard') ? 'text-accent border-b border-accent pb-0.5' : 'text-ink-muted'
              }`}
            >
              My Appointments
            </Link>
          )}

          {isStaff && (
            <Link
              to="/staff"
              className={`flex items-center gap-1.5 px-2.5 py-1 text-2xs uppercase tracking-widest bg-ink text-white transition-colors hover:bg-accent ${
                isActive('/staff') ? 'bg-accent' : ''
              }`}
            >
              <ShieldCheck className="w-3.5 h-3.5 text-accent-light" />
              Staff Portal
            </Link>
          )}
        </nav>

        {/* Right CTA / Auth Status */}
        <div className="hidden md:flex items-center gap-4">
          {isAuthenticated ? (
            <div className="flex items-center gap-4">
              <div className="text-right">
                <span className="block text-xs font-semibold tracking-wide text-ink">
                  {user?.username}
                </span>
                <span className="block text-2xs font-mono uppercase tracking-wider text-ink-muted">
                  {isStaff ? 'Administrator' : 'Patient'}
                </span>
              </div>
              <button
                onClick={handleLogout}
                title="Logout"
                className="p-2 border border-border hover:border-ink hover:text-accent transition-colors"
              >
                <LogOut className="w-4 h-4" />
              </button>
              <Link
                to="/book"
                className="px-5 py-2.5 bg-ink text-white text-xs font-semibold uppercase tracking-wider hover:bg-accent transition-colors flex items-center gap-2 group"
              >
                <span>Book Slot</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
              </Link>
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <Link
                to="/login"
                className="px-4 py-2 text-xs font-semibold uppercase tracking-wider text-ink hover:text-accent transition-colors"
              >
                Sign In
              </Link>
              <Link
                to="/register"
                className="px-5 py-2.5 border border-ink text-ink text-xs font-semibold uppercase tracking-wider hover:bg-ink hover:text-white transition-all"
              >
                Register
              </Link>
              <Link
                to="/book"
                className="px-5 py-2.5 bg-ink text-white text-xs font-semibold uppercase tracking-wider hover:bg-accent transition-colors flex items-center gap-2 group"
              >
                <span>Book Scan</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
              </Link>
            </div>
          )}
        </div>

        {/* Mobile Hamburger */}
        <div className="flex items-center gap-2 md:hidden">
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 border border-border text-ink"
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-border bg-[#FAF8F5] px-6 py-8 space-y-6 animate-fadeIn">
          <nav className="flex flex-col space-y-4 text-sm font-semibold tracking-wide uppercase">
            <Link
              to="/centers"
              onClick={() => setMobileMenuOpen(false)}
              className="hover:text-accent transition-colors"
            >
              Diagnostic Centers
            </Link>
            <Link
              to="/scans"
              onClick={() => setMobileMenuOpen(false)}
              className="hover:text-accent transition-colors"
            >
              Tests & Scans
            </Link>
            {isAuthenticated && !isStaff && (
              <Link
                to="/dashboard"
                onClick={() => setMobileMenuOpen(false)}
                className="hover:text-accent transition-colors"
              >
                My Appointments
              </Link>
            )}
            {isStaff && (
              <Link
                to="/staff"
                onClick={() => setMobileMenuOpen(false)}
                className="hover:text-accent transition-colors text-accent flex items-center gap-2"
              >
                <ShieldCheck className="w-4 h-4" />
                Staff Administration
              </Link>
            )}
            <Link
              to="/book"
              onClick={() => setMobileMenuOpen(false)}
              className="py-3 bg-ink text-white text-center text-xs uppercase tracking-widest hover:bg-accent transition-colors"
            >
              Book Diagnostic Scan
            </Link>
          </nav>

          <div className="pt-4 border-t border-border">
            {isAuthenticated ? (
              <div className="flex items-center justify-between">
                <div>
                  <span className="block text-xs font-bold">{user?.username}</span>
                  <span className="text-2xs font-mono text-ink-muted uppercase">
                    {isStaff ? 'Administrator' : 'Patient'}
                  </span>
                </div>
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    handleLogout();
                  }}
                  className="px-3 py-1.5 text-xs border border-border uppercase tracking-wider"
                >
                  Sign Out
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-3">
                <Link
                  to="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="py-2.5 text-center text-xs font-semibold uppercase tracking-wider border border-border"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  onClick={() => setMobileMenuOpen(false)}
                  className="py-2.5 text-center text-xs font-semibold uppercase tracking-wider bg-ink text-white"
                >
                  Register
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
};
