const pool = require('./db');

async function initializeDatabase() {
  const connection = await pool.getConnection();
  try {
    console.log('Initializing database schema...');
    
    // Create sales table and its indexes
    const createTableQuery = `
      CREATE TABLE IF NOT EXISTS sales (
        id INT AUTO_INCREMENT PRIMARY KEY,
        billno VARCHAR(50) NOT NULL,
        outlet_name VARCHAR(100) NOT NULL,
        order_datetime DATETIME NOT NULL,
        \`group\` VARCHAR(100) NOT NULL,
        order_type VARCHAR(50) NOT NULL,
        item VARCHAR(200) NOT NULL,
        price DECIMAL(10,2) NOT NULL,
        quantity INT NOT NULL,
        settlement VARCHAR(50) NOT NULL,
        brand VARCHAR(100) NOT NULL,
        INDEX idx_brand (brand),
        INDEX idx_outlet (outlet_name),
        INDEX idx_datetime (order_datetime),
        INDEX idx_settlement (settlement),
        INDEX idx_order_type (order_type),
        INDEX idx_group (\`group\`)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `;
    
    await connection.query(createTableQuery);
    
    // Create users table
    const createUsersTableQuery = `
      CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        full_name VARCHAR(255) NOT NULL,
        email VARCHAR(255) NOT NULL UNIQUE,
        password VARCHAR(255) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        INDEX idx_email (email)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `;
    await connection.query(createUsersTableQuery);
    
    console.log('Database schema checked/initialized successfully.');
  } catch (error) {
    console.error('Failed to initialize database schema:', error);
    throw error;
  } finally {
    connection.release();
  }
}

module.exports = initializeDatabase;
