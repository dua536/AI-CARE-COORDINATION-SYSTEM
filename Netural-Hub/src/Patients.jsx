import { useState, useEffect } from "react";
import { getPatients, createPatient, updatePatient, deletePatient } from "./api/api";
import "./style.css";

const EMPTY_FORM = { name: "", age: "", gender: "Male", phone: "", email: "", diagnosis: "", status: "active", notes: "" };

export default function Patients() {
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  const fetchPatients = async () => {
    try {
      const res = await getPatients();
      setPatients(res.data || []);
    } catch {
      setPatients(MOCK_PATIENTS);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchPatients(); }, []);

  const openAdd = () => { setEditing(null); setForm(EMPTY_FORM); setError(""); setShowModal(true); };
  const openEdit = (p) => { setEditing(p.id); setForm({ name: p.name || p.full_name, age: p.age, gender: p.gender || "Male", phone: p.phone || "", email: p.email || "", diagnosis: p.diagnosis || p.condition || "", status: p.status || "active", notes: p.notes || "" }); setError(""); setShowModal(true); };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(""); setSaving(true);
    try {
      if (editing) {
        await updatePatient(editing, form);
      } else {
        await createPatient(form);
      }
      await fetchPatients();
      setShowModal(false);
    } catch (err) {
      setError(err.response?.data?.detail || "Failed to save. Check all fields.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Delete this patient record?")) return;
    try {
      await deletePatient(id);
      setPatients(patients.filter((p) => p.id !== id));
    } catch {
      alert("Failed to delete patient.");
    }
  };

  const filtered = patients.filter((p) => {
    const name = (p.name || p.full_name || "").toLowerCase();
    const diag = (p.diagnosis || p.condition || "").toLowerCase();
    return name.includes(search.toLowerCase()) || diag.includes(search.toLowerCase());
  });

  return (
    <div>
      <div className="page-header">
        <h1>Patients</h1>
        <p>Manage patient records, diagnoses, and care status.</p>
      </div>

      <div className="card">
        <div className="section-header">
          <input
            className="form-input"
            style={{ maxWidth: 280 }}
            placeholder="🔍 Search patients…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <button className="btn btn-primary" onClick={openAdd}>➕ Add Patient</button>
        </div>

        {loading ? (
          <div className="loading"><div className="spinner" /> Loading patients…</div>
        ) : filtered.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">👥</div>
            <h3>{search ? "No patients found" : "No patients yet"}</h3>
            <p>{search ? "Try a different search term." : "Add your first patient to get started."}</p>
          </div>
        ) : (
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Patient</th>
                  <th>Age / Gender</th>
                  <th>Diagnosis</th>
                  <th>Contact</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((p) => (
                  <tr key={p.id}>
                    <td>
                      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                        <div style={{ width: 34, height: 34, borderRadius: "50%", background: "var(--primary)", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: 13 }}>
                          {(p.name || p.full_name || "?")[0].toUpperCase()}
                        </div>
                        <div>
                          <p style={{ fontWeight: 600, fontSize: 14 }}>{p.name || p.full_name}</p>
                          <p style={{ fontSize: 12, color: "var(--text-muted)" }}>{p.email || "—"}</p>
                        </div>
                      </div>
                    </td>
                    <td style={{ fontSize: 14 }}>{p.age} yr · {p.gender || "—"}</td>
                    <td style={{ fontSize: 14 }}>{p.diagnosis || p.condition || "—"}</td>
                    <td style={{ fontSize: 14 }}>{p.phone || "—"}</td>
                    <td>
                      <span className={`badge badge-${p.status === "stable" || p.status === "active" ? "success" : p.status === "critical" ? "danger" : "warning"}`}>
                        {p.status || "Active"}
                      </span>
                    </td>
                    <td>
                      <div style={{ display: "flex", gap: 6 }}>
                        <button className="btn btn-sm btn-outline" onClick={() => openEdit(p)}>✏️ Edit</button>
                        <button className="btn btn-sm btn-danger" onClick={() => handleDelete(p.id)}>🗑️</button>
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
              <span className="modal-title">{editing ? "Edit Patient" : "Add New Patient"}</span>
              <button className="modal-close" onClick={() => setShowModal(false)}>✕</button>
            </div>
            {error && <div className="error-msg">{error}</div>}
            <form onSubmit={handleSubmit}>
              <div className="form-row">
                <div className="form-group">
                  <label>Full name *</label>
                  <input className="form-input" name="name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required placeholder="Ahmed Khan" />
                </div>
                <div className="form-group">
                  <label>Age *</label>
                  <input className="form-input" name="age" type="number" min="0" max="150" value={form.age} onChange={(e) => setForm({ ...form, age: e.target.value })} required placeholder="45" />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Gender</label>
                  <select className="form-select" value={form.gender} onChange={(e) => setForm({ ...form, gender: e.target.value })}>
                    <option>Male</option><option>Female</option><option>Other</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Status</label>
                  <select className="form-select" value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>
                    <option value="active">Active</option>
                    <option value="stable">Stable</option>
                    <option value="critical">Critical</option>
                    <option value="discharged">Discharged</option>
                  </select>
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Phone</label>
                  <input className="form-input" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="+92 300 0000000" />
                </div>
                <div className="form-group">
                  <label>Email</label>
                  <input className="form-input" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="patient@email.com" />
                </div>
              </div>
              <div className="form-group">
                <label>Diagnosis / Condition</label>
                <input className="form-input" value={form.diagnosis} onChange={(e) => setForm({ ...form, diagnosis: e.target.value })} placeholder="e.g. Hypertension, Diabetes Type 2" />
              </div>
              <div className="form-group">
                <label>Clinical Notes</label>
                <textarea className="form-textarea" value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} placeholder="Additional notes about the patient…" />
              </div>
              <div className="modal-actions">
                <button type="button" className="btn btn-outline" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={saving}>
                  {saving ? "Saving…" : editing ? "Save Changes" : "Add Patient"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}


