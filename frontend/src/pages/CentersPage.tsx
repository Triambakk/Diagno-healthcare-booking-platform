import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { centersApi } from '../api/centers';
import { DiagnosticCenter } from '../types';
import { CardSkeleton } from '../components/common/Skeleton';
import { Search, MapPin, Phone, ArrowRight, Building2 } from 'lucide-react';

export const CentersPage: React.FC = () => {
  const [centers, setCenters] = useState<DiagnosticCenter[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedCity, setSelectedCity] = useState<string>('ALL');

  useEffect(() => {
    const fetchCenters = async () => {
      try {
        const data = await centersApi.getAll();
        setCenters(data);
      } catch (err) {
        console.error('Error fetching centers:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchCenters();
  }, []);

  const cities = ['ALL', ...Array.from(new Set(centers.map((c) => c.city)))];

  const filteredCenters = centers.filter((c) => {
    const matchesSearch =
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.address.toLowerCase().includes(search.toLowerCase()) ||
      c.city.toLowerCase().includes(search.toLowerCase());
    const matchesCity = selectedCity === 'ALL' || c.city === selectedCity;
    return matchesSearch && matchesCity;
  });

  return (
    <div className="max-w-7xl mx-auto px-6 py-12 space-y-16">
      {/* Editorial Header */}
      <div className="border-b border-ink pb-8 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <span className="text-2xs font-mono uppercase tracking-widest text-accent font-semibold px-2.5 py-1 border border-accent/30">
            Directory Index
          </span>
          <span className="text-xs font-mono uppercase tracking-widest text-ink-muted">
            {filteredCenters.length} Facilities Listed
          </span>
        </div>

        <h1 className="font-display font-extrabold text-5xl sm:text-7xl uppercase tracking-tight text-ink">
          Diagnostic Centers
        </h1>

        <p className="text-sm text-ink-muted font-light max-w-xl leading-relaxed">
          Accredited imaging laboratories and diagnostic scan facilities certified for high-field MRI,
          computed tomography, ultrasonography, and pathology.
        </p>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-6 pb-6 border-b border-border">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-ink-muted absolute left-4 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by facility name, street, or city..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-[#FAF8F5] border border-border pl-11 pr-4 py-3 text-xs uppercase tracking-wider text-ink focus:outline-none focus:border-ink transition-colors placeholder:normal-case placeholder:text-ink-faint"
          />
        </div>

        {/* City Filter Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 md:pb-0">
          <span className="text-2xs font-mono uppercase text-ink-muted tracking-widest mr-2 flex-shrink-0">
            City:
          </span>
          {cities.map((city) => (
            <button
              key={city}
              onClick={() => setSelectedCity(city)}
              className={`px-3.5 py-1.5 text-2xs font-mono uppercase tracking-widest transition-all whitespace-nowrap border ${
                selectedCity === city
                  ? 'bg-ink text-white border-ink'
                  : 'bg-bg-alt/50 text-ink-muted border-border hover:border-ink hover:text-ink'
              }`}
            >
              {city}
            </button>
          ))}
        </div>
      </div>

      {/* Directory Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <CardSkeleton />
          <CardSkeleton />
          <CardSkeleton />
        </div>
      ) : filteredCenters.length === 0 ? (
        <div className="text-center py-24 border border-border bg-bg-alt/20 space-y-4">
          <Building2 className="w-10 h-10 mx-auto text-ink-muted" />
          <h3 className="font-display font-bold text-2xl uppercase tracking-tight text-ink">
            No Diagnostic Centers Found
          </h3>
          <p className="text-xs text-ink-muted max-w-sm mx-auto font-light">
            No facilities matched your search parameters. Try clearing your filters.
          </p>
          <button
            onClick={() => {
              setSearch('');
              setSelectedCity('ALL');
            }}
            className="mt-4 px-6 py-2.5 border border-ink text-xs font-semibold uppercase tracking-wider text-ink hover:bg-ink hover:text-white transition-all"
          >
            Reset Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredCenters.map((center, index) => (
            <div
              key={center.id}
              className="border border-border bg-[#FAF8F5] p-8 flex flex-col justify-between hover:border-ink transition-all duration-300 group relative"
            >
              <div className="space-y-6">
                <div className="flex items-center justify-between border-b border-border pb-4">
                  <span className="font-mono text-2xs font-bold text-accent uppercase tracking-widest">
                    #{String(index + 1).padStart(2, '0')}
                  </span>
                  <span className="text-2xs font-mono uppercase tracking-widest px-2 py-0.5 bg-bg-subtle text-ink font-semibold">
                    {center.city}
                  </span>
                </div>

                <div className="space-y-2">
                  <h3 className="font-display font-extrabold text-2xl uppercase tracking-tight text-ink group-hover:text-accent transition-colors">
                    {center.name}
                  </h3>
                  <div className="flex items-start gap-2 text-xs text-ink-muted font-light pt-1">
                    <MapPin className="w-4 h-4 text-ink-muted flex-shrink-0 mt-0.5" />
                    <span>{center.address}, {center.city}</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-ink-muted font-mono pt-1">
                    <Phone className="w-3.5 h-3.5 text-ink-muted flex-shrink-0" />
                    <span>{center.contact_number}</span>
                  </div>
                </div>
              </div>

              <div className="pt-8 border-t border-border mt-8 grid grid-cols-2 gap-3">
                <Link
                  to={`/centers/${center.id}`}
                  className="py-2.5 text-center text-2xs font-semibold uppercase tracking-widest border border-border text-ink hover:border-ink hover:bg-bg-alt transition-colors"
                >
                  View Details
                </Link>
                <Link
                  to={`/book?center=${center.id}`}
                  className="py-2.5 bg-ink text-white text-center text-2xs font-semibold uppercase tracking-widest hover:bg-accent transition-colors flex items-center justify-center gap-1 group/btn"
                >
                  <span>Book Scan</span>
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
