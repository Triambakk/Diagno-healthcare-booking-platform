import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, ArrowUpRight, Shield, Clock, Sparkles, CheckCircle2 } from 'lucide-react';
import { centersApi } from '../api/centers';
import { scansApi } from '../api/scans';
import { DiagnosticCenter, ScanType } from '../types';

export const LandingPage: React.FC = () => {
  const [centers, setCenters] = useState<DiagnosticCenter[]>([]);
  const [scans, setScans] = useState<ScanType[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [cData, sData] = await Promise.all([centersApi.getAll(), scansApi.getAll()]);
        setCenters(cData.slice(0, 3));
        setScans(sData.slice(0, 4));
      } catch (err) {
        console.error('Error loading landing data:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  return (
    <div className="space-y-32 pb-32">
      {/* ------------------------------------------------------------- */}
      {/* HERO SECTION — Editorial Asymmetric Composition */}
      {/* ------------------------------------------------------------- */}
      <section className="relative pt-12 md:pt-20 px-6 max-w-7xl mx-auto">
        {/* Top metadata tags */}
        <div className="flex flex-wrap items-center justify-between gap-4 pb-8 border-b border-border text-2xs font-mono uppercase tracking-widest text-ink-muted">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-accent animate-pulse"></span>
            <span>Real-time Slot Reservation Engine</span>
          </div>
          <div>Issue No. 04 / Accredited Imaging Directory</div>
          <div className="hidden sm:block">Zero Double-Booking Guarantee</div>
        </div>

        {/* Hero Main Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 pt-12 items-start">
          {/* Main Display Headline (Span 8) */}
          <div className="lg:col-span-8 space-y-8">
            <div className="inline-block text-xs font-mono uppercase tracking-widest text-accent font-semibold px-3 py-1 bg-accent-light/50 border border-accent/20">
              Diagnostic Appointment System
            </div>
            
            <h1 className="font-display font-extrabold text-5xl sm:text-7xl xl:text-8xl uppercase tracking-tightest leading-[0.92] text-ink">
              Diagnostic<br />
              <span className="italic font-normal font-serif lowercase text-accent text-6xl sm:text-8xl xl:text-9xl">care,</span><br />
              arranged<br />
              around<br />
              your time.
            </h1>

            <p className="text-lg text-ink-muted font-light max-w-xl leading-relaxed pt-4">
              Schedule high-precision MRI, CT, and specialized clinical imaging across premier accredited
              diagnostic facilities. Verified atomic reservations with zero duplicate slots.
            </p>

            <div className="pt-4 flex flex-wrap items-center gap-4">
              <Link
                to="/centers"
                className="px-8 py-4 bg-ink text-white font-sans text-xs font-bold uppercase tracking-widest hover:bg-accent transition-all duration-300 flex items-center gap-3 shadow-lg group"
              >
                <span>Find a Diagnostic Center</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link
                to="/scans"
                className="px-8 py-4 border border-ink text-ink font-sans text-xs font-bold uppercase tracking-widest hover:bg-ink hover:text-white transition-all duration-300"
              >
                Explore Tests & Pricing
              </Link>
            </div>
          </div>

          {/* Side Editorial Graphic / Sculpture (Span 4) */}
          <div className="lg:col-span-4 space-y-6 pt-4 lg:pt-0">
            {/* Minimalist Graphic Tile */}
            <div className="relative border border-ink bg-ink text-[#FAF8F5] p-8 overflow-hidden">
              <div className="absolute top-0 right-0 -mr-6 -mt-6 w-32 h-32 rounded-full border border-white/10"></div>
              <span className="text-2xs font-mono uppercase tracking-widest text-accent-light block pb-8">
                System Capability
              </span>
              <div className="font-display font-bold text-5xl tracking-tight text-white mb-2">
                100%
              </div>
              <div className="text-xs uppercase tracking-widest text-ink-faint font-medium mb-6">
                ACID Conflict Prevention
              </div>
              <p className="text-xs text-ink-faint font-light leading-relaxed border-t border-border-dark pt-4">
                Every reservation executes inside PostgreSQL row-level locks and partial indices to
                prevent race conditions and duplicate slot bookings.
              </p>
            </div>

            {/* Quick Service Metrics */}
            <div className="border border-border p-6 bg-bg-alt/50 space-y-4">
              <div className="flex items-center justify-between text-2xs font-mono uppercase tracking-wider text-ink-muted">
                <span>Accredited Network</span>
                <span className="text-ink font-bold">Pan-City Labs</span>
              </div>
              <div className="flex items-center justify-between text-2xs font-mono uppercase tracking-wider text-ink-muted">
                <span>Immediate Booking</span>
                <span className="text-ink font-bold">No Waiting Queue</span>
              </div>
              <div className="flex items-center justify-between text-2xs font-mono uppercase tracking-wider text-ink-muted">
                <span>Free Cancellation</span>
                <span className="text-ink font-bold">Instant Slot Release</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ------------------------------------------------------------- */}
      {/* HOW IT WORKS — Bold Typographic Step Grid (01 - 04) */}
      {/* ------------------------------------------------------------- */}
      <section className="max-w-7xl mx-auto px-6">
        <div className="flex flex-col md:flex-row md:items-end justify-between pb-12 border-b border-ink gap-6">
          <div>
            <span className="text-2xs font-mono uppercase tracking-widest text-accent block pb-2">
              Process Methodology
            </span>
            <h2 className="font-display font-bold text-3xl sm:text-5xl uppercase tracking-tight text-ink">
              How the platform works
            </h2>
          </div>
          <p className="text-xs font-mono text-ink-muted uppercase tracking-widest max-w-xs">
            Simple 4-step workflow from discovery to appointment arrival.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 border-b border-border">
          {[
            {
              step: '01',
              title: 'FIND',
              subtitle: 'Accredited Centers',
              desc: 'Locate certified clinical scan facilities by city, address, and equipment capabilities.',
            },
            {
              step: '02',
              title: 'CHOOSE',
              subtitle: 'Diagnostic Modality',
              desc: 'Select from comprehensive scan types including high-resolution MRI, CT, and pathology.',
            },
            {
              step: '03',
              title: 'BOOK',
              subtitle: 'Guaranteed Time Slot',
              desc: 'Select your preferred date and exact time slot with instant database slot reservation.',
            },
            {
              step: '04',
              title: 'VISIT',
              subtitle: 'Direct Walk-in Check-in',
              desc: 'Arrive directly at the facility with your booking confirmation code without waiting.',
            },
          ].map((item, idx) => (
            <div
              key={idx}
              className={`p-8 sm:p-10 border-r border-border last:border-r-0 hover:bg-bg-alt/40 transition-colors ${
                idx % 2 !== 0 ? 'border-l sm:border-l-0' : ''
              }`}
            >
              <span className="font-display font-light text-5xl sm:text-6xl text-ink-faint block mb-8">
                {item.step}
              </span>
              <h3 className="font-display font-extrabold text-2xl tracking-tight text-ink mb-1">
                {item.title}
              </h3>
              <div className="text-2xs font-mono text-accent uppercase tracking-widest font-semibold mb-4">
                {item.subtitle}
              </div>
              <p className="text-xs text-ink-muted font-light leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ------------------------------------------------------------- */}
      {/* FEATURED SCANS — Editorial Catalogue Preview */}
      {/* ------------------------------------------------------------- */}
      <section className="max-w-7xl mx-auto px-6">
        <div className="flex flex-col md:flex-row md:items-end justify-between pb-8 border-b border-border gap-4">
          <div>
            <span className="text-2xs font-mono uppercase tracking-widest text-accent block pb-2">
              Clinical Catalogue
            </span>
            <h2 className="font-display font-bold text-3xl sm:text-4xl uppercase tracking-tight text-ink">
              Featured Diagnostic Scans
            </h2>
          </div>
          <Link
            to="/scans"
            className="text-xs font-semibold uppercase tracking-widest text-ink hover:text-accent flex items-center gap-1.5 transition-colors"
          >
            <span>View Full Catalogue ({scans.length || 6}+ Tests)</span>
            <ArrowUpRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-px bg-border my-8 border border-border">
          {scans.map((scan) => (
            <div
              key={scan.id}
              className="bg-[#FAF8F5] p-8 sm:p-10 flex flex-col justify-between hover:bg-[#F3EFEA] transition-colors group"
            >
              <div className="space-y-4">
                <div className="flex items-center justify-between text-2xs font-mono uppercase tracking-widest text-ink-muted">
                  <span>Modality ID #{scan.id}</span>
                  <span className="flex items-center gap-1 text-ink font-semibold">
                    <Clock className="w-3.5 h-3.5 text-accent" />
                    {scan.duration_minutes} MIN
                  </span>
                </div>
                <h3 className="font-display font-bold text-2xl uppercase tracking-tight text-ink group-hover:text-accent transition-colors">
                  {scan.name}
                </h3>
                <p className="text-xs text-ink-muted font-light leading-relaxed line-clamp-2">
                  {scan.description}
                </p>
              </div>

              <div className="pt-8 border-t border-border mt-8 flex items-center justify-between">
                <div>
                  <span className="text-2xs font-mono text-ink-muted uppercase block">
                    Diagnostic Fee
                  </span>
                  <span className="font-display font-bold text-xl text-ink">
                    ${parseFloat(scan.price).toFixed(2)}
                  </span>
                </div>
                <Link
                  to={`/book?scan=${scan.id}`}
                  className="px-4 py-2 border border-ink text-2xs font-semibold uppercase tracking-widest text-ink hover:bg-ink hover:text-white transition-all"
                >
                  Schedule Slot
                </Link>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ------------------------------------------------------------- */}
      {/* DIAGNOSTIC CENTERS HIGHLIGHT */}
      {/* ------------------------------------------------------------- */}
      <section className="max-w-7xl mx-auto px-6">
        <div className="bg-ink text-[#FAF8F5] p-8 sm:p-16 border border-ink">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            <div className="lg:col-span-5 space-y-6">
              <span className="text-2xs font-mono uppercase tracking-widest text-accent-light block">
                Network Facilities
              </span>
              <h2 className="font-display font-extrabold text-3xl sm:text-5xl uppercase tracking-tight text-white leading-tight">
                Verified Clinical Diagnostic Centers
              </h2>
              <p className="text-sm text-ink-faint font-light leading-relaxed">
                Our partnered facilities operate state-of-the-art imaging equipment maintained under
                strict clinical calibration schedules.
              </p>
              <div className="pt-2">
                <Link
                  to="/centers"
                  className="px-6 py-3.5 bg-[#FAF8F5] text-ink font-sans text-xs font-bold uppercase tracking-widest hover:bg-accent hover:text-white transition-all inline-flex items-center gap-2"
                >
                  <span>Browse All Centers</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>

            <div className="lg:col-span-7 space-y-4">
              {centers.map((center, idx) => (
                <div
                  key={center.id}
                  className="p-6 border border-white/10 bg-white/5 hover:bg-white/10 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                >
                  <div>
                    <span className="text-2xs font-mono text-accent-light uppercase block">
                      {center.city}
                    </span>
                    <h4 className="font-display font-bold text-lg text-white uppercase tracking-tight">
                      {center.name}
                    </h4>
                    <p className="text-xs text-ink-faint font-light mt-0.5">{center.address}</p>
                  </div>
                  <Link
                    to={`/centers/${center.id}`}
                    className="self-start sm:self-auto px-4 py-2 border border-white/20 text-white text-2xs font-semibold uppercase tracking-wider hover:bg-white hover:text-ink transition-all"
                  >
                    View Center
                  </Link>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ------------------------------------------------------------- */}
      {/* FINAL CALL TO ACTION */}
      {/* ------------------------------------------------------------- */}
      <section className="max-w-7xl mx-auto px-6 text-center">
        <div className="py-20 border-y border-ink space-y-8">
          <span className="text-2xs font-mono uppercase tracking-widest text-accent font-semibold block">
            Direct Online Scheduling
          </span>
          <h2 className="font-display font-black text-4xl sm:text-6xl md:text-7xl uppercase tracking-tightest text-ink max-w-4xl mx-auto leading-tight">
            Ready to arrange your scan?
          </h2>
          <p className="text-sm text-ink-muted font-light max-w-md mx-auto">
            Book an appointment in less than 2 minutes. Instant confirmation and zero wait times.
          </p>
          <div className="pt-4">
            <Link
              to="/book"
              className="px-10 py-5 bg-accent text-white font-sans text-xs font-bold uppercase tracking-widest hover:bg-accent-dark transition-all duration-300 inline-flex items-center gap-3 shadow-xl group"
            >
              <span>Book Your Diagnostic Appointment</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};
