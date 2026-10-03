import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { scansApi } from '../api/scans';
import { ScanType } from '../types';
import { CardSkeleton } from '../components/common/Skeleton';
import { Search, Clock, ArrowRight, Activity, DollarSign } from 'lucide-react';

export const ScansPage: React.FC = () => {
  const [scans, setScans] = useState<ScanType[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    const fetchScans = async () => {
      try {
        const data = await scansApi.getAll();
        setScans(data);
      } catch (err) {
        console.error('Error loading scans:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchScans();
  }, []);

  const filteredScans = scans.filter(
    (s) =>
      s.name.toLowerCase().includes(search.toLowerCase()) ||
      s.description.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="max-w-7xl mx-auto px-6 py-12 space-y-16">
      {/* Editorial Header */}
      <div className="border-b border-ink pb-8 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <span className="text-2xs font-mono uppercase tracking-widest text-accent font-semibold px-2.5 py-1 border border-accent/30">
            Clinical Catalogue
          </span>
          <span className="text-xs font-mono uppercase tracking-widest text-ink-muted">
            {filteredScans.length} Modalities Available
          </span>
        </div>

        <h1 className="font-display font-extrabold text-5xl sm:text-7xl uppercase tracking-tight text-ink">
          Diagnostic Tests & Scans
        </h1>

        <p className="text-sm text-ink-muted font-light max-w-xl leading-relaxed">
          Comprehensive diagnostic imaging and clinical pathology procedures calibrated under certified
          radiological quality standards.
        </p>
      </div>

      {/* Search Bar */}
      <div className="flex items-center justify-between gap-6 pb-6 border-b border-border">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-ink-muted absolute left-4 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search scans (e.g. MRI, CT Scan, Ultrasound, Blood)..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-[#FAF8F5] border border-border pl-11 pr-4 py-3 text-xs uppercase tracking-wider text-ink focus:outline-none focus:border-ink transition-colors placeholder:normal-case placeholder:text-ink-faint"
          />
        </div>
      </div>

      {/* Scans Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <CardSkeleton />
          <CardSkeleton />
          <CardSkeleton />
        </div>
      ) : filteredScans.length === 0 ? (
        <div className="text-center py-24 border border-border bg-bg-alt/20 space-y-4">
          <Activity className="w-10 h-10 mx-auto text-ink-muted" />
          <h3 className="font-display font-bold text-2xl uppercase tracking-tight text-ink">
            No Tests Matching Search
          </h3>
          <p className="text-xs text-ink-muted max-w-sm mx-auto font-light">
            No diagnostic tests match your query. Try searching for a broader modality name.
          </p>
          <button
            onClick={() => setSearch('')}
            className="mt-4 px-6 py-2.5 border border-ink text-xs font-semibold uppercase tracking-wider text-ink hover:bg-ink hover:text-white transition-all"
          >
            Reset Search
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredScans.map((scan, index) => (
            <div
              key={scan.id}
              className="border border-border bg-[#FAF8F5] p-8 flex flex-col justify-between hover:border-ink transition-all duration-300 group relative"
            >
              <div className="space-y-6">
                <div className="flex items-center justify-between border-b border-border pb-4">
                  <span className="font-mono text-2xs font-bold text-accent uppercase tracking-widest">
                    #{String(index + 1).padStart(2, '0')}
                  </span>
                  <div className="flex items-center gap-1.5 text-2xs font-mono uppercase tracking-widest px-2.5 py-0.5 bg-bg-subtle text-ink font-semibold">
                    <Clock className="w-3 h-3 text-accent" />
                    <span>{scan.duration_minutes} Minutes</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <h3 className="font-display font-extrabold text-2xl uppercase tracking-tight text-ink group-hover:text-accent transition-colors">
                    {scan.name}
                  </h3>
                  <p className="text-xs text-ink-muted font-light leading-relaxed">
                    {scan.description}
                  </p>
                </div>
              </div>

              <div className="pt-8 border-t border-border mt-8 flex items-center justify-between">
                <div>
                  <span className="text-2xs font-mono text-ink-muted uppercase block">
                    Diagnostic Fee
                  </span>
                  <span className="font-display font-bold text-2xl text-ink">
                    ${parseFloat(scan.price).toFixed(2)}
                  </span>
                </div>
                <Link
                  to={`/book?scan=${scan.id}`}
                  className="px-5 py-2.5 bg-ink text-white text-2xs font-semibold uppercase tracking-widest hover:bg-accent transition-colors flex items-center gap-1.5 group/btn"
                >
                  <span>Book Test</span>
                  <ArrowRight className="w-3 h-3 group-hover/btn:translate-x-0.5 transition-transform" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
