import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { centersApi } from '../api/centers';
import { scansApi } from '../api/scans';
import { DiagnosticCenter, ScanType } from '../types';
import { MapPin, Phone, ArrowLeft, ArrowRight, ShieldCheck, Clock, Calendar } from 'lucide-react';
import { Skeleton } from '../components/common/Skeleton';

export const CenterDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [center, setCenter] = useState<DiagnosticCenter | null>(null);
  const [scans, setScans] = useState<ScanType[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      if (!id) return;
      try {
        const [cData, sData] = await Promise.all([
          centersApi.getById(parseInt(id, 10)),
          scansApi.getAll(),
        ]);
        setCenter(cData);
        setScans(sData);
      } catch (err) {
        console.error('Error fetching center details:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-6 py-12 space-y-8">
        <Skeleton className="h-6 w-32" />
        <Skeleton className="h-16 w-3/4" />
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <Skeleton className="lg:col-span-8 h-96" />
          <Skeleton className="lg:col-span-4 h-96" />
        </div>
      </div>
    );
  }

  if (!center) {
    return (
      <div className="max-w-7xl mx-auto px-6 py-24 text-center space-y-6">
        <h2 className="font-display font-bold text-3xl uppercase tracking-tight text-ink">
          Center Not Found
        </h2>
        <p className="text-xs text-ink-muted">The requested diagnostic facility could not be located.</p>
        <Link
          to="/centers"
          className="inline-flex items-center gap-2 px-6 py-3 bg-ink text-white text-xs font-semibold uppercase tracking-wider"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Directory</span>
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-6 py-12 space-y-16">
      {/* Top back navigation */}
      <div>
        <Link
          to="/centers"
          className="inline-flex items-center gap-2 text-xs font-mono uppercase tracking-widest text-ink-muted hover:text-ink transition-colors group"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          <span>Return to Centers Catalogue</span>
        </Link>
      </div>

      {/* Hero Presentation */}
      <div className="border-b border-ink pb-12 grid grid-cols-1 lg:grid-cols-12 gap-12 items-end">
        <div className="lg:col-span-8 space-y-4">
          <div className="flex items-center gap-3">
            <span className="px-3 py-1 bg-ink text-white text-2xs font-mono uppercase tracking-widest">
              {center.city}
            </span>
            <span className="text-2xs font-mono uppercase tracking-widest text-accent font-semibold">
              Accredited Clinical Lab #{center.id}
            </span>
          </div>

          <h1 className="font-display font-extrabold text-4xl sm:text-6xl uppercase tracking-tight text-ink">
            {center.name}
          </h1>

          <div className="pt-2 flex flex-wrap items-center gap-6 text-xs text-ink-muted">
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-accent" />
              <span>{center.address}, {center.city}</span>
            </div>
            <div className="flex items-center gap-2 font-mono">
              <Phone className="w-4 h-4 text-accent" />
              <span>{center.contact_number}</span>
            </div>
          </div>
        </div>

        {/* Quick Booking CTA Box */}
        <div className="lg:col-span-4 bg-ink text-white p-8 border border-ink space-y-6">
          <div className="text-2xs font-mono uppercase tracking-widest text-accent-light">
            Direct Scheduling
          </div>
          <p className="text-xs text-ink-faint font-light leading-relaxed">
            Reserve your clinical scan slot directly at this location with guaranteed non-conflicting
            timing.
          </p>
          <Link
            to={`/book?center=${center.id}`}
            className="w-full py-4 bg-accent text-white font-sans text-xs font-bold uppercase tracking-widest hover:bg-accent-dark transition-all flex items-center justify-center gap-2 group"
          >
            <span>Schedule at This Center</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>
      </div>

      {/* Available Modalities Catalogue at This Center */}
      <div className="space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between pb-6 border-b border-border gap-4">
          <div>
            <span className="text-2xs font-mono uppercase tracking-widest text-accent block pb-1">
              Available Modalities
            </span>
            <h2 className="font-display font-bold text-2xl sm:text-3xl uppercase tracking-tight text-ink">
              Clinical Tests Offered at {center.name}
            </h2>
          </div>
          <span className="text-2xs font-mono uppercase tracking-widest text-ink-muted">
            {scans.length} Procedures Available
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {scans.map((scan) => (
            <div
              key={scan.id}
              className="p-8 border border-border bg-[#FAF8F5] hover:border-ink transition-all flex flex-col justify-between group"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between text-2xs font-mono uppercase tracking-widest text-ink-muted">
                  <span>Modality ID #{scan.id}</span>
                  <span className="flex items-center gap-1 text-ink font-semibold">
                    <Clock className="w-3.5 h-3.5 text-accent" />
                    {scan.duration_minutes} Mins
                  </span>
                </div>
                <h3 className="font-display font-bold text-xl uppercase tracking-tight text-ink group-hover:text-accent transition-colors">
                  {scan.name}
                </h3>
                <p className="text-xs text-ink-muted font-light leading-relaxed">
                  {scan.description}
                </p>
              </div>

              <div className="pt-6 border-t border-border mt-6 flex items-center justify-between">
                <div>
                  <span className="text-2xs font-mono text-ink-muted uppercase block">
                    Diagnostic Fee
                  </span>
                  <span className="font-display font-bold text-lg text-ink">
                    ${parseFloat(scan.price).toFixed(2)}
                  </span>
                </div>
                <Link
                  to={`/book?center=${center.id}&scan=${scan.id}`}
                  className="px-5 py-2.5 bg-ink text-white text-2xs font-semibold uppercase tracking-widest hover:bg-accent transition-colors flex items-center gap-1.5"
                >
                  <span>Book This Scan</span>
                  <ArrowRight className="w-3 h-3" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
