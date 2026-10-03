import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { appointmentsApi } from '../api/appointments';
import { Appointment } from '../types';
import { StatusBadge } from '../components/common/StatusBadge';
import { Button } from '../components/common/Button';
import { Modal } from '../components/common/Modal';
import { Skeleton } from '../components/common/Skeleton';
import { useToast } from '../context/ToastContext';
import { getErrorMessage } from '../api/client';
import {
  ArrowLeft,
  Calendar,
  Clock,
  MapPin,
  Phone,
  AlertTriangle,
  FileCheck,
  CheckCircle2,
} from 'lucide-react';

export const AppointmentDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [appointment, setAppointment] = useState<Appointment | null>(null);
  const [loading, setLoading] = useState(true);
  const [cancelModalOpen, setCancelModalOpen] = useState(false);
  const [cancelling, setCancelling] = useState(false);

  const fetchAppointment = async () => {
    if (!id) return;
    setLoading(true);
    try {
      const data = await appointmentsApi.getById(parseInt(id, 10));
      setAppointment(data);
    } catch (err) {
      const msg = getErrorMessage(err);
      showToast(msg, 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAppointment();
  }, [id]);

  const handleConfirmCancel = async () => {
    if (!appointment) return;
    setCancelling(true);
    try {
      await appointmentsApi.cancel(appointment.id);
      showToast('Appointment cancelled. The time slot has been freed.', 'success');
      setCancelModalOpen(false);
      await fetchAppointment();
    } catch (err) {
      const msg = getErrorMessage(err);
      showToast(msg, 'error');
    } finally {
      setCancelling(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-6 py-12 space-y-8">
        <Skeleton className="h-6 w-32" />
        <Skeleton className="h-16 w-3/4" />
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  if (!appointment) {
    return (
      <div className="max-w-4xl mx-auto px-6 py-24 text-center space-y-6">
        <h2 className="font-display font-bold text-3xl uppercase tracking-tight text-ink">
          Appointment Not Found
        </h2>
        <p className="text-xs text-ink-muted">
          The requested appointment record could not be retrieved.
        </p>
        <Link
          to="/dashboard"
          className="inline-flex items-center gap-2 px-6 py-3 bg-ink text-white text-xs font-semibold uppercase tracking-wider"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Return to Dashboard</span>
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-6 py-12 space-y-12">
      {/* Back Link */}
      <div>
        <Link
          to="/dashboard"
          className="inline-flex items-center gap-2 text-xs font-mono uppercase tracking-widest text-ink-muted hover:text-ink transition-colors group"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          <span>Return to Appointments Dashboard</span>
        </Link>
      </div>

      {/* Header */}
      <div className="border-b border-ink pb-8 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <span className="text-2xs font-mono uppercase tracking-widest text-accent font-semibold px-2.5 py-1 border border-accent/30">
            Receipt Verification
          </span>
          <StatusBadge status={appointment.status} />
        </div>

        <h1 className="font-display font-black text-4xl sm:text-6xl uppercase tracking-tightest text-ink">
          Appointment #{String(appointment.id).padStart(5, '0')}
        </h1>

        <p className="text-xs font-mono text-ink-muted uppercase tracking-wider">
          Patient Account: <span className="font-bold text-ink">{appointment.patient_username}</span> •
          Created on {new Date(appointment.created_at).toLocaleDateString()}
        </p>
      </div>

      {/* Receipt Card */}
      <div className="border border-ink bg-[#FAF8F5] p-8 sm:p-12 space-y-10 shadow-xl">
        {/* Scheduled Slot Highlight */}
        <div className="p-6 bg-ink text-white border border-ink flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <span className="text-2xs font-mono uppercase tracking-widest text-accent-light block">
              Confirmed Schedule
            </span>
            <div className="font-display font-bold text-2xl sm:text-3xl uppercase tracking-tight text-white mt-1">
              {appointment.appointment_date}
            </div>
          </div>
          <div className="sm:text-right">
            <span className="text-2xs font-mono uppercase tracking-widest text-ink-faint block">
              Slot Time
            </span>
            <div className="font-mono font-bold text-xl sm:text-2xl text-accent-light">
              {appointment.start_time.substring(0, 5)}
            </div>
          </div>
        </div>

        {/* Detailed Metadata Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 text-xs border-y border-border py-8">
          {/* Diagnostic Modality */}
          <div className="space-y-2">
            <span className="text-2xs font-mono uppercase tracking-widest text-ink-muted block">
              Diagnostic Modality / Test
            </span>
            <h3 className="font-display font-bold text-xl uppercase tracking-tight text-ink">
              {appointment.scan_type?.name}
            </h3>
            <p className="text-ink-muted font-light leading-relaxed">
              {appointment.scan_type?.description}
            </p>
            <div className="pt-2 text-2xs font-mono text-ink-muted">
              Procedure Duration: {appointment.scan_type?.duration_minutes} Minutes
            </div>
          </div>

          {/* Diagnostic Facility */}
          <div className="space-y-2">
            <span className="text-2xs font-mono uppercase tracking-widest text-ink-muted block">
              Diagnostic Center Facility
            </span>
            <h3 className="font-display font-bold text-xl uppercase tracking-tight text-ink">
              {appointment.diagnostic_center?.name}
            </h3>
            <div className="flex items-start gap-2 text-ink-muted font-light">
              <MapPin className="w-4 h-4 text-accent flex-shrink-0 mt-0.5" />
              <span>
                {appointment.diagnostic_center?.address}, {appointment.diagnostic_center?.city}
              </span>
            </div>
            <div className="flex items-center gap-2 font-mono text-ink-muted pt-1">
              <Phone className="w-3.5 h-3.5 text-accent flex-shrink-0" />
              <span>{appointment.diagnostic_center?.contact_number}</span>
            </div>
          </div>
        </div>

        {/* Price & Billing */}
        <div className="flex items-center justify-between">
          <div>
            <span className="text-2xs font-mono uppercase tracking-widest text-ink-muted block">
              Total Diagnostic Fee
            </span>
            <span className="font-display font-black text-3xl text-ink">
              ${parseFloat(appointment.scan_type?.price || '0').toFixed(2)}
            </span>
          </div>

          {appointment.status === 'BOOKED' && (
            <Button
              variant="outline"
              size="md"
              onClick={() => setCancelModalOpen(true)}
              className="border-accent text-accent hover:bg-accent hover:text-white hover:border-accent"
            >
              Cancel This Appointment
            </Button>
          )}
        </div>
      </div>

      {/* Cancellation Modal */}
      <Modal
        isOpen={cancelModalOpen}
        onClose={() => setCancelModalOpen(false)}
        title="Cancel Appointment"
        subtitle={`Ref #${appointment.id}`}
      >
        <div className="space-y-6">
          <div className="flex items-start gap-3 p-4 bg-accent/10 border border-accent text-accent text-xs font-light leading-relaxed">
            <AlertTriangle className="w-5 h-5 flex-shrink-0 mt-0.5" />
            <div>
              Are you sure you want to cancel this appointment for{' '}
              <strong className="font-bold">{appointment.scan_type?.name}</strong> on{' '}
              <strong className="font-bold">{appointment.appointment_date}</strong>? The time slot will
              be released immediately.
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-border">
            <Button
              variant="outline"
              size="md"
              onClick={() => setCancelModalOpen(false)}
              disabled={cancelling}
            >
              Nevermind
            </Button>
            <Button
              variant="danger"
              size="md"
              onClick={handleConfirmCancel}
              loading={cancelling}
            >
              Confirm Cancellation
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
