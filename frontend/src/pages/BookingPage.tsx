import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { centersApi } from '../api/centers';
import { scansApi } from '../api/scans';
import { appointmentsApi } from '../api/appointments';
import { DiagnosticCenter, ScanType } from '../types';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { Button } from '../components/common/Button';
import { getErrorMessage } from '../api/client';
import {
  Building2,
  Activity,
  Calendar as CalendarIcon,
  Clock,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  AlertCircle,
  MapPin,
  Lock,
} from 'lucide-react';

const TIME_SLOTS = [
  '09:00:00',
  '10:00:00',
  '11:00:00',
  '12:00:00',
  '14:00:00',
  '15:00:00',
  '16:00:00',
  '17:00:00',
];

export const BookingPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const { showToast } = useToast();

  const [step, setStep] = useState<number>(1);
  const [centers, setCenters] = useState<DiagnosticCenter[]>([]);
  const [scans, setScans] = useState<ScanType[]>([]);
  const [loadingInitial, setLoadingInitial] = useState(true);

  // Selections
  const [selectedCenter, setSelectedCenter] = useState<DiagnosticCenter | null>(null);
  const [selectedScan, setSelectedScan] = useState<ScanType | null>(null);
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [selectedTime, setSelectedTime] = useState<string>('');

  // Submitting
  const [submitting, setSubmitting] = useState(false);
  const [bookingError, setBookingError] = useState<string | null>(null);

  // Compute minimum date (tomorrow)
  const tomorrowStr = new Date(Date.now() + 86400000).toISOString().split('T')[0];

  useEffect(() => {
    const loadData = async () => {
      try {
        const [cData, sData] = await Promise.all([centersApi.getAll(), scansApi.getAll()]);
        setCenters(cData);
        setScans(sData);

        // Check for pending booking stored in sessionStorage
        const savedPending = sessionStorage.getItem('pending_booking');
        if (savedPending) {
          try {
            const parsed = JSON.parse(savedPending);
            if (
              parsed &&
              typeof parsed.diagnostic_center === 'number' &&
              typeof parsed.scan_type === 'number' &&
              typeof parsed.appointment_date === 'string' &&
              typeof parsed.start_time === 'string'
            ) {
              const matchedCenter = cData.find((c) => c.id === parsed.diagnostic_center);
              const matchedScan = sData.find((s) => s.id === parsed.scan_type);

              if (matchedCenter && matchedScan) {
                setSelectedCenter(matchedCenter);
                setSelectedScan(matchedScan);
                setSelectedDate(parsed.appointment_date);
                setSelectedTime(parsed.start_time);
                setStep(5); // Restore to review/confirm step for explicit user review
                sessionStorage.removeItem('pending_booking');
                showToast('Restored your pending booking. Please review and confirm.', 'info');
                return;
              }
            }
          } catch (e) {
            console.error('Failed to parse pending booking from sessionStorage', e);
          }
          // Discard invalid / unmatchable pending booking
          sessionStorage.removeItem('pending_booking');
        }

        // Pre-select from search params
        const centerParam = searchParams.get('center');
        const scanParam = searchParams.get('scan');

        if (centerParam) {
          const matched = cData.find((c) => c.id === parseInt(centerParam, 10));
          if (matched) setSelectedCenter(matched);
        }

        if (scanParam) {
          const matched = sData.find((s) => s.id === parseInt(scanParam, 10));
          if (matched) setSelectedScan(matched);
        }

        // If both pre-selected, jump to date step
        if (centerParam && scanParam) {
          setStep(3);
        } else if (centerParam) {
          setStep(2);
        }
      } catch (err) {
        console.error('Error loading booking data:', err);
      } finally {
        setLoadingInitial(false);
      }
    };

    loadData();
  }, [searchParams, showToast]);

  const handleConfirmBooking = async () => {
    if (!selectedCenter || !selectedScan || !selectedDate || !selectedTime) {
      setBookingError('Please complete all selection steps before confirming.');
      return;
    }

    if (!isAuthenticated) {
      // Save state in session storage and redirect to login
      sessionStorage.setItem(
        'pending_booking',
        JSON.stringify({
          diagnostic_center: selectedCenter.id,
          scan_type: selectedScan.id,
          appointment_date: selectedDate,
          start_time: selectedTime,
        })
      );
      navigate('/login', { state: { from: { pathname: '/book' } } });
      return;
    }

    setSubmitting(true);
    setBookingError(null);

    try {
      const created = await appointmentsApi.create({
        diagnostic_center: selectedCenter.id,
        scan_type: selectedScan.id,
        appointment_date: selectedDate,
        start_time: selectedTime,
      });

      showToast('Appointment successfully reserved!', 'success');
      navigate('/booking-confirmation', { state: { appointment: created } });
    } catch (err) {
      const msg = getErrorMessage(err);
      setBookingError(msg);
      showToast(msg, 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const steps = [
    { num: 1, label: 'CENTER', done: !!selectedCenter },
    { num: 2, label: 'TEST', done: !!selectedScan },
    { num: 3, label: 'DATE', done: !!selectedDate },
    { num: 4, label: 'TIME', done: !!selectedTime },
    { num: 5, label: 'CONFIRM', done: false },
  ];

  return (
    <div className="max-w-7xl mx-auto px-6 py-12 space-y-12">
      {/* Header with Step Progress */}
      <div className="border-b border-ink pb-8 space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <span className="text-2xs font-mono uppercase tracking-widest text-accent font-semibold px-2.5 py-1 border border-accent/30">
            Reservation Engine
          </span>
          <span className="text-xs font-mono uppercase tracking-widest text-ink-muted">
            Step 0{step} of 05
          </span>
        </div>

        <h1 className="font-display font-extrabold text-4xl sm:text-6xl uppercase tracking-tight text-ink">
          Schedule Diagnostic Scan
        </h1>

        {/* Step Progress Bar */}
        <div className="grid grid-cols-5 gap-2 pt-4">
          {steps.map((s) => (
            <button
              key={s.num}
              onClick={() => {
                // Allow jumping back to previously completed steps
                if (s.num < step || s.done) setStep(s.num);
              }}
              className={`text-left p-3 border transition-all ${
                step === s.num
                  ? 'border-ink bg-ink text-white'
                  : s.done
                  ? 'border-border bg-bg-alt text-ink hover:border-ink'
                  : 'border-border bg-[#FAF8F5] text-ink-muted opacity-60'
              }`}
            >
              <div className="text-2xs font-mono font-bold tracking-widest">0{s.num}</div>
              <div className="text-xs font-semibold uppercase tracking-wider hidden sm:block mt-1 truncate">
                {s.label}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Main Booking Interface Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
        {/* Step Content (Span 8) */}
        <div className="lg:col-span-8 space-y-8">
          {/* STEP 1: SELECT CENTER */}
          {step === 1 && (
            <div className="space-y-6">
              <div>
                <span className="text-2xs font-mono uppercase tracking-widest text-accent font-semibold block pb-1">
                  Step 01
                </span>
                <h2 className="font-display font-bold text-2xl uppercase tracking-tight text-ink">
                  Select Diagnostic Facility
                </h2>
                <p className="text-xs text-ink-muted font-light mt-1">
                  Choose the certified imaging center convenient for your visit.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {centers.map((c) => (
                  <div
                    key={c.id}
                    onClick={() => {
                      setSelectedCenter(c);
                      setStep(2);
                    }}
                    className={`p-6 border cursor-pointer transition-all ${
                      selectedCenter?.id === c.id
                        ? 'border-ink bg-bg-alt ring-1 ring-ink'
                        : 'border-border bg-[#FAF8F5] hover:border-ink'
                    }`}
                  >
                    <span className="text-2xs font-mono uppercase text-accent font-semibold block">
                      {c.city}
                    </span>
                    <h4 className="font-display font-bold text-lg uppercase tracking-tight text-ink mt-1">
                      {c.name}
                    </h4>
                    <p className="text-xs text-ink-muted font-light mt-1 flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 flex-shrink-0" />
                      <span>{c.address}</span>
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* STEP 2: SELECT SCAN */}
          {step === 2 && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-2xs font-mono uppercase tracking-widest text-accent font-semibold block pb-1">
                    Step 02
                  </span>
                  <h2 className="font-display font-bold text-2xl uppercase tracking-tight text-ink">
                    Select Diagnostic Modality / Test
                  </h2>
                </div>
                <button
                  onClick={() => setStep(1)}
                  className="text-xs font-mono uppercase tracking-wider text-ink-muted hover:text-ink flex items-center gap-1"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Change Center</span>
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {scans.map((s) => (
                  <div
                    key={s.id}
                    onClick={() => {
                      setSelectedScan(s);
                      setStep(3);
                    }}
                    className={`p-6 border cursor-pointer transition-all ${
                      selectedScan?.id === s.id
                        ? 'border-ink bg-bg-alt ring-1 ring-ink'
                        : 'border-border bg-[#FAF8F5] hover:border-ink'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-2xs font-mono text-ink-muted uppercase">
                        {s.duration_minutes} Mins
                      </span>
                      <span className="font-display font-bold text-sm text-ink">
                        ${parseFloat(s.price).toFixed(2)}
                      </span>
                    </div>
                    <h4 className="font-display font-bold text-lg uppercase tracking-tight text-ink mt-2">
                      {s.name}
                    </h4>
                    <p className="text-xs text-ink-muted font-light mt-1 line-clamp-2">
                      {s.description}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* STEP 3: SELECT DATE */}
          {step === 3 && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-2xs font-mono uppercase tracking-widest text-accent font-semibold block pb-1">
                    Step 03
                  </span>
                  <h2 className="font-display font-bold text-2xl uppercase tracking-tight text-ink">
                    Select Appointment Date
                  </h2>
                </div>
                <button
                  onClick={() => setStep(2)}
                  className="text-xs font-mono uppercase tracking-wider text-ink-muted hover:text-ink flex items-center gap-1"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Change Test</span>
                </button>
              </div>

              <div className="p-8 border border-border bg-[#FAF8F5] space-y-6">
                <label className="block text-2xs font-mono uppercase tracking-widest text-ink-muted">
                  Choose Future Date (Calendar Picker)
                </label>
                <input
                  type="date"
                  min={tomorrowStr}
                  value={selectedDate}
                  onChange={(e) => {
                    setSelectedDate(e.target.value);
                    if (e.target.value) setStep(4);
                  }}
                  className="w-full sm:w-auto bg-white border border-ink p-4 font-mono text-base uppercase tracking-widest text-ink focus:outline-none focus:ring-1 focus:ring-ink"
                />
                <div className="flex items-center gap-2 text-xs font-mono text-accent uppercase tracking-wider">
                  <Clock className="w-3.5 h-3.5 flex-shrink-0" />
                  <span>Appointments must be booked at least 1 day in advance.</span>
                </div>
                <p className="text-xs font-mono text-ink-muted uppercase tracking-wider">
                  Same-day emergency walk-ins must contact the facility directly. Online slots are available from tomorrow onwards.
                </p>
              </div>
            </div>
          )}

          {/* STEP 4: SELECT TIME SLOT */}
          {step === 4 && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-2xs font-mono uppercase tracking-widest text-accent font-semibold block pb-1">
                    Step 04
                  </span>
                  <h2 className="font-display font-bold text-2xl uppercase tracking-tight text-ink">
                    Select Available Time Slot
                  </h2>
                  <p className="text-xs text-ink-muted font-mono mt-1">
                    Date: {selectedDate}
                  </p>
                </div>
                <button
                  onClick={() => setStep(3)}
                  className="text-xs font-mono uppercase tracking-wider text-ink-muted hover:text-ink flex items-center gap-1"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Change Date</span>
                </button>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {TIME_SLOTS.map((slot) => {
                  const display = slot.substring(0, 5);
                  const isSelected = selectedTime === slot;
                  return (
                    <button
                      key={slot}
                      onClick={() => {
                        setSelectedTime(slot);
                        setStep(5);
                      }}
                      className={`p-4 border font-mono text-sm uppercase tracking-widest font-semibold transition-all ${
                        isSelected
                          ? 'bg-ink text-white border-ink ring-1 ring-ink'
                          : 'bg-[#FAF8F5] text-ink border-border hover:border-ink hover:bg-bg-alt'
                      }`}
                    >
                      <Clock className="w-4 h-4 mx-auto mb-2 opacity-60" />
                      {display}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* STEP 5: REVIEW & CONFIRM */}
          {step === 5 && (
            <div className="space-y-6">
              <div>
                <span className="text-2xs font-mono uppercase tracking-widest text-accent font-semibold block pb-1">
                  Step 05
                </span>
                <h2 className="font-display font-bold text-2xl uppercase tracking-tight text-ink">
                  Review & Confirm Reservation
                </h2>
                <p className="text-xs text-ink-muted font-light mt-1">
                  Verify booking parameters before atomic slot registration.
                </p>
              </div>

              {bookingError && (
                <div className="p-4 bg-accent/10 border border-accent text-accent text-xs font-mono uppercase tracking-wide flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                  <div>{bookingError}</div>
                </div>
              )}

              {!isAuthenticated && (
                <div className="p-6 border border-ink bg-ink text-white space-y-3">
                  <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-accent-light">
                    <Lock className="w-4 h-4" />
                    <span>Authentication Required</span>
                  </div>
                  <p className="text-xs text-ink-faint font-light leading-relaxed">
                    You must be signed in to reserve appointment slots. Clicking confirm will take you to sign in with your selections preserved.
                  </p>
                </div>
              )}

              <div className="p-8 border border-ink bg-[#FAF8F5] space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-xs">
                  <div>
                    <span className="text-2xs font-mono uppercase tracking-widest text-ink-muted block pb-1">
                      Diagnostic Center
                    </span>
                    <span className="font-bold text-sm text-ink block">{selectedCenter?.name}</span>
                    <span className="text-ink-muted font-light">{selectedCenter?.address}, {selectedCenter?.city}</span>
                  </div>
                  <div>
                    <span className="text-2xs font-mono uppercase tracking-widest text-ink-muted block pb-1">
                      Scan Procedure
                    </span>
                    <span className="font-bold text-sm text-ink block">{selectedScan?.name}</span>
                    <span className="text-ink-muted font-mono">{selectedScan?.duration_minutes} Mins • ${parseFloat(selectedScan?.price || '0').toFixed(2)}</span>
                  </div>
                  <div>
                    <span className="text-2xs font-mono uppercase tracking-widest text-ink-muted block pb-1">
                      Scheduled Date
                    </span>
                    <span className="font-mono font-bold text-base text-ink block">{selectedDate}</span>
                  </div>
                  <div>
                    <span className="text-2xs font-mono uppercase tracking-widest text-ink-muted block pb-1">
                      Time Slot
                    </span>
                    <span className="font-mono font-bold text-base text-ink block">{selectedTime?.substring(0, 5)}</span>
                  </div>
                </div>

                <div className="pt-6 border-t border-border flex flex-col sm:flex-row items-center justify-between gap-4">
                  <button
                    onClick={() => setStep(4)}
                    className="text-xs font-mono uppercase tracking-wider text-ink-muted hover:text-ink flex items-center gap-1"
                  >
                    <ArrowLeft className="w-3.5 h-3.5" />
                    <span>Change Slot Time</span>
                  </button>

                  <Button
                    onClick={handleConfirmBooking}
                    variant="accent"
                    size="lg"
                    loading={submitting}
                    className="w-full sm:w-auto"
                  >
                    <span>Confirm & Book Slot</span>
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Right Sidebar: Summary Receipt (Span 4) */}
        <div className="lg:col-span-4 border border-ink bg-[#FAF8F5] p-6 sm:p-8 space-y-6 sticky top-28">
          <div className="border-b border-border pb-4">
            <span className="text-2xs font-mono uppercase tracking-widest text-ink-muted block">
              Reservation Summary
            </span>
            <h3 className="font-display font-bold text-xl uppercase tracking-tight text-ink mt-1">
              Diagnostic Slot
            </h3>
          </div>

          <div className="space-y-4 text-xs font-mono">
            <div>
              <span className="text-ink-muted uppercase block text-2xs">01 Center</span>
              <span className="text-ink font-semibold">{selectedCenter?.name || '— Not Selected —'}</span>
            </div>
            <div>
              <span className="text-ink-muted uppercase block text-2xs">02 Scan Test</span>
              <span className="text-ink font-semibold">{selectedScan?.name || '— Not Selected —'}</span>
            </div>
            <div>
              <span className="text-ink-muted uppercase block text-2xs">03 Date</span>
              <span className="text-ink font-semibold">{selectedDate || '— Not Selected —'}</span>
            </div>
            <div>
              <span className="text-ink-muted uppercase block text-2xs">04 Time Slot</span>
              <span className="text-ink font-semibold">
                {selectedTime ? selectedTime.substring(0, 5) : '— Not Selected —'}
              </span>
            </div>
          </div>

          <div className="pt-6 border-t border-border flex items-center justify-between">
            <span className="text-xs font-mono text-ink-muted uppercase">Estimated Fee</span>
            <span className="font-display font-extrabold text-2xl text-ink">
              ${parseFloat(selectedScan?.price || '0').toFixed(2)}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
