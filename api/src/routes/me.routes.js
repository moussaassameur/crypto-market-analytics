const express = require("express");
const verifyToken = require("../middlewares/verifyToken");

const router = express.Router();

router.get("/me", verifyToken, (req, res) => {
  res.json({
    id: req.user.sub,
    email: req.user.email,
  });
});

module.exports = router;
