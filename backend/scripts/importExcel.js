const fs = require('fs');
const path = require('path');
const XLSX = require('xlsx');
const pool = require('../config/db');
const initializeDatabase = require('../config/initDb');

// Helper to format dates for MySQL DATETIME
function formatSQLDate(date) {
  const pad = (n) => String(n).padStart(2, '0');
  const year = date.getUTCFullYear();
  const month = pad(date.getUTCMonth() + 1);
  const day = pad(date.getUTCDate());
  const hours = pad(date.getUTCHours());
  const minutes = pad(date.getUTCMinutes());
  const seconds = pad(date.getUTCSeconds());
  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
}

function parseExcelDate(serial) {
  if (!serial) return null;
  if (serial instanceof Date) {
    return formatSQLDate(serial);
  }
  if (typeof serial === 'number') {
    // 25569 is the difference in days between Excel epoch (1900) and JS epoch (1970)
    const ms = Math.round((serial - 25569) * 86400 * 1000);
    const date = new Date(ms);
    return formatSQLDate(date);
  }
  if (typeof serial === 'string') {
    const date = new Date(serial);
    if (!isNaN(date.getTime())) {
      return formatSQLDate(date);
    }
  }
  return null;
}

async function runImport() {
  console.time('Import Process');
  try {
    // 1. Initialize schema first
    await initializeDatabase();
    
    // 2. Check if database already has records
    const [countResult] = await pool.query('SELECT COUNT(*) AS count FROM sales');
    const existingCount = countResult[0].count;
    if (existingCount > 0) {
      console.log(`Database already contains ${existingCount} records. Skipping import to avoid duplication.`);
      console.timeEnd('Import Process');
      process.exit(0);
    }
    
    // 3. Find and read sales.xlsx
    const excelPath = path.resolve(__dirname, '../../frontend/public/sales.xlsx');
    console.log('Reading Excel file from:', excelPath);
    if (!fs.existsSync(excelPath)) {
      throw new Error(`Excel file not found at: ${excelPath}`);
    }
    
    console.log('Parsing Excel file... (this may take a few moments for 300k rows)');
    const workbook = XLSX.readFile(excelPath);
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    
    console.log('Converting sheet to JSON...');
    const rawRows = XLSX.utils.sheet_to_json(worksheet);
    const totalRows = rawRows.length;
    console.log(`Successfully parsed ${totalRows} rows from Excel.`);
    
    // 4. Batch insert into database
    const BATCH_SIZE = 10000;
    let batch = [];
    
    const insertQuery = `
      INSERT INTO sales (BillNo, Outlet_Name, Order_Datetime, Group_Name, Order_Type, Item, Price, Quantity, Settlement, Brand)
      VALUES ?
    `;
    
    const connection = await pool.getConnection();
    
    try {
      await connection.beginTransaction();
      console.log('Transaction started.');
      
      for (let i = 0; i < totalRows; i++) {
        const row = rawRows[i];
        
        // Map Excel columns to database fields.
        // Group column maps to Group_Name
        const billNo = String(row.BillNo || '');
        const outletName = String(row.Outlet_Name || '');
        const orderDatetime = parseExcelDate(row.Order_Datetime);
        const groupName = String(row.Group || '');
        const orderType = String(row.Order_Type || '');
        const item = String(row.Item || '');
        const price = parseFloat(row.Price) || 0;
        const quantity = parseInt(row.Quantity, 10) || 0;
        const settlement = String(row.Settlement || '');
        const brand = String(row.Brand || '');
        
        batch.push([
          billNo,
          outletName,
          orderDatetime,
          groupName,
          orderType,
          item,
          price,
          quantity,
          settlement,
          brand
        ]);
        
        if (batch.length === BATCH_SIZE || i === totalRows - 1) {
          console.log(`Inserting rows ${i - batch.length + 2} to ${i + 1}...`);
          await connection.query(insertQuery, [batch]);
          batch = [];
        }
      }
      
      await connection.commit();
      console.log('Transaction committed successfully. Data imported.');
    } catch (err) {
      await connection.rollback();
      console.error('Error during batch insert, transaction rolled back:', err);
      throw err;
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error('Import failed:', error);
    process.exit(1);
  }
  
  console.timeEnd('Import Process');
  process.exit(0);
}

runImport();
