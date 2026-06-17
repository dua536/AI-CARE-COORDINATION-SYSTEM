import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { getPatients, getAppointments, getDocuments } from "./api/api";
import "./style.css";

export default function Home() {
  const user = JSON.parse(localStorage.getItem("user") || "{}");

  const [stats, setStats] = useState({
    patients: 0,
    appointments: 0,
    documents: 0,
  });

  const [upcomingAppointments, setUpcomingAppointments] = useState([]);
  const [recentPatients, setRecentPatients] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [pRes, aRes, dRes] = await Promise.all([
          getPatients(),
          getAppointments(),
          getDocuments(),
        ]);

        const patients = pRes.data || [];
        const appointments = aRes.data || [];
        const documents = dRes.data || [];

        setStats({
          patients: patients.length,
          appointments: appointments.length,
          documents: documents.length,
        });

        setUpcomingAppointments(appointments.slice(0, 5));
        setRecentPatients(patients.slice(0, 5));
      } catch (error) {
        console.error("Failed to load dashboard data:", error);

        setStats({
          patients: 0,
          appointments: 0,
          documents: 0,
        });

        setUpcomingAppointments([]);
        setRecentPatients([]);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const hour = new Date().getHours();
  const greeting =
    hour < 12
      ? "Good morning"
      : hour < 17
      ? "Good afternoon"
      : "Good evening";

  return (
    <div>
      <div className="page-header">
        <h1>
          {greeting}, {user.name || "Doctor"} 👋
        </h1>
        <p>Here's what's happening across your patients today.</p>
      </div>

      {/* Stats */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon">👥</div>
          <div className="stat-value">{stats.patients}</div>
          <div className="stat-label">Total Patients</div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">📅</div>
          <div className="stat-value">{stats.appointments}</div>
          <div className="stat-label">Appointments</div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">📄</div>
          <div className="stat-value">{stats.documents}</div>
          <div className="stat-label">Documents</div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">🤖</div>
          <div className="stat-value">AI</div>
          <div className="stat-label">Medical Assistant</div>
          <div className="stat-change up">● Online</div>
        </div>
      </div>

      <div className="two-col">
        {/* Upcoming Appointments */}
        <div className="card">
          <div className="section-header">
            <span className="card-title">Upcoming Appointments</span>
            <Link to="/therapy" className="btn btn-sm btn-outline">
              View all
            </Link>
          </div>

          {loading ? (
            <div className="loading">
              <div className="spinner" /> Loading…
            </div>
          ) : upcomingAppointments.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">📅</div>
              <h3>No appointments</h3>
              <p>Schedule one from the Therapy page.</p>
            </div>
          ) : (
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: 10,
              }}
            >
              {upcomingAppointments.map((a, i) => (
                <div
                  key={a.id || i}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 12,
                    padding: "10px 0",
                    borderBottom: "1px solid #f1f5f9",
                  }}
                >
                  <div
                    style={{
                      width: 38,
                      height: 38,
                      borderRadius: 8,
                      background: "#e6f4f1",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: 18,
                    }}
                  >
                    🗓️
                  </div>

                  <div style={{ flex: 1 }}>
                    <p style={{ fontWeight: 600, fontSize: 14 }}>
                      {a.patient_name || a.patientName}
                    </p>
                    <p
                      style={{
                        fontSize: 12,
                        color: "var(--text-muted)",
                      }}
                    >
                      {a.type || "General Checkup"} ·{" "}
                      {a.date || a.scheduled_at}
                    </p>
                  </div>

                  <span
                    className={`badge badge-${
                      a.status === "confirmed"
                        ? "success"
                        : a.status === "pending"
                        ? "warning"
                        : "gray"
                    }`}
                  >
                    {a.status || "Pending"}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent Patients */}
        <div className="card">
          <div className="section-header">
            <span className="card-title">Recent Patients</span>
            <Link to="/patients" className="btn btn-sm btn-outline">
              View all
            </Link>
          </div>

          {loading ? (
            <div className="loading">
              <div className="spinner" /> Loading…
            </div>
          ) : recentPatients.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">👥</div>
              <h3>No patients yet</h3>
              <p>Add a patient to get started.</p>
            </div>
          ) : (
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: 10,
              }}
            >
              {recentPatients.map((p, i) => (
                <div
                  key={p.id || i}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 12,
                    padding: "10px 0",
                    borderBottom: "1px solid #f1f5f9",
                  }}
                >
                  <div
                    style={{
                      width: 38,
                      height: 38,
                      borderRadius: "50%",
                      background: "var(--primary)",
                      color: "#fff",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontWeight: 700,
                      fontSize: 14,
                    }}
                  >
                    {(p.name || p.full_name || "?")[0].toUpperCase()}
                  </div>

                  <div style={{ flex: 1 }}>
                    <p style={{ fontWeight: 600, fontSize: 14 }}>
                      {p.name || p.full_name}
                    </p>
                    <p
                      style={{
                        fontSize: 12,
                        color: "var(--text-muted)",
                      }}
                    >
                      Age {p.age} ·{" "}
                      {p.diagnosis || p.condition || "Under review"}
                    </p>
                  </div>

                  <span
                    className={`badge badge-${
                      p.status === "stable"
                        ? "success"
                        : p.status === "critical"
                        ? "danger"
                        : "warning"
                    }`}
                  >
                    {p.status || "Active"}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="card" style={{ marginTop: 20 }}>
        <span className="card-title">Quick Actions</span>

        <div
          style={{
            display: "flex",
            gap: 10,
            flexWrap: "wrap",
            marginTop: 4,
          }}
        >
          <Link to="/patients" className="btn btn-primary">
            ➕ Add Patient
          </Link>

          <Link to="/medical-ai" className="btn btn-outline">
            🤖 Ask Medical AI
          </Link>

          <Link to="/therapy" className="btn btn-outline">
            📅 Schedule Appointment
          </Link>

          <Link to="/upload" className="btn btn-outline">
            📄 Upload Document
          </Link>
        </div>
      </div>
    </div>
  );
}