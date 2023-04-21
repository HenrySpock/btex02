const request = require("supertest");
const app = require("../app");
const db = require("../db");

// Run tests with:
// jest routes/invoices.test.js

describe("Test invoice routes", function () {
  let testInvoice;

  beforeAll(async function () {
    // Add a company for testing
    await db.query(
      `INSERT INTO companies (code, name, description) VALUES ('apple', 'Apple Computer', 'Maker of OSX.')`
    ); 
    // Create a test invoice before each test
    const result = await db.query(
      `INSERT INTO invoices (comp_code, amt, paid, add_date, paid_date)
      VALUES ('apple', 1000, true, '2022-04-01', '2022-04-15')
      RETURNING id, comp_code, amt, paid, add_date, paid_date`
    ); 
    testInvoice = result.rows[0];  
  });

  afterAll(async function () {
    // Delete the test invoice and company the test
    await db.query(`DELETE FROM companies`);
    await db.query(`DELETE FROM invoices`);
    await db.end();
  });

  describe("GET /invoices", function () {
    test("Gets a list of invoices", async function () {
      const response = await request(app).get("/invoices");
      expect(response.statusCode).toBe(200);
      expect(response.body).toEqual({
        invoices: [{ id: testInvoice.id, comp_code: testInvoice.comp_code }],
      });
    });
  });

  describe("GET /invoices/:id", function () {
    test("Gets a single invoice", async function () {
      const response = await request(app).get(`/invoices/${testInvoice.id}`);
      expect(response.statusCode).toBe(200); 
      expect(response.body).toEqual({
        invoices: [
          {
            id: testInvoice.id,
            comp_code: testInvoice.comp_code
          }
        ]
      });
    }); 
   
    test("Responds with a 404 if invoice not found", async function () {
      const response = await request(app).get(`/invoices/10`);
      expect(response.statusCode).toEqual(404);
      expect(response.body).toEqual({
        error: "Can't find invoice with id of 10, 404",
      });
    });
  });

  describe("POST /invoices", function () {
    test("Create a new invoice", async function () {
      const response = await request(app)
        .post("/invoices")
        .send({
          comp_code: "apple",
          amt: 500,
          paid: false,
          add_date: "2023-04-06",
          paid_date: null,
        });
      expect(response.statusCode).toEqual(201);
      expect(response.body).toEqual({
        invoices: {
          id: expect.any(Number),
          comp_code: "apple",
          amt: 500,
          paid: false,
          add_date: "2023-04-06T05:00:00.000Z",
          paid_date: null,
        },
      });
    });
  });

  describe("PUT /invoices/:id", function () {
    test("Update an existing invoice", async function () {
      const response = await request(app)
        .put(`/invoices/${testInvoice.id}`)
        .send({
          amt: 1800,
          paid: true
        });
      expect(response.statusCode).toEqual(200);
      expect(response.body).toEqual({
        invoice: {
          id: testInvoice.id,
          comp_code: 'apple',
          amt: 1800,
          paid: true,
          add_date: expect.any(String),
          paid_date: expect.any(String),
        },
      });
    });
  
    test("Responds with a 404 if invoice not found", async function () {
      const response = await request(app)
        .put(`/invoices/0`)
        .send({
          amt: 1800,
          paid: true,
        });
      expect(response.statusCode).toEqual(404);
      expect(response.body).toEqual({
        error: "Can't find invoice with id of 0, 404",
      });
    });
  });
  
  describe("DELETE /invoices/:id", function () {
    test("Delete an existing invoice", async function () {
      const response = await request(app).delete(`/invoices/${testInvoice.id}`);
      expect(response.statusCode).toEqual(200);
      expect(response.body).toEqual({ msg: "DELETED!" });
      const checkResponse = await request(app).get(`/invoices/${testInvoice.id}`);
      expect(checkResponse.statusCode).toEqual(404);
    });
  
    test("Responds with a 404 if invoice not found", async function () {
      const response = await request(app).delete(`/invoices/10`);
      expect(response.statusCode).toEqual(404);
      expect(response.body).toEqual({
        error: "Can't find invoice with id of 10, 404",
      });
    });
  });
});  
