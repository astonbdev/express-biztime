// npm packages
const request = require("supertest");

// app imports
const app = require("../app");
const db = require("../db");

let testCompany;

beforeEach(async function () {
  await db.query("DELETE FROM companies");

  let result = await db.query(`
    INSERT INTO companies (code, name, description)
    VALUES ('test', 'TestCompany', 'Testing')
    RETURNING code, name, description`);

  testCompany = result.rows[0];

});

/** GET /companies - returns {companies:
 * [company: {code, name, description}]} */

describe("GET /companies", function () {
  /** test success */
  test("Gets list of companies", async function () {
    const resp = await request(app).get('/companies');

    expect(resp.statusCode).toEqual(200);
    expect(resp.body).toEqual(
      {
        companies: [{
          code: testCompany.code,
          name: testCompany.name,
        }]
      }
    );
  });
});

describe("GET /company", function () {
  /** test success */
  test("Get company with single ID", async function () {
    const resp = await request(app).get('/companies/test');

    expect(resp.statusCode).toEqual(200);
    expect(resp.body).toEqual(
      {
        company: {
          code: testCompany.code,
          name: testCompany.name,
          description: testCompany.description,
          invoices: [],
        }
      }
    );
  });

  /** test failure */
  test("Fail to get company with single ID", async function () {
    const resp = await request(app).get('/companies/test9001');

    expect(resp.statusCode).toEqual(404);
  });

});

describe("DELETE /company", function () {
  /** test success */
  test("Delete company with single ID", async function () {
    const resp = await request(app).delete('/companies/test');

    const deleteResults = (await db.query(`SELECT * FROM companies`)).rows;

    expect(resp.statusCode).toEqual(200);
    expect(resp.body).toEqual({ status: "deleted" });
    expect(deleteResults).toEqual([]);

  });

  /** test failure */
  test("Delete company with single ID", async function () {
    const resp = await request(app).delete('/companies/test9001');

    const deleteResults = (await db.query(`SELECT * FROM companies`)).rows;

    expect(resp.statusCode).toEqual(404);

    expect(resp.body.error.message).toEqual("Company code not found; not deleted.");
    expect(deleteResults.length).toEqual(1);

  });

});

// Getting all cats
// Getting a single cat
// What finding successfully looks like
// What happens when it is not found
// Deleting a cat
// What deleting successfully looks like
// What happens when it is not found
// Adding a cat
// What creating successfully looks like
// What happens when you create a duplicate cat
// What happens when you are missing required data
