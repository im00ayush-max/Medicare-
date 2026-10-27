// Allow-list of user fields that are safe to send to the frontend.
// Never add password, OTP hashes or OTP expiry fields here.
const toSafeUser = (user) => ({
  id: user._id,
  name: user.name,
  email: user.email,
  role: user.role,
  isEmailVerified: user.isEmailVerified,
  createdAt: user.createdAt,
  updatedAt: user.updatedAt,
});

module.exports = toSafeUser;
