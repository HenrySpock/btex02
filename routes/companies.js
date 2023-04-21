/** Routes for companies of biztime. */

const express = require("express"); 
const router = express.Router();
const db = require("../db");

//npm install slugify
const slugify = require('slugify');

router.get('/companies', async (req, res, next) => {
  try { 
    const result = await db.query('SELECT code, name FROM companies') 
    return res.send({ companies: result.rows })
  } catch (e) {
    return next(e)
  }
}) 

router.get('/companies/:code', async (req, res, next) => {
  try { 
    const code = req.params.code;
    const result = await db.query(`
      SELECT c.code, c.name, c.description, i.industry
      FROM companies AS c
      JOIN inducom AS ic ON c.code = ic.comp_code
      JOIN industries AS i ON ic.ind_code = i.code
      WHERE c.code=$1
    `, [code]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: `Can't find company with code of ${code}, 404` });
    }
    const industries = result.rows.map(row => row.industry);
    const company = {
      code: result.rows[0].code,
      name: result.rows[0].name,
      description: result.rows[0].description,
      industries
    };
    return res.send({ company });
  } catch (e) {
    return next(e);
  }
});

router.post('/companies', async (req, res, next) => {
  try {
    const { name, description } = req.body;
    // incorporating slugify
    const code = slugify(name, { lower: true });  
    const results = await db.query('INSERT INTO companies (code, name, description) VALUES ($1, $2, $3) RETURNING code, name, description', [code, name, description]);
    return res.status(201).json({ companies: results.rows[0] })
  } catch (e) {
    return next(e)
  }
}) 

router.put('/companies/:code', async (req, res, next) => {
  try {
    const { code } = req.params;
    const { name, description } = req.body; 

    const result = await db.query(
      'UPDATE companies SET name=$1, description=$2 WHERE code=$3 RETURNING code, name, description',
      [name, description, code]
    ); 

    if (result.rows.length === 0) {
      return res.status(404).json({ error: `Can't find company with code of ${code}, 404` });
    }
    return res.json({ company: result.rows[0] });
  } catch (e) { 
    return next(e);
  }
});

router.delete('/companies/:code', async (req, res, next) => {
  const { code } = req.params;
  try {
    const result = await db.query('DELETE FROM companies WHERE code = $1', [code])
    if (result.rowCount === 0) {
      return res.status(404).json({ error: `Can't find company with code of ${code}, 404` });
    }
    return res.send({ msg: "DELETED!" })
  } catch (e) {
    return next(e)
  }
})

module.exports = router;

// GET /companies
// curl --location --request GET 'http://localhost:3000/companies'

// GET /companies/id
// curl --location --request GET 'http://localhost:3000/companies/<id>'

// POST /companies
// curl -X POST -H "Content-Type: application/json" -d \
// '{"name":"<name>", "description":"<description>"}' \
// http://localhost:3000/companies

// PUT
// curl --location --request PUT 'http://localhost:3000/companies/<code>' \
// --header 'Content-Type: application/json' \
// --data-raw '{
//     "name": "<name>",
//     "description": "<description>" 
// }'

// DELETE
// curl --location --request DELETE 'http://localhost:3000/companies/<code>'




 