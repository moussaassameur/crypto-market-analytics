const express = require("express");
const router = express.Router();
const db = require("../db/pool");

router.get("/health/db", async (req, res, next) => {
  try {
    const r = await db.query("SELECT 1 AS ok");
    res.json({ db: "ok", result: r.rows[0] });
  } catch (e) {
    next(e);
  }
});

module.exports = router;
