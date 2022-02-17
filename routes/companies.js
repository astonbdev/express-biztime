"use strict";

const express = require("express");
const db = require("../db.js");
const { NotFoundError } = require("../expressError.js");
const router = new express.Router();


/** returns {companies: [{code, name}, ...]} */
router.get("/", async function (req, res) {

  const results = await db.query(
    `SELECT code, name
               FROM companies`);

  const companies = results.rows;
  return res.json({ companies }); 

});


/** Accepts a company code in the url, returns {companies: [{code, name}, ...]} */
router.get("/:code", async function (req, res) {

  // TODO: update to include invoices associated

  const code = req.params.code;

  const results = await db.query(
    `SELECT code, name, description
               FROM companies
               WHERE code = $1`,
    [code]
  );

  const company = results.rows[0];
  if (!company) {
    throw new NotFoundError("Company not found");
  }

  return res.json({ company });
});


/** Accepts JSON body of {code, name, description},
 * returns {company: {code, name, description}} */
router.post("/", async function (req, res) {
  const { code, name, description } = req.body;

  code.toLowerCase(); // Standardize our company code input to lowercase

  const result = await db.query(
    `INSERT INTO companies (code, name, description)
             VALUES ($1, $2, $3)
             RETURNING code, name, description`,
    [code, name, description]
  );

  const company = result.rows[0];

  return res.status(201).json({ company });
});


/** Accepts JSON body of {name, description}, 
 * replaces company data from JSON body, 
 * returns updated company object of {company: {code, name, description}} */
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
    throw new NotFoundError("Company code not found.");
  }

  return res.json({ company });
});


/** Accepts company code in url, deletes company from db,
 *  returns {status: "deleted"} */
router.delete("/:code", async function (req, res) {

  const code = req.params.code;

  const deleteResults = await db.query(
    `DELETE FROM companies 
      WHERE code = $1
      RETURNING code`,
    [code]
  );

  if (deleteResults === undefined) {
    throw new NotFoundError("Company code not found; not deleted.");
  }

  return res.json({ status: "deleted" });
});

module.exports = router;


