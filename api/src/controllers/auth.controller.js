const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const userRepo = require("../repositories/user.repository");

const register = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        error: "Bad Request",
        message: "email et password requis",
      });
    }

    const existing = await userRepo.findByEmail(email);
    if (existing) {
      return res.status(409).json({
        error: "Conflict",
        message: "Email déjà utilisé",
      });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const user = await userRepo.createUser(email, passwordHash);

    return res.status(201).json({
      id: user.id,
      email: user.email,
      created_at: user.created_at,
    });
  } catch (e) {
    next(e);
  }
};

const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        error: "Bad Request",
        message: "email et password requis",
      });
    }

    const user = await userRepo.findByEmail(email);
    if (!user) {
      return res.status(401).json({
        error: "Unauthorized",
        message: "Identifiants invalides",
      });
    }

    const ok = await bcrypt.compare(password, user.password_hash);
    if (!ok) {
      return res.status(401).json({
        error: "Unauthorized",
        message: "Identifiants invalides",
      });
    }

    if (!process.env.JWT_SECRET) {
      return res.status(500).json({
        error: "Server Error",
        message: "JWT_SECRET manquant dans .env",
      });
    }

    const token = jwt.sign(
      { sub: user.id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || "1d" }
    );

    return res.json({ token });
  } catch (e) {
    next(e);
  }
};

module.exports = { register, login };
