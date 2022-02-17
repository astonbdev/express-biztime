"use strict";

const express = require("express");
const db = require("../db.js");
const router = new express.Router();

router.get("/", async function (req, res) {
  const type = req.query.type;

  const results = await db.query(
    `SELECT code, name
               FROM companies`);

  const companies = results.rows;
  return res.json({ companies: companies });

});

router.get("/:code", async function (req, res) {
  const code = req.params.code;

  const results = await db.query(
    `SELECT code, name, description
               FROM companies
               WHERE code = $1`, [code]);
  const company = results.rows;
  return res.json({ company: company });
});

router.post("/", async function (req, res) {
  const { code, name, description } = req.body;

  const result = await db.query(
    `INSERT INTO companies (code, name, description)
             VALUES ($1, $2, $3)
             RETURNING code, name, description`,
    [code, name, description],
  );
  const company = result.rows;
  return res.status(201).json({ company: company });
});

router.put("/:code", async function (req, res) {

});

router.delete("/:code", async function (req, res) {

});

module.exports = router;

