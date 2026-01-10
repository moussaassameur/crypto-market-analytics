const jwt = require("jsonwebtoken");
const verifyToken = require("../middlewares/verifyToken");

jest.mock("jsonwebtoken");

describe("verifyToken middleware", () => {
  let req, res, next;
  const originalEnv = process.env;

  beforeEach(() => {
    jest.resetModules();
    process.env = { ...originalEnv };
    process.env.JWT_SECRET = "test-secret-key";

    req = {
      headers: {},
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

  it("devrait retourner 401 si le header Authorization est manquant", () => {
    req.headers = {};

    verifyToken(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({
      error: "Unauthorized",
      message: "Token manquant",
    });
    expect(next).not.toHaveBeenCalled();
  });

  it("devrait retourner 401 si le token est invalide", () => {
    req.headers.authorization = "Bearer invalid.token";
    jwt.verify.mockImplementation(() => {
      throw new Error("Invalid token");
    });

    verifyToken(req, res, next);

    expect(jwt.verify).toHaveBeenCalledWith("invalid.token", "test-secret-key");
    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({
      error: "Unauthorized",
      message: "Token invalide",
    });
    expect(next).not.toHaveBeenCalled();
  });

  it("devrait retourner 401 si le token a expiré", () => {
    req.headers.authorization = "Bearer expired.token";
    jwt.verify.mockImplementation(() => {
      const error = new Error("jwt expired");
      error.name = "TokenExpiredError";
      throw error;
    });

    verifyToken(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({
      error: "Unauthorized",
      message: "Token invalide",
    });
    expect(next).not.toHaveBeenCalled();
  });

  it("devrait définir req.user et appeler next() si le token est valide", () => {
    req.headers.authorization = "Bearer valid.token";
    const decoded = {
      sub: 1,
      email: "user@example.com",
      role: "user",
      iat: 1234567890,
      exp: 9999999999,
    };
    jwt.verify.mockReturnValue(decoded);

    verifyToken(req, res, next);

    expect(jwt.verify).toHaveBeenCalledWith("valid.token", "test-secret-key");
    expect(req.user).toEqual(decoded);
    expect(next).toHaveBeenCalledWith();
    expect(res.status).not.toHaveBeenCalled();
    expect(res.json).not.toHaveBeenCalled();
  });


});
