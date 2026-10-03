import React from 'react';
import { useLocation, Link, Navigate } from 'react-router-dom';
import { Appointment } from '../types';
import { StatusBadge } from '../components/common/StatusBadge';
import { ArrowRight, Calendar, Clock, MapPin, CheckCircle2, ArrowLeft } from 'lucide-react';

export const BookingConfirmationPage: React.FC = () => {
  const location = useLocation();
  const appointment = (location.state as { appointment?: Appointment } | null)?.appointment;

  if (!appointment) {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <div className="max-w-4xl mx-auto px-6 py-16 space-y-12">
      {/* Oversized Editorial Confirmation Header */}
      <div className="border-b border-ink pb-8 space-y-4">
        <div className="flex items-center gap-2 text-2xs font-mono uppercase tracking-widest text-accent font-semibold">
          <CheckCircle2 className="w-4 h-4 text-accent" />
          <span>Slot Successfully Reserved & Confirmed</span>
        </div>

        <h1 className="font-display font-black text-6xl sm:text-8xl md:text-9xl uppercase tracking-tightest text-ink leading-none">
          Booked.
        </h1>

        <p className="text-sm text-ink-muted font-light max-w-lg">
          Your diagnostic scan has been atomically registered in the database. Please present your
          booking receipt ID at the facility front desk upon arrival.
        </p>
      </div>

      {/* Confirmation Receipt Slip */}
      <div className="border border-ink bg-[#FAF8F5] p-8 sm:p-12 space-y-8 shadow-xl">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-border pb-6">
          <div>
            <span className="text-2xs font-mono uppercase tracking-widest text-ink-muted block">
              Appointment Reference
            </span>
            <span className="font-mono font-bold text-2xl text-ink">
              REC-#{String(appointment.id).padStart(6, '0')}
            </span>
          </div>
          <StatusBadge status={appointment.status} />
        </div>

        {/* Details Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 text-xs">
          <div className="space-y-1">
            <span className="text-2xs font-mono uppercase tracking-widest text-ink-muted block">
              Patient Account
            </span>
            <span className="font-bold text-sm text-ink">{appointment.patient_username}</span>
          </div>

          <div className="space-y-1">
            <span className="text-2xs font-mono uppercase tracking-widest text-ink-muted block">
              Diagnostic Modality
            </span>
            <span className="font-bold text-sm text-ink">{appointment.scan_type?.name || 'Scan'}</span>
            <span className="text-ink-muted font-mono block">
              {appointment.scan_type?.duration_minutes} Mins • ${parseFloat(appointment.scan_type?.price || '0').toFixed(2)}
            </span>
          </div>

          <div className="space-y-1">
            <span className="text-2xs font-mono uppercase tracking-widest text-ink-muted block">
              Diagnostic Center
            </span>
            <span className="font-bold text-sm text-ink">{appointment.diagnostic_center?.name}</span>
            <span className="text-ink-muted block font-light">
              {appointment.diagnostic_center?.address}, {appointment.diagnostic_center?.city}
            </span>
            <span className="text-ink-muted font-mono block">
              {appointment.diagnostic_center?.contact_number}
            </span>
          </div>

          <div className="space-y-1">
            <span className="text-2xs font-mono uppercase tracking-widest text-ink-muted block">
              Scheduled Date & Time Slot
            </span>
            <span className="font-mono font-bold text-lg text-ink block">
              {appointment.appointment_date} @ {appointment.start_time.substring(0, 5)}
            </span>
            <span className="text-2xs font-mono text-accent uppercase font-semibold">
              Confirmed Slot (No Duplicate Bookings)
            </span>
          </div>
        </div>

        {/* Action CTAs */}
        <div className="pt-8 border-t border-border flex flex-col sm:flex-row items-center justify-between gap-4">
          <Link
            to="/dashboard"
            className="w-full sm:w-auto px-8 py-3.5 bg-ink text-white text-xs font-semibold uppercase tracking-widest hover:bg-accent transition-colors flex items-center justify-center gap-2 group"
          >
            <span>View My Appointments</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>

          <Link
            to="/book"
            className="w-full sm:w-auto px-6 py-3.5 border border-ink text-ink text-xs font-semibold uppercase tracking-widest hover:bg-bg-alt transition-colors text-center"
          >
            Book Another Appointment
          </Link>
        </div>
      </div>
    </div>
  );
};
