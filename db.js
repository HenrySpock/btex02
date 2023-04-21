/** Database setup for BizTime. */
const { Client } = require("pg");

let DB_URI;

process.env.NODE_ENV = "test";

if (process.env.NODE_ENV === "test") {
  DB_URI = "postgresql:///biztime_test";
} else {
  DB_URI = "postgresql:///biztime";
} 

let db = new Client({ 
  connectionString: DB_URI
});

db.connect((err) => {
  if (err) {
    console.error('Error connecting to database:', err);
  } else {
    console.log('Connected to database successfully!');
  }
});

module.exports = db;

// The method we will be most interested in is .query(), called by:
// db.query()
