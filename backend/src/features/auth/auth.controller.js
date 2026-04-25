const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const { OAuth2Client } = require("google-auth-library");
const User = require("../users/user.model");
const {
  sendEmailConfirmation,
  generateConfirmationToken,
  sendLoginOtpEmail,
  sendMagicLoginEmail,
} = require("../../common/utils/helpers");
const { setAuthCookie, clearAuthCookie } = require("../../common/auth/authCookies");
const ADMIN_EMAIL = "tusharrawatdpss1@gmail.com";
const generateToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: "30d" });

const registerUser = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ message: "Please add all fields" });
    }

    // Check if user already exists and is confirmed
    const existingUser = await User.findOne({ email });
    if (existingUser && existingUser.isEmailConfirmed) {
      return res.status(400).json({ message: "User already exists" });
    }

    // If user exists but not confirmed, allow re-registration (resend confirmation)
    if (existingUser && !existingUser.isEmailConfirmed) {
      // Generate new confirmation token
      const confirmationToken = generateConfirmationToken();
      const confirmationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

      // Update existing user
      existingUser.name = name;
      existingUser.password = await bcrypt.hash(password, await bcrypt.genSalt(10));
      existingUser.emailConfirmationToken = confirmationToken;
      existingUser.emailConfirmationExpires = confirmationExpires;
      existingUser.isAdmin = email === ADMIN_EMAIL;
      await existingUser.save();

      // Send confirmation email
      await sendEmailConfirmation(email, confirmationToken);

      return res.status(200).json({
        message: "Registration updated. Please check your email to confirm your account.",
        requiresConfirmation: true
      });
    }

    // Create new user
    const salt = await bcrypt.genSalt(10);
    const hashed = await bcrypt.hash(password, salt);
    const confirmationToken = generateConfirmationToken();
    const confirmationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    const user = await User.create({
      name,
      email,
      password: hashed,
      emailConfirmationToken: confirmationToken,
      emailConfirmationExpires: confirmationExpires,
      isAdmin: email === ADMIN_EMAIL,
    });

    // Send confirmation email
    await sendEmailConfirmation(email, confirmationToken);

    res.status(201).json({
      message: "Registration successful. Please check your email to confirm your account.",
      requiresConfirmation: true,
      _id: user._id,
      name: user.name,
      email: user.email,
    });
  } catch (err) {
    console.error('Registration error:', err);
    res.status(500).json({ message: err.message });
  }
};

const confirmEmail = async (req, res) => {
  try {
    const { token } = req.params;

    const user = await User.findOne({
      emailConfirmationToken: token,
      emailConfirmationExpires: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({ message: "Invalid or expired confirmation token" });
    }

    // Confirm the email
    user.isEmailConfirmed = true;
    user.emailConfirmationToken = undefined;
    user.emailConfirmationExpires = undefined;
    await user.save();

    res.status(200).json({
      message: "Email confirmed successfully! You can now log in.",
      confirmed: true
    });
  } catch (err) {
    console.error('Email confirmation error:', err);
    res.status(500).json({ message: err.message });
  }
};

const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    // Check if email is confirmed
    if (!user.isEmailConfirmed) {
      return res.status(401).json({
        message: "Please confirm your email before logging in",
        requiresConfirmation: true
      });
    }

    if (user && (await bcrypt.compare(password, user.password))) {
      setAuthCookie(res, user._id);
      res.json({
        _id: user._id,
        name: user.name,
        email: user.email,
        isAdmin: user.isAdmin,
        // Backwards-compat: old clients may still read this value.
        token: generateToken(user._id),
      });
    } else {
      res.status(401).json({ message: "Invalid email or password" });
    }
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const getMe = async (req, res) => {
  try {
    res.json({
      _id: req.user._id,
      name: req.user.name,
      email: req.user.email,
      isAdmin: req.user.isAdmin,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const requestLoginOtp = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ message: "Email is required" });
    }

    if (!process.env.EMAIL_USER?.trim() || !process.env.EMAIL_PASS?.trim()) {
      return res.status(500).json({
        message:
          "Server cannot send email: set EMAIL_USER and EMAIL_PASS in backend/.env (Gmail app password).",
      });
    }

    const user = await User.findOne({ email: email.trim() });
    if (!user) {
      return res.status(404).json({ message: "No account found with this email" });
    }
    if (!user.isEmailConfirmed) {
      return res.status(403).json({
        message: "Please confirm your email before using OTP login",
      });
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const salt = await bcrypt.genSalt(10);
    user.loginOtpHash = await bcrypt.hash(otp, salt);
    user.loginOtpExpires = new Date(Date.now() + 10 * 60 * 1000);
    await user.save();

    try {
      await sendLoginOtpEmail(user.email, otp);
    } catch (mailErr) {
      console.error("Login OTP email error:", mailErr);
      return res.status(500).json({
        message:
          mailErr.message ||
          "Failed to send OTP email. Check EMAIL_USER / EMAIL_PASS (Gmail app password) in backend .env.",
      });
    }

    res.json({ message: "OTP sent to your email" });
  } catch (err) {
    console.error("requestLoginOtp:", err);
    res.status(500).json({ message: err.message });
  }
};

const verifyLoginOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;
    if (!email || !otp) {
      return res.status(400).json({ message: "Email and OTP are required" });
    }

    const user = await User.findOne({ email: email.trim() });
    if (!user?.loginOtpHash || !user?.loginOtpExpires) {
      return res.status(400).json({
        message: "Invalid or expired OTP. Request a new code from the login screen.",
      });
    }
    if (user.loginOtpExpires.getTime() < Date.now()) {
      return res.status(400).json({
        message: "OTP has expired. Request a new one.",
      });
    }

    const ok = await bcrypt.compare(String(otp).trim(), user.loginOtpHash);
    if (!ok) {
      return res.status(401).json({ message: "Invalid OTP" });
    }

    user.loginOtpHash = undefined;
    user.loginOtpExpires = undefined;
    await user.save();

    setAuthCookie(res, user._id);
    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      isAdmin: user.isAdmin,
      // Backwards-compat: old clients may still read this value.
      token: generateToken(user._id),
    });
  } catch (err) {
    console.error("verifyLoginOtp:", err);
    res.status(500).json({ message: err.message });
  }
};

const logoutUser = async (req, res) => {
  clearAuthCookie(res);
  res.json({ message: "Logged out" });
};

const requestMagicLink = async (req, res) => {
  try {
    const { email } = req.body || {};
    const clean = String(email || "").trim().toLowerCase();
    if (!clean) return res.status(400).json({ message: "Email is required" });

    if (!process.env.EMAIL_USER?.trim() || !process.env.EMAIL_PASS?.trim()) {
      return res.status(500).json({
        message:
          "Server cannot send email: set EMAIL_USER and EMAIL_PASS in backend/.env (Gmail app password).",
      });
    }

    const user = await User.findOne({ email: clean });
    if (!user) {
      // Avoid account enumeration: return success anyway
      return res.json({ message: "If an account exists, a sign-in link was sent." });
    }
    if (!user.isEmailConfirmed) {
      return res.status(403).json({
        message: "Please confirm your email before using email link sign-in",
      });
    }

    const rawToken = crypto.randomBytes(32).toString("hex");
    const tokenHash = crypto.createHash("sha256").update(rawToken).digest("hex");
    user.magicLoginTokenHash = tokenHash;
    user.magicLoginExpires = new Date(Date.now() + 15 * 60 * 1000);
    await user.save();

    const base =
      process.env.FRONTEND_URL || process.env.CLIENT_URL || "http://localhost:5173";
    const magicUrl = `${String(base).replace(/\/$/, "")}/magic-login?token=${rawToken}&email=${encodeURIComponent(clean)}`;
    await sendMagicLoginEmail(clean, magicUrl);

    return res.json({ message: "If an account exists, a sign-in link was sent." });
  } catch (err) {
    console.error("requestMagicLink:", err);
    return res.status(500).json({ message: err.message });
  }
};

const verifyMagicLink = async (req, res) => {
  try {
    const { email, token } = req.body || {};
    const clean = String(email || "").trim().toLowerCase();
    const rawToken = String(token || "").trim();
    if (!clean || !rawToken) {
      return res.status(400).json({ message: "Email and token are required" });
    }

    const user = await User.findOne({ email: clean });
    if (!user?.magicLoginTokenHash || !user?.magicLoginExpires) {
      return res.status(400).json({ message: "Invalid or expired sign-in link." });
    }
    if (user.magicLoginExpires.getTime() < Date.now()) {
      return res.status(400).json({ message: "Sign-in link has expired. Request a new one." });
    }

    const tokenHash = crypto.createHash("sha256").update(rawToken).digest("hex");
    if (tokenHash !== user.magicLoginTokenHash) {
      return res.status(401).json({ message: "Invalid or expired sign-in link." });
    }

    user.magicLoginTokenHash = undefined;
    user.magicLoginExpires = undefined;
    await user.save();

    setAuthCookie(res, user._id);
    return res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      isAdmin: user.isAdmin,
      token: generateToken(user._id),
    });
  } catch (err) {
    console.error("verifyMagicLink:", err);
    return res.status(500).json({ message: err.message });
  }
};

const googleClient = () =>
  new OAuth2Client({
    clientId: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    redirectUri: process.env.GOOGLE_REDIRECT_URI,
  });

const startGoogleOAuth = async (req, res) => {
  const cid = String(process.env.GOOGLE_CLIENT_ID || "").trim();
  const secret = String(process.env.GOOGLE_CLIENT_SECRET || "").trim();
  const redir = String(process.env.GOOGLE_REDIRECT_URI || "").trim();
  const missing = [];
  if (!cid) missing.push("GOOGLE_CLIENT_ID");
  if (!secret) missing.push("GOOGLE_CLIENT_SECRET");
  if (!redir) missing.push("GOOGLE_REDIRECT_URI");
  if (missing.length) {
    return res.status(500).json({
      message:
        `Google OAuth not configured. Missing: ${missing.join(", ")}. Set them in backend/.env`,
    });
  }

  const base =
    process.env.FRONTEND_URL || process.env.CLIENT_URL || "http://localhost:5173";
  const next = String(req.query.next || "/home");
  const state = Buffer.from(
    JSON.stringify({ next, base: String(base).replace(/\/$/, "") })
  ).toString("base64url");

  const url = googleClient().generateAuthUrl({
    access_type: "online",
    scope: ["openid", "email", "profile"],
    prompt: "select_account",
    state,
  });

  return res.redirect(url);
};

const googleOauthCallback = async (req, res) => {
  try {
    const { code, state } = req.query || {};
    if (!code) return res.status(400).json({ message: "Missing OAuth code." });

    const client = googleClient();
    const { tokens } = await client.getToken(String(code));
    const idToken = tokens?.id_token;
    if (!idToken) {
      return res.status(400).json({ message: "Google did not return an id_token." });
    }

    const ticket = await client.verifyIdToken({
      idToken,
      audience: process.env.GOOGLE_CLIENT_ID,
    });
    const payload = ticket.getPayload() || {};
    const email = String(payload.email || "").trim().toLowerCase();
    const googleId = String(payload.sub || "").trim();
    const name = String(payload.name || payload.given_name || "User").trim();

    if (!email) return res.status(400).json({ message: "Google account email not available." });

    let user = await User.findOne({ email });
    if (!user) {
      user = await User.create({
        name,
        email,
        password: crypto.randomBytes(24).toString("hex"),
        isEmailConfirmed: true,
        googleId: googleId || undefined,
      });
    } else {
      let changed = false;
      if (!user.isEmailConfirmed) {
        user.isEmailConfirmed = true;
        user.emailConfirmationToken = undefined;
        user.emailConfirmationExpires = undefined;
        changed = true;
      }
      if (googleId && user.googleId !== googleId) {
        user.googleId = googleId;
        changed = true;
      }
      if (name && user.name !== name) {
        user.name = name;
        changed = true;
      }
      if (changed) await user.save();
    }

    setAuthCookie(res, user._id);

    let redirectBase =
      process.env.FRONTEND_URL || process.env.CLIENT_URL || "http://localhost:5173";
    let next = "/home";
    if (state) {
      try {
        const decoded = JSON.parse(Buffer.from(String(state), "base64url").toString("utf8"));
        if (decoded?.base) redirectBase = decoded.base;
        if (decoded?.next) next = decoded.next;
      } catch {
        /* ignore */
      }
    }

    return res.redirect(`${String(redirectBase).replace(/\/$/, "")}${next}`);
  } catch (err) {
    console.error("googleOauthCallback:", err);
    return res.status(500).json({ message: err.message });
  }
};

module.exports = {
  registerUser,
  loginUser,
  confirmEmail,
  getMe,
  requestLoginOtp,
  verifyLoginOtp,
  logoutUser,
  requestMagicLink,
  verifyMagicLink,
  startGoogleOAuth,
  googleOauthCallback,
};
