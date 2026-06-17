

import { useState, useEffect } from "react";
import { getAppointments, createAppointment, updateAppointment, deleteAppointment, getPatients } from "./api/api";
import "./style.css";

const TYPES = ["General Checkup", "Therapy Session", "Follow-up", "Lab Review", "Surgery Consult", "Mental Health", "Physiotherapy"];
const STATUSES = ["pending", "confirmed", "completed", "cancelled"];
const EMPTY_FORM = { patient_id: "", patient_name: "", type: "General Checkup", date: "", time: "", notes: "", status: "pending" };

export default function Therapy() {
  const [appointments, setAppointments] = useState([]);
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [filter, setFilter] = useState("all");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  const fetchAll = async () => {
    try {
      const [aRes, pRes] = await Promise.all([getAppointments(), getPatients()]);
      setAppointments(aRes.data || []);
      setPatients(pRes.data || []);
    } catch {
      setAppointments([]);          // ✅ MOCK_APPTS hataya
      setPatients([]);              // ✅ MOCK_PATIENTS hataya
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchAll(); }, []);

  const openAdd = () => { setEditing(null); setForm(EMPTY_FORM); setError(""); setShowModal(true); };
  const openEdit = (a) => {
    setEditing(a.id);
    setForm({
      patient_id: a.patient_id || "",
      patient_name: a.patient_name || "",
      type: a.type,
      date: a.date || "",
      time: a.time || "",
      notes: a.notes || "",
      status: a.status
    });
    setError("");
    setShowModal(true);
  };

  const handlePatientChange = (e) => {
    const p = patients.find((x) => String(x.id) === e.target.value);
    setForm({ ...form, patient_id: e.target.value, patient_name: p ? (p.name || p.full_name) : "" });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(""); setSaving(true);
    try {
      editing
        ? await updateAppointment(editing, form)
        : await createAppointment(form);
      await fetchAll();
      setShowModal(false);
    } catch (err) {
      setError(err.response?.data?.detail || "Failed to save appointment.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Delete this appointment?")) return;
    try {
      await deleteAppointment(id);
      setAppointments(appointments.filter((a) => a.id !== id));
    } catch {
      alert("Failed to delete.");
    }
  };

  const filtered = filter === "all" ? appointments : appointments.filter((a) => a.status === filter);
  const statusColor = (s) => s === "confirmed" ? "success" : s === "completed" ? "info" : s === "cancelled" ? "danger" : "warning";

  return (
    <div>
      <div className="page-header">
        <h1>Therapy & Appointments 📅</h1>
        <p>Schedule and manage all patient appointments and therapy sessions.</p>
      </div>

      {/* Filter tabs */}
      <div style={{ display: "flex", gap: 8, marginBottom: 20 }}>
        {["all", "pending", "confirmed", "completed", "cancelled"].map((s) => (
          <button
            key={s}
            onClick={() => setFilter(s)}
            className="btn btn-sm"
            style={{
              background: filter === s ? "var(--primary)" : "var(--surface)",
              color: filter === s ? "#fff" : "var(--text-muted)",
              border: "1px solid var(--border)",
              textTransform: "capitalize"
            }}
          >
            {s}
          </button>
        ))}
        <button className="btn btn-primary btn-sm" style={{ marginLeft: "auto" }} onClick={openAdd}>
          ➕ Schedule
        </button>
      </div>

      <div className="card">
        {loading ? (
          <div className="loading"><div className="spinner" /> Loading appointments…</div>
        ) : filtered.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">📅</div>
            <h3>No appointments found</h3>
            <p>Schedule a new appointment to get started.</p>
          </div>
        ) : (
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Patient</th>
                  <th>Type</th>
                  <th>Date & Time</th>
                  <th>Notes</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((a) => (
                  <tr key={a.id}>
                    <td style={{ fontWeight: 600, fontSize: 14 }}>{a.patient_name || "—"}</td>
                    <td style={{ fontSize: 14 }}>{a.type}</td>
                    <td style={{ fontSize: 13, color: "var(--text-muted)" }}>{a.date} {a.time}</td>
                    <td style={{ fontSize: 13, maxWidth: 160, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{a.notes || "—"}</td>
                    <td><span className={`badge badge-${statusColor(a.status)}`}>{a.status}</span></td>
                    <td>
                      <div style={{ display: "flex", gap: 6 }}>
                        <button className="btn btn-sm btn-outline" onClick={() => openEdit(a)}>✏️</button>
                        <button className="btn btn-sm btn-danger" onClick={() => handleDelete(a.id)}>🗑️</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && setShowModal(false)}>
          <div className="modal">
            <div className="modal-header">
              <span className="modal-title">{editing ? "Edit Appointment" : "Schedule Appointment"}</span>
              <button className="modal-close" onClick={() => setShowModal(false)}>✕</button>
            </div>
            {error && <div className="error-msg">{error}</div>}
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Patient *</label>
                <select className="form-select" value={form.patient_id} onChange={handlePatientChange} required>
                  <option value="">Select a patient…</option>
                  {patients.map((p) => (
                    <option key={p.id} value={p.id}>{p.name || p.full_name}</option>
                  ))}
                </select>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Appointment type *</label>
                  <select className="form-select" value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}>
                    {TYPES.map((t) => <option key={t}>{t}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label>Status</label>
                  <select className="form-select" value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>
                    {STATUSES.map((s) => <option key={s}>{s}</option>)}
                  </select>
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Date *</label>
                  <input className="form-input" type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} required />
                </div>
                <div className="form-group">
                  <label>Time *</label>
                  <input className="form-input" type="time" value={form.time} onChange={(e) => setForm({ ...form, time: e.target.value })} required />
                </div>
              </div>
              <div className="form-group">
                <label>Notes</label>
                <textarea
                  className="form-textarea"
                  value={form.notes}
                  onChange={(e) => setForm({ ...form, notes: e.target.value })}
                  placeholder="Appointment notes or instructions…"
                />
              </div>
              <div className="modal-actions">
                <button type="button" className="btn btn-outline" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={saving}>
                  {saving ? "Saving…" : editing ? "Save Changes" : "Schedule"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}