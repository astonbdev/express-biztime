// npm packages
const request = require("supertest");

// app imports
const app = require("../app");
const db = require("../db");

let testCompany;

beforeEach(async function(){
    await db.query("DELETE FROM companies");

    let result = await db.query(`
    INSERT INTO companies (code, name, description)
    VALUES ('test', 'TestCompany', 'Testing')
    RETURNING code, name, description`);

    testCompany = result.rows[0];

});

/** GET /companies - returns {companies:
 * [company: {code, name, description}]} */

describe("GET /companies", function(){
    /** test success */
    test("Gets list of companies", async function(){
        const resp = await request(app).get('/companies');

        expect(resp.statusCode).toEqual(200);
        expect(resp.body).toEqual(
            {companies: [{
                code: testCompany.code,
                name: testCompany.name,
            }]}
        );
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
