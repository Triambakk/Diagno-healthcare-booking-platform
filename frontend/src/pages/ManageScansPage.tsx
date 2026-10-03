import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { scansApi, ScanPayload } from '../api/scans';
import { ScanType } from '../types';
import { Button } from '../components/common/Button';
import { Input } from '../components/common/Input';
import { Modal } from '../components/common/Modal';
import { CardSkeleton } from '../components/common/Skeleton';
import { useToast } from '../context/ToastContext';
import { getErrorMessage } from '../api/client';
import {
  ArrowLeft,
  Plus,
  Edit2,
  Trash2,
  Activity,
  Clock,
  Search,
  AlertTriangle,
} from 'lucide-react';

export const ManageScansPage: React.FC = () => {
  const { showToast } = useToast();
  const [scans, setScans] = useState<ScanType[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  // Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [editingScan, setEditingScan] = useState<ScanType | null>(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deletingScan, setDeletingScan] = useState<ScanType | null>(null);

  // Form State
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [durationMinutes, setDurationMinutes] = useState<number>(30);
  const [price, setPrice] = useState<string>('150.00');
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const fetchScans = async () => {
    setLoading(true);
    try {
      const data = await scansApi.getAll();
      setScans(data);
    } catch (err) {
      showToast(getErrorMessage(err), 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchScans();
  }, []);

  const handleOpenAddModal = () => {
    setEditingScan(null);
    setName('');
    setDescription('');
    setDurationMinutes(30);
    setPrice('150.00');
    setFormError(null);
    setModalOpen(true);
  };

  const handleOpenEditModal = (scan: ScanType) => {
    setEditingScan(scan);
    setName(scan.name);
    setDescription(scan.description);
    setDurationMinutes(scan.duration_minutes);
    setPrice(scan.price);
    setFormError(null);
    setModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !description.trim() || !price) {
      setFormError('Please fill out all required fields.');
      return;
    }

    setSaving(true);
    setFormError(null);

    const payload: ScanPayload = {
      name,
      description,
      duration_minutes: Number(durationMinutes),
      price: parseFloat(price).toFixed(2),
    };

    try {
      if (editingScan) {
        await scansApi.update(editingScan.id, payload);
        showToast('Scan type updated successfully.', 'success');
      } else {
        await scansApi.create(payload);
        showToast('New scan modality created.', 'success');
      }
      setModalOpen(false);
      await fetchScans();
    } catch (err) {
      const msg = getErrorMessage(err);
      setFormError(msg);
      showToast(msg, 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deletingScan) return;
    setSaving(true);
    try {
      await scansApi.delete(deletingScan.id);
      showToast('Scan type deleted.', 'success');
      setDeleteModalOpen(false);
      setDeletingScan(null);
      await fetchScans();
    } catch (err) {
      showToast(getErrorMessage(err), 'error');
    } finally {
      setSaving(false);
    }
  };

  const filteredScans = scans.filter((s) =>
    s.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="max-w-7xl mx-auto px-6 py-12 space-y-12">
      {/* Back Link */}
      <div>
        <Link
          to="/staff"
          className="inline-flex items-center gap-2 text-xs font-mono uppercase tracking-widest text-ink-muted hover:text-ink transition-colors group"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          <span>Return to Staff Portal</span>
        </Link>
      </div>

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between pb-8 border-b border-ink gap-6">
        <div className="space-y-2">
          <span className="text-2xs font-mono uppercase tracking-widest text-accent font-semibold px-2.5 py-1 border border-accent/30">
            Administrative Management
          </span>
          <h1 className="font-display font-extrabold text-4xl sm:text-6xl uppercase tracking-tight text-ink">
            Scan Types & Tests
          </h1>
        </div>

        <Button
          onClick={handleOpenAddModal}
          variant="primary"
          size="md"
          icon={<Plus className="w-4 h-4" />}
        >
          Add Scan Type
        </Button>
      </div>

      {/* Search Filter */}
      <div className="flex items-center justify-between gap-4 pb-4 border-b border-border">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-ink-muted absolute left-4 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Filter scan modalities by name..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-[#FAF8F5] border border-border pl-11 pr-4 py-3 text-xs uppercase tracking-wider text-ink focus:outline-none focus:border-ink transition-colors"
          />
        </div>
        <span className="text-xs font-mono uppercase text-ink-muted">{filteredScans.length} Listed</span>
      </div>

      {/* Scans Table */}
      {loading ? (
        <div className="space-y-4">
          <CardSkeleton />
          <CardSkeleton />
        </div>
      ) : filteredScans.length === 0 ? (
        <div className="text-center py-20 border border-border bg-bg-alt/20">
          <p className="text-xs font-mono uppercase text-ink-muted">No scan modalities found.</p>
        </div>
      ) : (
        <div className="border border-border bg-[#FAF8F5] overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-bg-alt border-b border-border text-2xs font-mono uppercase tracking-widest text-ink-muted">
              <tr>
                <th className="py-4 px-6">ID</th>
                <th className="py-4 px-6">Modality Name</th>
                <th className="py-4 px-6">Duration</th>
                <th className="py-4 px-6">Price</th>
                <th className="py-4 px-6">Description</th>
                <th className="py-4 px-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filteredScans.map((scan) => (
                <tr key={scan.id} className="hover:bg-bg-alt/40 transition-colors">
                  <td className="py-4 px-6 font-mono font-bold text-ink">#{scan.id}</td>
                  <td className="py-4 px-6 font-bold text-sm text-ink">{scan.name}</td>
                  <td className="py-4 px-6 font-mono text-ink-muted">{scan.duration_minutes} Mins</td>
                  <td className="py-4 px-6 font-mono font-bold text-ink">
                    ${parseFloat(scan.price).toFixed(2)}
                  </td>
                  <td className="py-4 px-6 font-light text-ink-muted max-w-xs truncate">
                    {scan.description}
                  </td>
                  <td className="py-4 px-6 text-right space-x-2 whitespace-nowrap">
                    <button
                      onClick={() => handleOpenEditModal(scan)}
                      className="p-1.5 border border-border hover:border-ink text-ink hover:text-accent transition-colors"
                      title="Edit"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => {
                        setDeletingScan(scan);
                        setDeleteModalOpen(true);
                      }}
                      className="p-1.5 border border-border hover:border-red-600 text-ink-muted hover:text-red-600 transition-colors"
                      title="Delete"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Add / Edit Scan Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingScan ? 'Edit Diagnostic Modality' : 'Add New Scan Type'}
        subtitle={editingScan ? `Modality #${editingScan.id}` : 'Staff Management'}
      >
        <form onSubmit={handleSave} className="space-y-4">
          {formError && (
            <div className="p-3 bg-accent/10 border border-accent text-accent text-xs font-mono uppercase">
              {formError}
            </div>
          )}

          <Input
            label="Scan / Procedure Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. MRI Spine (Lumbar)"
            required
          />

          <div className="w-full space-y-1.5">
            <label className="block text-2xs font-mono uppercase tracking-widest text-ink-muted font-medium">
              Description & Preparation
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="e.g. High field magnetic resonance imaging with multi-planar reconstruction."
              rows={3}
              className="w-full bg-[#FAF8F5] border border-border px-4 py-3 text-sm text-ink focus:outline-none focus:border-ink transition-colors"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Duration (Minutes)"
              type="number"
              min="5"
              step="5"
              value={durationMinutes}
              onChange={(e) => setDurationMinutes(parseInt(e.target.value, 10))}
              required
            />

            <Input
              label="Standard Fee (USD)"
              type="number"
              min="0"
              step="0.01"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              required
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-6 border-t border-border">
            <Button
              type="button"
              variant="outline"
              size="md"
              onClick={() => setModalOpen(false)}
              disabled={saving}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              size="md"
              loading={saving}
            >
              {editingScan ? 'Update Modality' : 'Create Modality'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        title="Delete Scan Modality"
        subtitle={`Modality #${deletingScan?.id}`}
      >
        <div className="space-y-6">
          <div className="flex items-start gap-3 p-4 bg-accent/10 border border-accent text-accent text-xs font-light leading-relaxed">
            <AlertTriangle className="w-5 h-5 flex-shrink-0 mt-0.5" />
            <div>
              Are you sure you want to delete <strong className="font-bold">{deletingScan?.name}</strong>?
              This procedure will no longer be available for patient booking.
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-border">
            <Button
              variant="outline"
              size="md"
              onClick={() => setDeleteModalOpen(false)}
              disabled={saving}
            >
              Cancel
            </Button>
            <Button
              variant="danger"
              size="md"
              onClick={handleDelete}
              loading={saving}
            >
              Confirm Delete
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
