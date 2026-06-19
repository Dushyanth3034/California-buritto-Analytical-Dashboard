const pool = require('./db');

async function initializeDatabase() {
  const connection = await pool.getConnection();
  try {
    console.log('Initializing database schema...');
    
    // Create sales table and its indexes
    const createTableQuery = `
      CREATE TABLE IF NOT EXISTS sales (
        id INT AUTO_INCREMENT PRIMARY KEY,
        BillNo VARCHAR(50) NOT NULL,
        Outlet_Name VARCHAR(100) NOT NULL,
        Order_Datetime DATETIME NOT NULL,
        Group_Name VARCHAR(100) NOT NULL,
        Order_Type VARCHAR(50) NOT NULL,
        Item VARCHAR(200) NOT NULL,
        Price DECIMAL(10,2) NOT NULL,
        Quantity INT NOT NULL,
        Settlement VARCHAR(50) NOT NULL,
        Brand VARCHAR(100) NOT NULL,
        INDEX idx_brand (Brand),
        INDEX idx_outlet (Outlet_Name),
        INDEX idx_datetime (Order_Datetime),
        INDEX idx_settlement (Settlement),
        INDEX idx_order_type (Order_Type),
        INDEX idx_group (Group_Name)
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
