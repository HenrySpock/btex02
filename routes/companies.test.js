const request = require("supertest");
const app = require("../app");
const db = require("../db");

// Run tests with:
// jest routes/companies.test.js

beforeAll(async () => {
  await db.query("DELETE FROM companies");
  await db.query(
    `INSERT INTO companies (code, name, description) VALUES ('apple', 'Apple Computer', 'Maker of OSX.')`
  );
  await db.query(
  `INSERT INTO inducom (comp_code, ind_code)
  VALUES
  ('apple', 'infosys'), 
  ('apple', 'cloud'),
  ('apple', 'rob');`
  );
});

afterAll(async () => {
  await db.query("DELETE FROM companies");
  await db.query("DELETE FROM inducom");
  await db.end();
});

describe("GET /companies", () => {
  test("Gets a list of 1 company", async () => {
    const response = await request(app).get("/companies");
    expect(response.statusCode).toBe(200);
    expect(response.body).toEqual({
      companies: [{ code: "apple", name: "Apple Computer" }],
    });
  });
});

describe("GET /companies/:code", () => {
  test("Gets a single company", async () => {
    const response = await request(app).get("/companies/apple");
    expect(response.statusCode).toBe(200);
    expect(response.body).toEqual({
      company: { code: "apple", name: "Apple Computer", description: "Maker of OSX.", industries: ["Information Systems", "Cloud Architecture", "Robotics"] },
    });
  });

  test("Responds with a 404 if it cannot find the company", async () => {
    const response = await request(app).get("/companies/doesnotexist");
    expect(response.statusCode).toBe(404);
    expect(response.body).toEqual({
      error: "Can't find company with code of doesnotexist, 404",
    });
  });
});

describe("POST /companies", () => {
  test("Creates a new company", async () => {
    const response = await request(app)
      .post("/companies")
      .send({
        code: "google",
        name: "Google",
        description: "One search to rule them all",
      });
    expect(response.statusCode).toBe(201);
    expect(response.body).toEqual({
      companies: { code: "google", name: "Google", description: "One search to rule them all" },
    });
  });
});

describe("PUT /companies/:code", () => {
  test("Updates a single company", async () => {
    const response = await request(app)
      .put("/companies/apple")
      .send({ name: "Green Apple", description: "Maker of Happy Caterpillars" });
    expect(response.statusCode).toBe(200);
    expect(response.body).toEqual({
      company: {
        code: "apple",
        name: "Green Apple",
        description: "Maker of Happy Caterpillars",
      },
    });
  });

  test("Responds with a 404 if it cannot find the company", async () => {
    const response = await request(app)
      .put("/companies/doesnotexist")
      .send({ name: "New Apple Name", description: "Maker of Macs", newCode: "newapple" });
    expect(response.statusCode).toBe(404);
    expect(response.body).toEqual({
      error: "Can't find company with code of doesnotexist, 404",
    });
  });
});


describe("DELETE /companies/:code", () => {
  test("Deletes a single a company", async () => {
    const response = await request(app).delete("/companies/apple");
    expect(response.statusCode).toBe(200);
    expect(response.body).toEqual({ msg: "DELETED!" });
  });

  test("Responds with a 404 if it cannot find the company", async () => {
    const response = await request(app).delete("/companies/doesnotexist");
    expect(response.statusCode).toBe(404);
    expect(response.body).toEqual({
      error: "Can't find company with code of doesnotexist, 404",
    });
  });
});

