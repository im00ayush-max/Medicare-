import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useToast } from "../context/ToastContext";
import { sendOtp, verifyOtp } from "../services/authService";
import { getErrorMessage } from "../services/api";
import { isValidEmail } from "../utils/format";

const RESEND_SECONDS = 30;

export default function VerifyEmail() {
  const toast = useToast();
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState(location.state?.email || "");
  const [otp, setOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [cooldown, setCooldown] = useState(0);

  useEffect(() => {
    if (cooldown <= 0) return undefined;
    const t = setTimeout(() => setCooldown((c) => c - 1), 1000);
    return () => clearTimeout(t);
  }, [cooldown]);

  const handleSend = async (e) => {
    e?.preventDefault();
    setError("");
    if (!isValidEmail(email.trim())) {
      setError("Enter a valid email address");
      return;
    }
    setLoading(true);
    try {
      const data = await sendOtp(email.trim());
      toast.success(data.message || "OTP sent. Check your email.");
      setOtpSent(true);
      setCooldown(RESEND_SECONDS);
    } catch (err) {
      setError(getErrorMessage(err, "Could not send OTP."));
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async (e) => {
    e.preventDefault();
    setError("");
    if (!/^\d{6}$/.test(otp)) {
      setError("OTP must be exactly 6 digits");
      return;
    }
    setLoading(true);
    try {
      const data = await verifyOtp(email.trim(), otp);
      toast.success(data.message || "Email verified successfully");
      navigate("/login", { replace: true });
    } catch (err) {
      setError(getErrorMessage(err, "Could not verify OTP."));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <h1>Verify your email</h1>
        <p className="auth-sub">
          We'll email you a 6-digit code. It expires in 5 minutes.
        </p>

        {error && <div className="alert alert-error">{error}</div>}

        {!otpSent ? (
          <form onSubmit={handleSend} noValidate>
            <div className="form-group">
              <label htmlFor="email">Email</label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
              />
            </div>
            <button type="submit" className="btn btn-primary btn-block" disabled={loading}>
              {loading ? "Sending..." : "Send OTP"}
            </button>
          </form>
        ) : (
          <form onSubmit={handleVerify} noValidate>
            <p className="muted">
              Code sent to <strong>{email}</strong>
            </p>
            <div className="form-group">
              <label htmlFor="otp">6-digit OTP</label>
              <input
                id="otp"
                inputMode="numeric"
                maxLength={6}
                autoComplete="one-time-code"
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
                placeholder="123456"
                className="otp-input"
              />
            </div>
            <button type="submit" className="btn btn-primary btn-block" disabled={loading}>
              {loading ? "Verifying..." : "Verify Email"}
            </button>
            <button
              type="button"
              className="btn btn-link btn-block"
              onClick={handleSend}
              disabled={loading || cooldown > 0}
            >
              {cooldown > 0 ? `Resend OTP in ${cooldown}s` : "Resend OTP"}
            </button>
          </form>
        )}

        <p className="auth-foot">
          <Link to="/login">Skip for now and go to login</Link>
        </p>
      </div>
    </div>
  );
}
