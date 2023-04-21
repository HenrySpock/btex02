const express = require("express"); 
const router = express.Router();
const db = require("../db");
 
const slugify = require("slugify"); 

// Route for adding an industry
router.post("/industries", async (req, res, next) => {
  try {
    const { industry } = req.body;
    const code = slugify(industry, { lower: true });

    const result = await db.query(
      "INSERT INTO industries (code, industry) VALUES ($1, $2) RETURNING code, industry",
      [code, industry]
    );

    return res.status(201).json({ industry: result.rows[0] });
  } catch (err) {
    return next(err);
  }
});

// Route for listing all industries and their associated companies
router.get("/industries", async (req, res, next) => {
  try {
    const result = await db.query(
      "SELECT industries.code AS industry_code, industries.industry, inducom.comp_code FROM industries LEFT JOIN inducom ON industries.code = inducom.ind_code ORDER BY industries.code"
    );

    const industries = {};

    for (let row of result.rows) {
      if (!industries[row.industry_code]) {
        industries[row.industry_code] = {
          code: row.industry_code,
          industry: row.industry,
          companies: [],
        };
      }

      if (row.comp_code) {
        industries[row.industry_code].companies.push(row.comp_code);
      }
    }

    return res.json({ industries: Object.values(industries) });
  } catch (err) {
    return next(err);
  }
});

// Route for associating an industry and a company
router.post("/industries/:code", async (req, res, next) => {
  try {
    const { code: ind_code } = req.params;
    const { comp_code } = req.body;

    const result = await db.query(
      "INSERT INTO inducom (ind_code, comp_code) VALUES ($1, $2) RETURNING ind_code, comp_code",
      [ind_code, comp_code]
    );

    return res.status(201).json({ inducom: result.rows[0] });
  } catch (err) {
    return next(err);
  }
});

module.exports = router;

// Curl requests:
// curl -X POST -H "Content-Type: application/json" -d '{"industry":"<industry>"}' http://localhost:3000/industries

// curl http://localhost:3000/industries

// curl -X POST -H "Content-Type: application/json" -d '{"comp_code": "<comp_code>", "ind_code": "<ind_code>"}' http://localhost:3000/industries/<ind_code>