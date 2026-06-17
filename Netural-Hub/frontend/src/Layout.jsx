import { Outlet, NavLink, useNavigate } from "react-router-dom";
import { useState } from "react";
import "./style.css";

const navItems = [
  { to: "/", icon: "🏠", label: "Dashboard", end: true },
  { to: "/patients", icon: "👥", label: "Patients" },
  { to: "/medical-ai", icon: "🤖", label: "Medical AI" },
  { to: "/therapy", icon: "📅", label: "Therapy & Appointments" },
  { to: "/upload", icon: "📄", label: "Upload Documents" },
];

export default function Layout() {
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const user = JSON.parse(localStorage.getItem("user") || "{}");

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  return (
    <div className="layout">
      {/* Sidebar */}
      <aside className={`sidebar ${sidebarOpen ? "open" : "collapsed"}`}>
        <div className="sidebar-header">
          <div className="logo">
            <span className="logo-icon">⚕️</span>
            {sidebarOpen && <span className="logo-text">Netural Hub</span>}
          </div>
          <button className="toggle-btn" onClick={() => setSidebarOpen(!sidebarOpen)}>
            {sidebarOpen ? "◀" : "▶"}
          </button>
        </div>

        <nav className="sidebar-nav">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) => `nav-item ${isActive ? "active" : ""}`}
            >
              <span className="nav-icon">{item.icon}</span>
              {sidebarOpen && <span className="nav-label">{item.label}</span>}
            </NavLink>
          ))}
        </nav>

        <div className="sidebar-footer">
          <div className="user-info">
            <div className="user-avatar">{user.name?.[0]?.toUpperCase() || "U"}</div>
            {sidebarOpen && (
              <div className="user-details">
                <p className="user-name">{user.name || "User"}</p>
                <p className="user-role">{user.role || "Staff"}</p>
              </div>
            )}
          </div>
          <button className="logout-btn" onClick={handleLogout} title="Logout">
            🚪
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="main-content">
        <Outlet />
      </main>
    </div>
  );
}
