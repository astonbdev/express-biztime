"use strict";

/** Database setup for BizTime. */

const { Client } = require("pg");

console.log("NODE_ENV", process.env.NODE_ENV);

const DB_URI = process.env.NODE_ENV === "test"
    ? "postgresql:///biztime_test"
    : "postgresql:///biztime";

let db = new Client({
  connectionString: DB_URI
});

db.connect();

module.exports = db;
