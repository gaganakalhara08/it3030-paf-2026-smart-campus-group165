import React, { useState, useEffect } from "react";
import { X, AlertCircle } from "lucide-react";

const TYPES    = ["LECTURE_HALL", "LAB", "MEETING_ROOM", "EQUIPMENT"];
const STATUSES = ["ACTIVE", "OUT_OF_SERVICE", "UNDER_MAINTENANCE"];

const Field = ({ label, error, children }) => (
  <div>
    <label className="block text-xs font-semibold text-slate-600 mb-1">{label}</label>
    {children}
    {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
  </div>
);

const Input = ({ error, ...props }) => (
  <input
    {...props}
    className={`w-full h-10 px-3 rounded-xl border text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:border-transparent ${
      error ? "border-red-400 bg-red-50" : "border-slate-200 bg-white"
    }`}
  />
);

const Select = ({ error, children, ...props }) => (
  <select
    {...props}
    className={`w-full h-10 px-3 rounded-xl border text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:border-transparent ${
      error ? "border-red-400 bg-red-50" : "border-slate-200 bg-white"
    }`}
  >
    {children}
  </select>
);

const EMPTY = {
  name: "", type: "LAB", capacity: "", location: "", description: "",
  availabilityStart: "08:00", availabilityEnd: "18:00",
  building: "", floor: "", roomNumber: "",
  brand: "", model: "", serialNumber: "", imageUrl: "",
  status: "ACTIVE",
};

const ResourceFormModal = ({ isOpen, onClose, onSubmit, resource, loading }) => {
  const [form, setForm]     = useState(EMPTY);
  const [errors, setErrors] = useState({});

  const isEdit = !!resource;

  useEffect(() => {
    if (resource) {
      setForm({
        ...EMPTY,
        ...resource,
        availabilityStart: resource.availabilityStart?.slice(0, 5) ?? "08:00",
        availabilityEnd:   resource.availabilityEnd?.slice(0, 5)   ?? "18:00",
        capacity: resource.capacity ?? "",
      });
    } else {
      setForm(EMPTY);
    }
    setErrors({});
  }, [resource, isOpen]);

  const set = (k, v) => setForm((p) => ({ ...p, [k]: v }));

  const validate = () => {
    const e = {};
    if (!form.name.trim())         e.name     = "Name is required";
    if (!form.capacity || form.capacity < 1) e.capacity = "Capacity must be ≥ 1";
    if (!form.location.trim())     e.location = "Location is required";
    if (!form.building.trim())     e.building = "Building is required";
    if (!form.availabilityStart)   e.availabilityStart = "Required";
    if (!form.availabilityEnd)     e.availabilityEnd   = "Required";
    if (form.availabilityEnd <= form.availabilityStart)
      e.availabilityEnd = "End time must be after start time";
    return e;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    const payload = { ...form, capacity: Number(form.capacity) };
    onSubmit(payload);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-slate-100 px-6 py-4 flex items-center justify-between rounded-t-2xl">
          <div>
            <h2 className="text-lg font-bold text-slate-800">{isEdit ? "Edit Resource" : "Add New Resource"}</h2>
            <p className="text-xs text-slate-500">Fill in the details for the campus resource</p>
          </div>
          <button onClick={onClose} className="p-2 rounded-xl text-slate-400 hover:bg-slate-100 transition-colors">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Name + Type */}
          <div className="grid grid-cols-2 gap-4">
            <Field label="Resource Name *" error={errors.name}>
              <Input placeholder="e.g. Lab A101" value={form.name} onChange={(e) => set("name", e.target.value)} error={errors.name} />
            </Field>
            <Field label="Type *">
              <Select value={form.type} onChange={(e) => set("type", e.target.value)}>
                {TYPES.map((t) => <option key={t} value={t}>{t.replace("_", " ")}</option>)}
              </Select>
            </Field>
          </div>

          {/* Capacity + Status */}
          <div className="grid grid-cols-2 gap-4">
            <Field label="Capacity *" error={errors.capacity}>
              <Input type="number" min={1} placeholder="30" value={form.capacity} onChange={(e) => set("capacity", e.target.value)} error={errors.capacity} />
            </Field>
            <Field label="Status *">
              <Select value={form.status} onChange={(e) => set("status", e.target.value)}>
                {STATUSES.map((s) => <option key={s} value={s}>{s.replace("_", " ")}</option>)}
              </Select>
            </Field>
          </div>

          {/* Location */}
          <Field label="Location *" error={errors.location}>
            <Input placeholder="e.g. Block A, Floor 1" value={form.location} onChange={(e) => set("location", e.target.value)} error={errors.location} />
          </Field>

          {/* Building / Floor / Room */}
          <div className="grid grid-cols-3 gap-4">
            <Field label="Building *" error={errors.building}>
              <Input placeholder="Block A" value={form.building} onChange={(e) => set("building", e.target.value)} error={errors.building} />
            </Field>
            <Field label="Floor">
              <Input placeholder="1" value={form.floor} onChange={(e) => set("floor", e.target.value)} />
            </Field>
            <Field label="Room Number">
              <Input placeholder="A101" value={form.roomNumber} onChange={(e) => set("roomNumber", e.target.value)} />
            </Field>
          </div>

          {/* Availability window */}
          <div className="grid grid-cols-2 gap-4">
            <Field label="Availability Start *" error={errors.availabilityStart}>
              <Input type="time" value={form.availabilityStart} onChange={(e) => set("availabilityStart", e.target.value)} error={errors.availabilityStart} />
            </Field>
            <Field label="Availability End *" error={errors.availabilityEnd}>
              <Input type="time" value={form.availabilityEnd} onChange={(e) => set("availabilityEnd", e.target.value)} error={errors.availabilityEnd} />
            </Field>
          </div>

          {/* Description */}
          <Field label="Description">
            <textarea
              placeholder="Brief description of the resource…"
              value={form.description}
              onChange={(e) => set("description", e.target.value)}
              rows={3}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:border-transparent resize-none"
            />
          </Field>

          {/* Equipment-specific fields */}
          {form.type === "EQUIPMENT" && (
            <div className="grid grid-cols-3 gap-4 p-4 rounded-xl bg-orange-50 border border-orange-100">
              <p className="col-span-3 text-xs font-semibold text-orange-700">Equipment Details</p>
              <Field label="Brand">
                <Input placeholder="Sony" value={form.brand} onChange={(e) => set("brand", e.target.value)} />
              </Field>
              <Field label="Model">
                <Input placeholder="VPL-EX435" value={form.model} onChange={(e) => set("model", e.target.value)} />
              </Field>
              <Field label="Serial Number">
                <Input placeholder="SN-00123" value={form.serialNumber} onChange={(e) => set("serialNumber", e.target.value)} />
              </Field>
            </div>
          )}

          {/* Image URL */}
          <Field label="Image URL (optional)">
            <Input placeholder="https://…" value={form.imageUrl} onChange={(e) => set("imageUrl", e.target.value)} />
          </Field>

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose}
              className="flex-1 h-11 rounded-xl border border-slate-200 text-sm font-semibold text-slate-600 hover:bg-slate-50 transition-colors">
              Cancel
            </button>
            <button type="submit" disabled={loading}
              className="flex-1 h-11 rounded-xl bg-emerald-600 text-white text-sm font-semibold hover:bg-emerald-700 disabled:opacity-60 transition-colors">
              {loading ? "Saving…" : isEdit ? "Save Changes" : "Create Resource"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ResourceFormModal;
