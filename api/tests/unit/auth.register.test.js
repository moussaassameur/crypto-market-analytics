const bcrypt = require("bcrypt");
const { register } = require("../../src/controllers/auth.controller");
const userRepo = require("../../src/repositories/user.repository");

// Mock dependencies
jest.mock("../../src/repositories/user.repository");
jest.mock("bcrypt");

describe("auth.controller - register", () => {
  let req, res, next;

  beforeEach(() => {
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
    jest.clearAllMocks();
  });

  it("devrait retourner 400 si email manquant", async () => {
    req.body = { password: "test123", name: "Test User" };

    await register(req, res, next);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      error: "Bad Request",
      message: "email, password et name requis",
    });
    expect(next).not.toHaveBeenCalled();
  });

  it("devrait retourner 400 si password manquant", async () => {
    req.body = { email: "test@example.com", name: "Test User" };

    await register(req, res, next);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      error: "Bad Request",
      message: "email, password et name requis",
    });
    expect(next).not.toHaveBeenCalled();
  });

  it("devrait retourner 400 si name manquant", async () => {
    req.body = { email: "test@example.com", password: "test123" };

    await register(req, res, next);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      error: "Bad Request",
      message: "email, password et name requis",
    });
    expect(next).not.toHaveBeenCalled();
  });

  it("devrait retourner 409 si email déjà utilisé", async () => {
    req.body = { email: "existing@example.com", password: "test123", name: "Test User" };
    userRepo.findByEmail.mockResolvedValue({
      id: 1,
      email: "existing@example.com",
    });

    await register(req, res, next);

    expect(userRepo.findByEmail).toHaveBeenCalledWith("existing@example.com");
    expect(res.status).toHaveBeenCalledWith(409);
    expect(res.json).toHaveBeenCalledWith({
      error: "Conflict",
      message: "Email déjà utilisé",
    });
    expect(bcrypt.hash).not.toHaveBeenCalled();
    expect(userRepo.createUser).not.toHaveBeenCalled();
    expect(next).not.toHaveBeenCalled();
  });

  it("devrait créer un utilisateur avec succès (201)", async () => {
    req.body = { email: "new@example.com", password: "securePassword123", name: "New User" };
    
    userRepo.findByEmail.mockResolvedValue(null);
    bcrypt.hash.mockResolvedValue("$2b$10$hashedPassword");
    userRepo.createUser.mockResolvedValue({
      id: 42,
      email: "new@example.com",
      name: "New User",
      created_at: "2025-12-29T10:00:00.000Z",
    });

    await register(req, res, next);

    expect(userRepo.findByEmail).toHaveBeenCalledWith("new@example.com");
    expect(bcrypt.hash).toHaveBeenCalledWith("securePassword123", 10);
    expect(userRepo.createUser).toHaveBeenCalledWith(
      "new@example.com",
      "$2b$10$hashedPassword",
      "New User"
    );
    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith({
      id: 42,
      email: "new@example.com",
      name: "New User",
      created_at: "2025-12-29T10:00:00.000Z",
    });
    expect(next).not.toHaveBeenCalled();
  });

  it("devrait appeler next() si createUser échoue", async () => {
    req.body = { email: "test@example.com", password: "test123", name: "Test User" };
    userRepo.findByEmail.mockResolvedValue(null);
    bcrypt.hash.mockResolvedValue("$2b$10$hashedPassword");
    const error = new Error("Database error");
    userRepo.createUser.mockRejectedValue(error);

    await register(req, res, next);

    expect(next).toHaveBeenCalledWith(error);
    expect(res.status).not.toHaveBeenCalled();
  });
});
