"use strict";

const express = require("express");
const db = require("../db.js");
const { NotFoundError, BadRequestError } = require("../expressError.js");
const router = new express.Router();


/** Return invoice info as JSON like: {invoices: [{id, comp_code}, ...]} */
router.get("/", async function (req, res) {

  const results = await db.query(
    `SELECT id, comp_code
        FROM invoices`
  );

  const invoices = results.rows;
  return res.json({ invoices });
});


/** Accepts invoice ID from URL.
 * Return JSON obj for given invoice like
 * {invoice: {id, amt, paid, add_date, paid_date,
 * company: {code, name, description}} if found.
 * Returns 404 if not found.
 * */
router.get("/:id", async function (req, res) {

  const id = req.params.id;

  const invResults = await db.query(
    `SELECT id, amt, paid, add_date, paid_date, comp_code
               FROM invoices
               WHERE id = $1`,
    [id]
  );
  const invoice = invResults.rows[0];

  if (invoice === undefined) {
    throw new NotFoundError(
      `Company invoice id ${id} not found.`
    );
  }

  const invCompCode = invoice.comp_code;
  delete invoice.comp_code;

  const compResult = await db.query(
    `SELECT code, name, description
                   FROM companies
                   WHERE code = $1`,
    [invCompCode]
  );
  const company = compResult.rows[0];

  invoice.company = company;

  return res.json({ invoice });
});


/** Accepts JSON body of {comp_code, amt}
 * Adds invoice
 * Returns JSON of {invoice: {id, comp_code, amt, paid, add_date, paid_date}}
 */
router.post("/", async function (req, res) {

  const { comp_code, amt } = req.body;

  const result = await db.query(
    `INSERT INTO invoices (comp_code, amt)
            VALUES ($1, $2)
            RETURNING id, comp_code, amt, paid, add_date, paid_date`,
    [comp_code, amt]
  );
  const invoice = result.rows[0];

  if (invoice === undefined) {
    throw new NotFoundError(
      `Company ${comp_code} not found. No changes made`
    );
  }

  return res.status(201).json({ invoice });
});


/** Updates invoice amt
 * Accepts JSON body of {amt}
 * Returns JSON of {invoice: {id, comp_code, amt, paid, add_date, paid_date}} if found
 * Returns 404 if not found.
 */
router.put("/:id", async function (req, res) {

  const id = req.params.id;
  const { amt } = req.body;


  const result = await db.query(
    `UPDATE invoices
             SET amt=$1
             WHERE id = $2
             RETURNING id, comp_code, amt, paid, add_date, paid_date`,
    [amt, id]
  );

  const invoice = result.rows[0];
  if (!invoice) {
    throw new NotFoundError(`Company invoice id ${id} not found.`);
  }

  return res.json({ invoice });

});


/** Accepts invoice ID in URL
 * Returns {status: "deleted"} if found.
 * Returns 404 if not found.
 */
router.delete("/:id", async function (req, res) {

  const id = req.params.id;

  const deleteResults = await db.query(
    `DELETE FROM invoices 
        WHERE id = $1
        RETURNING id`,
    [id]
  );

  if (deleteResults === undefined) {
    throw new NotFoundError(`Invoice code ${id} not found; not deleted.`);
  }

  return res.json({ status: "deleted" });

});

module.exports = router;