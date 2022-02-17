"use strict";

const express = require("express");
const db = require("../db.js");
const { NotFoundError } = require("../expressError.js");
const router = new express.Router();


/** Return invoice info as JSON like: {invoices: [{id, comp_code}, ...]} */
router.get("/", async function (req, res) {

    const results = await db.query(
        `SELECT id, comp_code
        FROM invoices`);

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
               FROM companies
               WHERE id = $1`,
        [id]
    );

    const invoice = invResults.rows[0];

    const invCompCode = invoice.comp_code;

    delete invoice.comp_code;


    const compResult = await db.query(
        `SELECT code, name, description
                   FROM companies
                   WHERE code = $1`,
        [invCompCode]
      );

    const company = compResult.rows[0];

    invoice.company = company

    
    return res.json({ invoice });
});

/** Accepts JSON body of {comp_code, amt}
 * Adds invoice
 * Returns JSON of {invoice: {id, comp_code, amt, paid, add_date, paid_date}}
 */
router.post("/", async function (req, res) {


    return res.status(201).json({ invoice });
});

/** Updates invoice amt
 * Accepts JSON body of {amt}
 * Returns JSON of {invoice: {id, comp_code, amt, paid, add_date, paid_date}} if found
 * Returns 404 if not found.
 */
router.put("/", async function (req, res) {

});

/** Accepts invoice ID in URL
 * Returns {status: "deleted"} if found.
 * Returns 404 if not found.
 */
router.delete("/", async function (req, res) {

});

module.exports = router;

// SELECT amt
//     FROM invoices
//     WHERE comp_code = $1
//     JOIN companies
//     ON companies.code = invoices.comp_code
