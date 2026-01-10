const verifyAdmin = require("../../src/middlewares/verifyAdmin");

describe("verifyAdmin middleware", () => {
  let req, res, next;

  beforeEach(() => {
    req = {
      user: null,
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

  it("devrait retourner 401 si req.user n'existe pas", () => {
    req.user = null;

    verifyAdmin(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({
      error: "Unauthorized",
      message: "Non authentifié",
    });
    expect(next).not.toHaveBeenCalled();
  });

  it("devrait retourner 403 si le rôle n'est pas admin", () => {
    req.user = {
      sub: 1,
      email: "user@example.com",
      role: "user",
    };

    verifyAdmin(req, res, next);

    expect(res.status).toHaveBeenCalledWith(403);
    expect(res.json).toHaveBeenCalledWith({
      error: "Forbidden",
      message: "Accès admin requis",
    });
    expect(next).not.toHaveBeenCalled();
  });

  it("devrait retourner 403 si role est undefined", () => {
    req.user = {
      sub: 1,
      email: "user@example.com",
    };

    verifyAdmin(req, res, next);

    expect(res.status).toHaveBeenCalledWith(403);
    expect(res.json).toHaveBeenCalledWith({
      error: "Forbidden",
      message: "Accès admin requis",
    });
    expect(next).not.toHaveBeenCalled();
  });

  it("devrait appeler next() si l'utilisateur est admin", () => {
    req.user = {
      sub: 5,
      email: "admin@example.com",
      role: "admin",
    };

    verifyAdmin(req, res, next);

    expect(next).toHaveBeenCalledWith();
    expect(res.status).not.toHaveBeenCalled();
    expect(res.json).not.toHaveBeenCalled();
  });
});
