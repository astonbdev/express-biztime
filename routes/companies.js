"use strict";

const express = require("express");
const db = require("../db.js");
const { NotFoundError } = require("../expressError.js");
const router = new express.Router();

/** returns all companies */
router.get("/", async function (req, res) {

  const results = await db.query(
    `SELECT code, name
               FROM companies`);

  const companies = results.rows;
  return res.json({ companies: companies }); // CR: we can use obj shorthand here

});

// CR: TODO: Explicitly say what it accepts and what it returns
// CR: TODO: Even provide an example, especially anything accepting a JSON body
/** returns single company, using JSON body */
router.get("/:code", async function (req, res) {
  const code = req.params.code;

  const results = await db.query(
    `SELECT code, name, description
               FROM companies
               WHERE code = $1`,
    [code]
  );

  const company = results.rows[0];
  if (!company) {
    throw new NotFoundError(); // CR: TODO: pass a helpful message in our error
  }

  return res.json({ company: company });
});

/** add single company from JSON body, returns added company */
router.post("/", async function (req, res) {
  const { code, name, description } = req.body;

  const result = await db.query(
    `INSERT INTO companies (code, name, description)
             VALUES ($1, $2, $3)
             RETURNING code, name, description`,
    [code, name, description]
  );

  // CR: TODO: Think about how you would standardize/normalize the input

  const company = result.rows[0];

  return res.status(201).json({ company: company });
});

/** replaces company data from JSON body, returns updated company */
router.put("/:code", async function (req, res) {
  const code = req.params.code;
  const { name, description } = req.body;

  const result = await db.query(
    `UPDATE companies
           SET name=$1,
               description=$2
           WHERE code = $3
           RETURNING code, name, description`,
    [name, description, code]
  );

  const company = result.rows[0];
  if (!company) {
    throw new NotFoundError(); // CR: TODO: error message
  }

  return res.json({ company: company });
});

/** deletes company from db, returns successful deletion message */
router.delete("/:code", async function (req, res) {

  const results = await db.query(
    `SELECT code, name, description
               FROM companies
               WHERE code = $1`,
    [code]
  );

  const company = results.rows[0];



  if (company) {
    await db.query(
      "DELETE FROM companies WHERE code = $1",
      [req.params.code]

      // CR: TODO: have this return the company code (SQL line) that was deleted
    );
  }
  else {
    throw new NotFoundError();
  }

  return res.json({ message: "Deleted" });
});

module.exports = router;

// SELECT amt
//     FROM invoices
//     WHERE comp_code = $1
//     JOIN companies
//     ON companies.code = invoices.comp_code


