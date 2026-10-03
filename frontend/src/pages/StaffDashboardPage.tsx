import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { centersApi } from '../api/centers';
import { scansApi } from '../api/scans';
import { appointmentsApi } from '../api/appointments';
import { DiagnosticCenter, ScanType, Appointment } from '../types';
import { StatusBadge } from '../components/common/StatusBadge';
import { CardSkeleton } from '../components/common/Skeleton';
import {
  ShieldCheck,
  Building2,
  Activity,
  CalendarCheck,
  Plus,
  ArrowRight,
  Search,
} from 'lucide-react';

export const StaffDashboardPage: React.FC = () => {
  const [centers, setCenters] = useState<DiagnosticCenter[]>([]);
  const [scans, setScans] = useState<ScanType[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>('ALL');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [cData, sData, aData] = await Promise.all([
          centersApi.getAll(),
          scansApi.getAll(),
          appointmentsApi.getAll(),
        ]);
        setCenters(cData);
        setScans(sData);
        setAppointments(aData);
      } catch (err) {
        console.error('Error fetching staff metrics:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const filteredAppointments = appointments.filter((a) => {
    if (statusFilter === 'ALL') return true;
    return a.status === statusFilter;
  });

  return (
    <div className="max-w-7xl mx-auto px-6 py-12 space-y-16">
      {/* Editorial Staff Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between pb-8 border-b border-ink gap-6">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-accent" />
            <span className="text-2xs font-mono uppercase tracking-widest text-accent font-semibold">
              Staff Administration Portal
            </span>
          </div>
          <h1 className="font-display font-extrabold text-4xl sm:text-6xl uppercase tracking-tight text-ink">
            Executive Overview
          </h1>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <Link
            to="/staff/centers"
            className="px-4 py-2.5 bg-ink text-white text-2xs font-mono uppercase tracking-widest hover:bg-accent transition-colors flex items-center gap-2"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Manage Centers</span>
          </Link>
          <Link
            to="/staff/scans"
            className="px-4 py-2.5 border border-ink text-ink text-2xs font-mono uppercase tracking-widest hover:bg-ink hover:text-white transition-colors flex items-center gap-2"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Manage Scan Types</span>
          </Link>
        </div>
      </div>

      {/* ------------------------------------------------------------- */}
      {/* OVERSIZED EDITORIAL METRICS TILES */}
      {/* ------------------------------------------------------------- */}
      <div className="grid grid-cols-1 md:grid-cols-3 border border-ink divide-y md:divide-y-0 md:divide-x divide-ink bg-[#FAF8F5]">
        {/* Metric 01: Centers */}
        <div className="p-8 sm:p-10 space-y-4 hover:bg-bg-alt/40 transition-colors">
          <div className="flex items-center justify-between text-2xs font-mono uppercase tracking-widest text-ink-muted">
            <span>Operational Facilities</span>
            <Building2 className="w-4 h-4 text-ink-muted" />
          </div>
          <div className="font-display font-black text-6xl sm:text-7xl text-ink">
            {loading ? '—' : String(centers.length).padStart(2, '0')}
          </div>
          <div className="text-xs uppercase tracking-widest text-ink font-bold flex items-center justify-between pt-4 border-t border-border">
            <span>Diagnostic Centers</span>
            <Link to="/staff/centers" className="text-accent hover:underline text-2xs font-mono">
              Configure &rarr;
            </Link>
          </div>
        </div>

        {/* Metric 02: Scan Types */}
        <div className="p-8 sm:p-10 space-y-4 hover:bg-bg-alt/40 transition-colors">
          <div className="flex items-center justify-between text-2xs font-mono uppercase tracking-widest text-ink-muted">
            <span>Clinical Modalities</span>
            <Activity className="w-4 h-4 text-ink-muted" />
          </div>
          <div className="font-display font-black text-6xl sm:text-7xl text-ink">
            {loading ? '—' : String(scans.length).padStart(2, '0')}
          </div>
          <div className="text-xs uppercase tracking-widest text-ink font-bold flex items-center justify-between pt-4 border-t border-border">
            <span>Diagnostic Tests</span>
            <Link to="/staff/scans" className="text-accent hover:underline text-2xs font-mono">
              Configure &rarr;
            </Link>
          </div>
        </div>

        {/* Metric 03: Total Appointments */}
        <div className="p-8 sm:p-10 space-y-4 hover:bg-bg-alt/40 transition-colors bg-ink text-[#FAF8F5]">
          <div className="flex items-center justify-between text-2xs font-mono uppercase tracking-widest text-accent-light">
            <span>System Bookings</span>
            <CalendarCheck className="w-4 h-4 text-accent-light" />
          </div>
          <div className="font-display font-black text-6xl sm:text-7xl text-white">
            {loading ? '—' : String(appointments.length).padStart(2, '0')}
          </div>
          <div className="text-xs uppercase tracking-widest text-white font-bold flex items-center justify-between pt-4 border-t border-border-dark">
            <span>Total Appointments</span>
            <span className="text-2xs font-mono text-accent-light">All Patients</span>
          </div>
        </div>
      </div>

      {/* ------------------------------------------------------------- */}
      {/* ALL APPOINTMENTS OVERSIGHT TABLE */}
      {/* ------------------------------------------------------------- */}
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-border">
          <div>
            <h2 className="font-display font-bold text-2xl uppercase tracking-tight text-ink">
              All Network Appointments
            </h2>
            <p className="text-xs text-ink-muted font-mono mt-0.5">
              Live oversight across all patients & facilities.
            </p>
          </div>

          {/* Status Filter Tabs */}
          <div className="flex items-center gap-2 overflow-x-auto">
            {['ALL', 'BOOKED', 'CANCELLED', 'COMPLETED'].map((st) => (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                className={`px-3 py-1 text-2xs font-mono uppercase tracking-widest border transition-all ${
                  statusFilter === st
                    ? 'bg-ink text-white border-ink'
                    : 'bg-bg-alt/50 text-ink-muted border-border hover:border-ink'
                }`}
              >
                {st}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="space-y-4">
            <CardSkeleton />
            <CardSkeleton />
          </div>
        ) : filteredAppointments.length === 0 ? (
          <div className="text-center py-16 border border-border bg-bg-alt/20">
            <p className="text-xs font-mono uppercase text-ink-muted">No appointments found matching filter.</p>
          </div>
        ) : (
          <div className="border border-border bg-[#FAF8F5] overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-bg-alt border-b border-border text-2xs font-mono uppercase tracking-widest text-ink-muted">
                <tr>
                  <th className="py-4 px-6">ID</th>
                  <th className="py-4 px-6">Patient</th>
                  <th className="py-4 px-6">Diagnostic Modality</th>
                  <th className="py-4 px-6">Facility</th>
                  <th className="py-4 px-6">Date & Slot</th>
                  <th className="py-4 px-6">Status</th>
                  <th className="py-4 px-6 text-right">Reference</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filteredAppointments.map((appt) => (
                  <tr key={appt.id} className="hover:bg-bg-alt/40 transition-colors">
                    <td className="py-4 px-6 font-mono font-bold text-ink">
                      #{String(appt.id).padStart(5, '0')}
                    </td>
                    <td className="py-4 px-6 font-semibold text-ink">
                      {appt.patient_username}
                    </td>
                    <td className="py-4 px-6">
                      <span className="font-bold text-ink block">{appt.scan_type?.name}</span>
                      <span className="text-2xs font-mono text-ink-muted">
                        ${parseFloat(appt.scan_type?.price || '0').toFixed(2)}
                      </span>
                    </td>
                    <td className="py-4 px-6">
                      <span className="text-ink font-semibold block">{appt.diagnostic_center?.name}</span>
                      <span className="text-2xs text-ink-muted font-mono">{appt.diagnostic_center?.city}</span>
                    </td>
                    <td className="py-4 px-6 font-mono">
                      <span className="font-bold text-ink block">{appt.appointment_date}</span>
                      <span className="text-2xs text-ink-muted">{appt.start_time.substring(0, 5)}</span>
                    </td>
                    <td className="py-4 px-6">
                      <StatusBadge status={appt.status} size="sm" />
                    </td>
                    <td className="py-4 px-6 text-right">
                      <Link
                        to={`/appointments/${appt.id}`}
                        className="px-3 py-1 border border-border text-2xs font-mono uppercase tracking-wider text-ink hover:border-ink hover:bg-bg-alt"
                      >
                        Inspect
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
