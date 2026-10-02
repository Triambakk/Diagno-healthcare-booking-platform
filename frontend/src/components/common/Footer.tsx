import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowUpRight } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-ink text-[#FAF8F5] pt-24 pb-16 border-t border-border-dark mt-auto">
      <div className="max-w-7xl mx-auto px-6">
        {/* Large Editorial Brand Header */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 pb-16 border-b border-border-dark">
          <div className="lg:col-span-6 space-y-6">
            <div className="flex items-baseline gap-2">
              <span className="font-display font-black text-3xl tracking-tight uppercase text-white">
                DIAGNO
              </span>
              <span className="w-2 h-2 rounded-full bg-accent inline-block"></span>
            </div>
            <p className="text-sm text-ink-subtle max-w-md font-light leading-relaxed">
              A minimalist diagnostic appointment booking platform connecting patients with imaging
              facilities, providing direct slot reservation with guaranteed conflict prevention.
            </p>
            <div className="pt-2">
              <span className="inline-block text-2xs font-mono tracking-widest text-accent uppercase px-2.5 py-1 border border-accent/40">
                Guaranteed Single-Slot Booking Architecture
              </span>
            </div>
          </div>

          <div className="lg:col-span-3 space-y-4">
            <h4 className="text-2xs font-mono uppercase tracking-widest text-ink-subtle">
              Navigation
            </h4>
            <ul className="space-y-2.5 text-xs font-medium uppercase tracking-wider">
              <li>
                <Link to="/centers" className="text-white hover:text-accent transition-colors">
                  Diagnostic Centers
                </Link>
              </li>
              <li>
                <Link to="/scans" className="text-white hover:text-accent transition-colors">
                  Tests & Scans Catalogue
                </Link>
              </li>
              <li>
                <Link to="/book" className="text-white hover:text-accent transition-colors flex items-center gap-1">
                  <span>Schedule Scan</span>
                  <ArrowUpRight className="w-3 h-3 text-accent" />
                </Link>
              </li>
              <li>
                <Link to="/login" className="text-white hover:text-accent transition-colors">
                  Patient Portal
                </Link>
              </li>
            </ul>
          </div>

          <div className="lg:col-span-3 space-y-4">
            <h4 className="text-2xs font-mono uppercase tracking-widest text-ink-subtle">
              Technology Stack
            </h4>
            <ul className="space-y-2 text-xs font-mono text-ink-subtle">
              <li>Django REST Framework 5.2</li>
              <li>PostgreSQL ACID Transactions</li>
              <li>JWT Cryptographic Auth</li>
              <li>React + TypeScript + Tailwind</li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-10 flex flex-col sm:flex-row items-center justify-between gap-4 text-2xs font-mono text-ink-subtle uppercase tracking-widest">
          <div>
            &copy; {new Date().getFullYear()} DIAGNO. Portfolio Software Engineering Demonstration.
          </div>
          <div>
            PostgreSQL ACID Double-Booking Prevention Architecture
          </div>
        </div>
      </div>
    </footer>
  );
};
