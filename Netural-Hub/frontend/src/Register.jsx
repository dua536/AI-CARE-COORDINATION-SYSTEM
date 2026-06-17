import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { register } from "./api/api";
import "./style.css";

const ROLES = ["Doctor", "Nurse", "Caregiver", "Admin"];

export default function Register() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: "", email: "", password: "", role: "Doctor" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await register(form);
      navigate("/login");
    } catch (err) {
      setError(err.response?.data?.detail || "Registration failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-logo">
          <span className="auth-logo-icon">⚕️</span>
          <h1>Netural Hub</h1>
          <p>AI Care Coordination System</p>
        </div>

        <h2 className="auth-title">Create your account</h2>

        {error && <div className="error-msg">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Full name</label>
            <input className="form-input" type="text" name="name" placeholder="Dr. Jane Smith" value={form.name} onChange={handleChange} required />
          </div>
          <div className="form-group">
            <label>Email address</label>
            <input className="form-input" type="email" name="email" placeholder="doctor@hospital.com" value={form.email} onChange={handleChange} required />
          </div>
          <div className="form-group">
            <label>Role</label>
            <select className="form-select" name="role" value={form.role} onChange={handleChange}>
              {ROLES.map((r) => <option key={r}>{r}</option>)}
            </select>
          </div>
          <div className="form-group">
            <label>Password</label>
            <input className="form-input" type="password" name="password" placeholder="Min. 8 characters" value={form.password} onChange={handleChange} required minLength={8} />
          </div>
          <button className="btn btn-primary" style={{ width: "100%", justifyContent: "center", marginTop: 8 }} type="submit" disabled={loading}>
            {loading ? "Creating account…" : "Create account"}
          </button>
        </form>

        <div className="auth-footer">
          Already have an account? <Link to="/login">Sign in</Link>
        </div>
      </div>
    </div>
  );
}