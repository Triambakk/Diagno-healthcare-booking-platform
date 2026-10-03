import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { centersApi, CenterPayload } from '../api/centers';
import { DiagnosticCenter } from '../types';
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
  Building2,
  MapPin,
  Phone,
  Search,
  AlertTriangle,
} from 'lucide-react';

export const ManageCentersPage: React.FC = () => {
  const { showToast } = useToast();
  const [centers, setCenters] = useState<DiagnosticCenter[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  // Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [editingCenter, setEditingCenter] = useState<DiagnosticCenter | null>(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deletingCenter, setDeletingCenter] = useState<DiagnosticCenter | null>(null);

  // Form State
  const [name, setName] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [contactNumber, setContactNumber] = useState('');
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const fetchCenters = async () => {
    setLoading(true);
    try {
      const data = await centersApi.getAll();
      setCenters(data);
    } catch (err) {
      showToast(getErrorMessage(err), 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCenters();
  }, []);

  const handleOpenAddModal = () => {
    setEditingCenter(null);
    setName('');
    setAddress('');
    setCity('');
    setContactNumber('');
    setFormError(null);
    setModalOpen(true);
  };

  const handleOpenEditModal = (center: DiagnosticCenter) => {
    setEditingCenter(center);
    setName(center.name);
    setAddress(center.address);
    setCity(center.city);
    setContactNumber(center.contact_number);
    setFormError(null);
    setModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !address.trim() || !city.trim() || !contactNumber.trim()) {
      setFormError('Please fill out all fields.');
      return;
    }

    setSaving(true);
    setFormError(null);

    const payload: CenterPayload = {
      name,
      address,
      city,
      contact_number: contactNumber,
    };

    try {
      if (editingCenter) {
        await centersApi.update(editingCenter.id, payload);
        showToast('Center updated successfully.', 'success');
      } else {
        await centersApi.create(payload);
        showToast('New diagnostic center created.', 'success');
      }
      setModalOpen(false);
      await fetchCenters();
    } catch (err) {
      const msg = getErrorMessage(err);
      setFormError(msg);
      showToast(msg, 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deletingCenter) return;
    setSaving(true);
    try {
      await centersApi.delete(deletingCenter.id);
      showToast('Diagnostic center deleted.', 'success');
      setDeleteModalOpen(false);
      setDeletingCenter(null);
      await fetchCenters();
    } catch (err) {
      showToast(getErrorMessage(err), 'error');
    } finally {
      setSaving(false);
    }
  };

  const filteredCenters = centers.filter(
    (c) =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.city.toLowerCase().includes(search.toLowerCase())
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
            Diagnostic Centers
          </h1>
        </div>

        <Button
          onClick={handleOpenAddModal}
          variant="primary"
          size="md"
          icon={<Plus className="w-4 h-4" />}
        >
          Add Diagnostic Center
        </Button>
      </div>

      {/* Search Filter */}
      <div className="flex items-center justify-between gap-4 pb-4 border-b border-border">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-ink-muted absolute left-4 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Filter centers by name or city..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-[#FAF8F5] border border-border pl-11 pr-4 py-3 text-xs uppercase tracking-wider text-ink focus:outline-none focus:border-ink transition-colors"
          />
        </div>
        <span className="text-xs font-mono uppercase text-ink-muted">{filteredCenters.length} Listed</span>
      </div>

      {/* Centers Table */}
      {loading ? (
        <div className="space-y-4">
          <CardSkeleton />
          <CardSkeleton />
        </div>
      ) : filteredCenters.length === 0 ? (
        <div className="text-center py-20 border border-border bg-bg-alt/20">
          <p className="text-xs font-mono uppercase text-ink-muted">No diagnostic centers found.</p>
        </div>
      ) : (
        <div className="border border-border bg-[#FAF8F5] overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-bg-alt border-b border-border text-2xs font-mono uppercase tracking-widest text-ink-muted">
              <tr>
                <th className="py-4 px-6">ID</th>
                <th className="py-4 px-6">Center Facility Name</th>
                <th className="py-4 px-6">City</th>
                <th className="py-4 px-6">Address</th>
                <th className="py-4 px-6">Contact Number</th>
                <th className="py-4 px-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filteredCenters.map((center) => (
                <tr key={center.id} className="hover:bg-bg-alt/40 transition-colors">
                  <td className="py-4 px-6 font-mono font-bold text-ink">#{center.id}</td>
                  <td className="py-4 px-6 font-bold text-sm text-ink">{center.name}</td>
                  <td className="py-4 px-6 font-mono uppercase text-accent font-semibold">{center.city}</td>
                  <td className="py-4 px-6 font-light text-ink-muted">{center.address}</td>
                  <td className="py-4 px-6 font-mono text-ink-muted">{center.contact_number}</td>
                  <td className="py-4 px-6 text-right space-x-2 whitespace-nowrap">
                    <button
                      onClick={() => handleOpenEditModal(center)}
                      className="p-1.5 border border-border hover:border-ink text-ink hover:text-accent transition-colors"
                      title="Edit"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => {
                        setDeletingCenter(center);
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

      {/* Add / Edit Center Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingCenter ? 'Edit Diagnostic Center' : 'Add New Diagnostic Center'}
        subtitle={editingCenter ? `Facility #${editingCenter.id}` : 'Staff Management'}
      >
        <form onSubmit={handleSave} className="space-y-4">
          {formError && (
            <div className="p-3 bg-accent/10 border border-accent text-accent text-xs font-mono uppercase">
              {formError}
            </div>
          )}

          <Input
            label="Facility Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Apollo Diagnostics Hub"
            required
          />

          <Input
            label="City"
            value={city}
            onChange={(e) => setCity(e.target.value)}
            placeholder="e.g. Gurugram"
            required
          />

          <Input
            label="Full Address"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            placeholder="e.g. Sector 65, Golf Course Extension"
            required
          />

          <Input
            label="Contact Number"
            value={contactNumber}
            onChange={(e) => setContactNumber(e.target.value)}
            placeholder="e.g. +91-9876543210"
            required
          />

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
              {editingCenter ? 'Update Center' : 'Create Center'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        title="Delete Diagnostic Center"
        subtitle={`Facility #${deletingCenter?.id}`}
      >
        <div className="space-y-6">
          <div className="flex items-start gap-3 p-4 bg-accent/10 border border-accent text-accent text-xs font-light leading-relaxed">
            <AlertTriangle className="w-5 h-5 flex-shrink-0 mt-0.5" />
            <div>
              Are you sure you want to delete <strong className="font-bold">{deletingCenter?.name}</strong>?
              This facility will no longer be available for patient appointments.
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
