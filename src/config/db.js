
import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();


const pool = mysql.createPool({

  // host: '127.0.0.1',   // CLI me -h
  // user: 'root',                      // CLI me -u
  // // password: 'mlAqDUZWKukaeykmDgHxHiQXlrSYHEWL',  // CLI me -p ke baad
  // database: 'okr_db',               // CLI ke end me diya hua DB name
  // port: 3306,                       // CLI me --port
  // // waitForConnections: true,
  // connectionLimit: 10,
  // queueLimit: 0
  host: 'yamanote.proxy.rlwy.net',   // CLI me -h
  user: 'root',                      // CLI me -u
  password: 'mlAqDUZWKukaeykmDgHxHiQXlrSYHEWL',  // CLI me -p ke baad
  database: 'railway',               // CLI ke end me diya hua DB name
  port: 12583,                       // CLI me --port
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

(async () => {
  try {
    const connection = await pool.getConnection();
    console.log("✅ MySQL Database Connected!");
    connection.release();
  } catch (err) {
    console.error("❌ Error connecting to the database:", err.message);
  }
})();


export default pool;
