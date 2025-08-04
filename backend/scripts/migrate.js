const mysql = require("mysql2/promise")
const fs = require("fs")
const path = require("path")
require("dotenv").config()

async function runMigration() {
  let connection

  try {
    // Connect to MySQL server (without database)
    connection = await mysql.createConnection({
      host: process.env.DB_HOST || "localhost",
      user: process.env.DB_USER || "root",
      password: process.env.DB_PASSWORD || "",
      port: process.env.DB_PORT || 3306,
      multipleStatements: true,
    })

    console.log("📦 Connected to MySQL server")

    // Read and execute schema
    const schemaPath = path.join(__dirname, "database-schema.sql")
    const schema = fs.readFileSync(schemaPath, "utf8")

    await connection.execute(schema)
    console.log("✅ Database schema created successfully")
  } catch (error) {
    console.error("❌ Migration failed:", error.message)
    process.exit(1)
  } finally {
    if (connection) {
      await connection.end()
    }
  }
}

runMigration()
