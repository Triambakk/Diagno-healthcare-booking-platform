import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { appointmentsApi } from '../api/appointments';
import { Appointment } from '../types';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { StatusBadge } from '../components/common/StatusBadge';
import { Button } from '../components/common/Button';
import { Modal } from '../components/common/Modal';
import { CardSkeleton } from '../components/common/Skeleton';
import { getErrorMessage } from '../api/client';
import {
  Calendar,
  Clock,
  MapPin,
  ArrowRight,
  Plus,
  AlertTriangle,
  FileText,
  CalendarX2,
} from 'lucide-react';

export const PatientDashboardPage: React.FC = () => {
  const { user } = useAuth();
  const { showToast } = useToast();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Cancellation modal state
  const [cancelModalOpen, setCancelModalOpen] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  const [cancelling, setCancelling] = useState(false);

  const fetchAppointments = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await appointmentsApi.getAll();
      setAppointments(data);
    } catch (err) {
      const msg = getErrorMessage(err);
      setError(msg);
      showToast(msg, 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAppointments();
  }, []);

  const handleCancelClick = (appt: Appointment) => {
    setSelectedAppointment(appt);
    setCancelModalOpen(true);
  };

  const handleConfirmCancel = async () => {
    if (!selectedAppointment) return;
    setCancelling(true);
    try {
      await appointmentsApi.cancel(selectedAppointment.id);
      showToast('Appointment cancelled successfully. Slot freed.', 'success');
      setCancelModalOpen(false);
      setSelectedAppointment(null);
      await fetchAppointments();
    } catch (err) {
      const msg = getErrorMessage(err);
      showToast(msg, 'error');
    } finally {
      setCancelling(false);
    }
  };

  // Find next upcoming active appointment
  const upcomingAppointment = appointments.find(
    (a) => a.status === 'BOOKED' && new Date(a.appointment_date) >= new Date()
  );

  return (
    <div className="max-w-7xl mx-auto px-6 py-12 space-y-16">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between pb-8 border-b border-ink gap-6">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-accent inline-block"></span>
            <span className="text-2xs font-mono uppercase tracking-widest text-ink-muted">
              Patient Portal • {user?.username}
            </span>
          </div>
          <h1 className="font-display font-extrabold text-4xl sm:text-6xl uppercase tracking-tight text-ink">
            My Appointments
          </h1>
        </div>

        <Link
          to="/book"
          className="px-6 py-3.5 bg-ink text-white text-xs font-semibold uppercase tracking-widest hover:bg-accent transition-colors inline-flex items-center gap-2 self-start md:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Book New Scan</span>
        </Link>
      </div>

      {/* ------------------------------------------------------------- */}
      {/* NEXT UPCOMING APPOINTMENT BANNER (Editorial Highlight) */}
      {/* ------------------------------------------------------------- */}
      {upcomingAppointment && (
        <div className="border border-ink bg-ink text-[#FAF8F5] p-8 sm:p-12 space-y-8 relative overflow-hidden">
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/15 pb-6">
            <span className="text-2xs font-mono uppercase tracking-widest text-accent-light font-semibold">
              Next Scheduled Appointment
            </span>
            <StatusBadge status={upcomingAppointment.status} />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Big Date & Time (Span 5) */}
            <div className="lg:col-span-5 space-y-2">
              <span className="font-display font-black text-4xl sm:text-6xl uppercase tracking-tight text-white block">
                {new Date(upcomingAppointment.appointment_date).toLocaleDateString('en-US', {
                  day: 'numeric',
                  month: 'short',
                })}
              </span>
              <span className="font-mono text-xl sm:text-2xl text-accent-light font-bold block">
                {upcomingAppointment.start_time.substring(0, 5)}
              </span>
            </div>

            {/* Test and Center Info (Span 5) */}
            <div className="lg:col-span-5 space-y-3">
              <h3 className="font-display font-bold text-2xl uppercase tracking-tight text-white">
                {upcomingAppointment.scan_type?.name}
              </h3>
              <div className="flex items-center gap-2 text-xs text-ink-faint font-light">
                <MapPin className="w-4 h-4 text-accent-light flex-shrink-0" />
                <span>
                  {upcomingAppointment.diagnostic_center?.name} (
                  {upcomingAppointment.diagnostic_center?.city})
                </span>
              </div>
              <p className="text-2xs font-mono text-ink-subtle">
                Duration: {upcomingAppointment.scan_type?.duration_minutes} Mins • Total Fee: $
                {parseFloat(upcomingAppointment.scan_type?.price || '0').toFixed(2)}
              </p>
            </div>

            {/* Action (Span 2) */}
            <div className="lg:col-span-2 flex flex-col gap-2">
              <Link
                to={`/appointments/${upcomingAppointment.id}`}
                className="py-2.5 px-4 bg-white text-ink text-center text-2xs font-semibold uppercase tracking-widest hover:bg-accent hover:text-white transition-all"
              >
                View Details
              </Link>
              <button
                onClick={() => handleCancelClick(upcomingAppointment)}
                className="py-2.5 px-4 border border-white/20 text-white text-center text-2xs font-semibold uppercase tracking-widest hover:border-accent hover:text-accent transition-colors"
              >
                Cancel Slot
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* ALL APPOINTMENTS CATALOGUE TABLE */}
      {/* ------------------------------------------------------------- */}
      <div className="space-y-6">
        <div className="flex items-center justify-between pb-4 border-b border-border">
          <h2 className="font-display font-bold text-2xl uppercase tracking-tight text-ink">
            Appointment History & Records
          </h2>
          <span className="text-xs font-mono uppercase tracking-widest text-ink-muted">
            {appointments.length} Total Bookings
          </span>
        </div>

        {loading ? (
          <div className="space-y-4">
            <CardSkeleton />
            <CardSkeleton />
          </div>
        ) : appointments.length === 0 ? (
          <div className="text-center py-20 border border-border bg-bg-alt/20 space-y-4">
            <CalendarX2 className="w-10 h-10 mx-auto text-ink-muted" />
            <h3 className="font-display font-bold text-2xl uppercase tracking-tight text-ink">
              No Appointments Found
            </h3>
            <p className="text-xs text-ink-muted font-light max-w-sm mx-auto">
              You haven't scheduled any diagnostic scans yet. Search available imaging centers to book
              your first slot.
            </p>
            <Link
              to="/book"
              className="inline-flex items-center gap-2 px-6 py-3 bg-ink text-white text-xs font-semibold uppercase tracking-wider hover:bg-accent transition-colors"
            >
              <span>Book Appointment Now</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        ) : (
          <div className="border border-border bg-[#FAF8F5] overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-bg-alt border-b border-border text-2xs font-mono uppercase tracking-widest text-ink-muted">
                <tr>
                  <th className="py-4 px-6">Ref ID</th>
                  <th className="py-4 px-6">Diagnostic Modality</th>
                  <th className="py-4 px-6">Center & Location</th>
                  <th className="py-4 px-6">Scheduled Time</th>
                  <th className="py-4 px-6">Status</th>
                  <th className="py-4 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {appointments.map((appt) => (
                  <tr key={appt.id} className="hover:bg-bg-alt/40 transition-colors">
                    <td className="py-5 px-6 font-mono font-bold text-ink">
                      #{String(appt.id).padStart(5, '0')}
                    </td>
                    <td className="py-5 px-6">
                      <span className="font-bold text-sm text-ink block">
                        {appt.scan_type?.name}
                      </span>
                      <span className="text-2xs font-mono text-ink-muted">
                        ${parseFloat(appt.scan_type?.price || '0').toFixed(2)}
                      </span>
                    </td>
                    <td className="py-5 px-6">
                      <span className="font-semibold text-ink block">
                        {appt.diagnostic_center?.name}
                      </span>
                      <span className="text-2xs text-ink-muted block font-light">
                        {appt.diagnostic_center?.city}
                      </span>
                    </td>
                    <td className="py-5 px-6 font-mono">
                      <span className="font-bold text-ink block">{appt.appointment_date}</span>
                      <span className="text-2xs text-ink-muted">
                        {appt.start_time.substring(0, 5)}
                      </span>
                    </td>
                    <td className="py-5 px-6">
                      <StatusBadge status={appt.status} size="sm" />
                    </td>
                    <td className="py-5 px-6 text-right space-x-2 whitespace-nowrap">
                      <Link
                        to={`/appointments/${appt.id}`}
                        className="px-3 py-1.5 border border-border text-2xs font-mono uppercase tracking-wider text-ink hover:border-ink hover:bg-bg-alt inline-block"
                      >
                        Details
                      </Link>
                      {appt.status === 'BOOKED' && (
                        <button
                          onClick={() => handleCancelClick(appt)}
                          className="px-3 py-1.5 border border-accent/30 text-2xs font-mono uppercase tracking-wider text-accent hover:bg-accent hover:text-white transition-colors"
                        >
                          Cancel
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ------------------------------------------------------------- */}
      {/* CANCELLATION CONFIRMATION MODAL */}
      {/* ------------------------------------------------------------- */}
      <Modal
        isOpen={cancelModalOpen}
        onClose={() => setCancelModalOpen(false)}
        title="Cancel Appointment"
        subtitle={`Reference #${selectedAppointment?.id}`}
      >
        <div className="space-y-6">
          <div className="flex items-start gap-3 p-4 bg-accent/10 border border-accent text-accent text-xs font-light leading-relaxed">
            <AlertTriangle className="w-5 h-5 flex-shrink-0 mt-0.5" />
            <div>
              Cancelling this appointment will immediately release the time slot for other patients.
              This action cannot be undone.
            </div>
          </div>

          <div className="p-4 bg-bg-alt border border-border space-y-2 text-xs font-mono">
            <div>
              <span className="text-ink-muted uppercase">Scan: </span>
              <span className="font-bold">{selectedAppointment?.scan_type?.name}</span>
            </div>
            <div>
              <span className="text-ink-muted uppercase">Center: </span>
              <span className="font-bold">{selectedAppointment?.diagnostic_center?.name}</span>
            </div>
            <div>
              <span className="text-ink-muted uppercase">Slot: </span>
              <span className="font-bold">
                {selectedAppointment?.appointment_date} @{' '}
                {selectedAppointment?.start_time.substring(0, 5)}
              </span>
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-border">
            <Button
              variant="outline"
              size="md"
              onClick={() => setCancelModalOpen(false)}
              disabled={cancelling}
            >
              Keep Appointment
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
