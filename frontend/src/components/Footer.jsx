import { Link } from "react-router-dom";

export default function Footer() {
  return (
    <footer className="footer">
      <div className="container footer-grid">
        <div>
          <div className="brand brand-light">
            <span className="brand-mark">+</span>
            Medi<span>Care</span>
          </div>
          <p className="footer-text">
            Book appointments with experienced doctors quickly and securely, from anywhere.
          </p>
        </div>
        <div>
          <h4>Quick Links</h4>
          <ul>
            <li>
              <Link to="/">Home</Link>
            </li>
            <li>
              <Link to="/doctors">Find a Doctor</Link>
            </li>
            <li>
              <Link to="/login">Patient Login</Link>
            </li>
            <li>
              <Link to="/register">Create Account</Link>
            </li>
          </ul>
        </div>
        <div>
          <h4>Care Hours</h4>
          <ul>
            <li>Online booking: 24/7</li>
            <li>Doctor schedules vary by day</li>
            <li>Check each doctor's available slots</li>
          </ul>
        </div>
      </div>
      <div className="footer-bottom">
        &copy; {new Date().getFullYear()} MediCare. All rights reserved.
      </div>
    </footer>
  );
}
