import { useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";

export default function Navbar() {
  const { isAuthenticated, isAdmin, user, logout } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  const close = () => setOpen(false);

  const handleLogout = () => {
    logout();
    close();
    toast.info("You have been logged out.");
    navigate("/");
  };

  const linkClass = ({ isActive }) => (isActive ? "nav-link active" : "nav-link");

  return (
    <header className="navbar">
      <div className="container navbar-inner">
        <Link to="/" className="brand" onClick={close}>
          <span className="brand-mark">+</span>
          Medi<span>Care</span>
        </Link>

        <button
          type="button"
          className="nav-toggle"
          aria-label="Toggle navigation"
          aria-expanded={open}
          onClick={() => setOpen((o) => !o)}
        >
          <span />
          <span />
          <span />
        </button>

        <nav className={`nav-menu ${open ? "open" : ""}`}>
          <NavLink to="/" end className={linkClass} onClick={close}>
            Home
          </NavLink>
          <NavLink to="/doctors" className={linkClass} onClick={close}>
            Doctors
          </NavLink>

          {isAuthenticated && !isAdmin && (
            <NavLink to="/dashboard" className={linkClass} onClick={close}>
              My Dashboard
            </NavLink>
          )}

          {isAdmin && (
            <>
              <NavLink to="/admin" end className={linkClass} onClick={close}>
                Admin
              </NavLink>
              <NavLink to="/admin/appointments" className={linkClass} onClick={close}>
                Appointments
              </NavLink>
              <NavLink to="/admin/doctors" className={linkClass} onClick={close}>
                Manage Doctors
              </NavLink>
            </>
          )}

          <div className="nav-actions">
            {isAuthenticated ? (
              <>
                <span className="nav-user" title={user?.email}>
                  Hi, {user?.name?.split(" ")[0]}
                </span>
                <button type="button" className="btn btn-outline btn-sm" onClick={handleLogout}>
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="btn btn-outline btn-sm" onClick={close}>
                  Login
                </Link>
                <Link to="/register" className="btn btn-primary btn-sm" onClick={close}>
                  Sign Up
                </Link>
              </>
            )}
          </div>
        </nav>
      </div>
    </header>
  );
}
