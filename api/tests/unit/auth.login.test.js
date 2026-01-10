const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { login } = require("../../src/controllers/auth.controller");
const userRepo = require("../../src/repositories/user.repository");

// Mock dependencies
jest.mock("../../src/repositories/user.repository");
jest.mock("bcrypt");
jest.mock("jsonwebtoken");

describe("auth.controller - login", () => {
  let req, res, next;
  const originalEnv = process.env;

  beforeEach(() => {
    jest.resetModules();
    process.env = { ...originalEnv };
    process.env.JWT_SECRET = "test-secret-key";
    process.env.JWT_EXPIRES_IN = "1d";

    req = {
      body: {},
    };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    };
    next = jest.fn();
  });

  afterEach(() => {
    process.env = originalEnv;
    jest.clearAllMocks();
  });

  it("devrait retourner 400 si champs manquants", async () => {
    req.body = { email: "test@example.com" };

    await login(req, res, next);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      error: "Bad Request",
      message: "email et password requis",
    });
    expect(next).not.toHaveBeenCalled();
  });

  it("devrait retourner 401 si utilisateur inexistant", async () => {
    req.body = { email: "unknown@example.com", password: "test123" };
    userRepo.findByEmail.mockResolvedValue(null);

    await login(req, res, next);

    expect(userRepo.findByEmail).toHaveBeenCalledWith("unknown@example.com");
    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({
      error: "Unauthorized",
      message: "Identifiants invalides",
    });
    expect(bcrypt.compare).not.toHaveBeenCalled();
    expect(next).not.toHaveBeenCalled();
  });

  it("devrait retourner 401 si mot de passe incorrect", async () => {
    req.body = { email: "user@example.com", password: "wrongPassword" };
    userRepo.findByEmail.mockResolvedValue({
      id: 1,
      email: "user@example.com",
      password_hash: "$2b$10$hashedPassword",
      role: "user",
    });
    bcrypt.compare.mockResolvedValue(false);

    await login(req, res, next);

    expect(userRepo.findByEmail).toHaveBeenCalledWith("user@example.com");
    expect(bcrypt.compare).toHaveBeenCalledWith(
      "wrongPassword",
      "$2b$10$hashedPassword"
    );
    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({
      error: "Unauthorized",
      message: "Identifiants invalides",
    });
    expect(jwt.sign).not.toHaveBeenCalled();
    expect(next).not.toHaveBeenCalled();
  });

  it("devrait retourner 500 si JWT_SECRET manquant", async () => {
    delete process.env.JWT_SECRET;
    req.body = { email: "user@example.com", password: "correctPassword" };
    userRepo.findByEmail.mockResolvedValue({
      id: 1,
      email: "user@example.com",
      password_hash: "$2b$10$hashedPassword",
      role: "user",
    });
    bcrypt.compare.mockResolvedValue(true);

    await login(req, res, next);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({
      error: "Server Error",
      message: "JWT_SECRET manquant dans .env",
    });
    expect(jwt.sign).not.toHaveBeenCalled();
    expect(next).not.toHaveBeenCalled();
  });

  it("devrait retourner 200 et un token JWT si authentification réussie", async () => {
    req.body = { email: "user@example.com", password: "correctPassword" };
    userRepo.findByEmail.mockResolvedValue({
      id: 1,
      email: "user@example.com",
      password_hash: "$2b$10$hashedPassword",
      role: "user",
    });
    bcrypt.compare.mockResolvedValue(true);
    jwt.sign.mockReturnValue("mocked.jwt.token");

    await login(req, res, next);

    expect(userRepo.findByEmail).toHaveBeenCalledWith("user@example.com");
    expect(bcrypt.compare).toHaveBeenCalledWith(
      "correctPassword",
      "$2b$10$hashedPassword"
    );
    expect(jwt.sign).toHaveBeenCalledWith(
      { sub: 1, email: "user@example.com", role: "user" },
      "test-secret-key",
      { expiresIn: "1d" }
    );
    expect(res.json).toHaveBeenCalledWith({ token: "mocked.jwt.token" });
    expect(res.status).not.toHaveBeenCalled();
    expect(next).not.toHaveBeenCalled();
  });

  it("devrait appeler next() si bcrypt.compare échoue", async () => {
    req.body = { email: "user@example.com", password: "test123" };
    userRepo.findByEmail.mockResolvedValue({
      id: 1,
      email: "user@example.com",
      password_hash: "$2b$10$hashedPassword",
    });
    const error = new Error("Bcrypt error");
    bcrypt.compare.mockRejectedValue(error);

    await login(req, res, next);

    expect(next).toHaveBeenCalledWith(error);
    expect(res.status).not.toHaveBeenCalled();
  });
});
