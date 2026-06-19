const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });
const app = require('./app');
const initializeDatabase = require('./config/initDb');

const PORT = process.env.PORT || 5000;

async function startServer() {
  try {
    // Verify database connection and run schema initialization
    await initializeDatabase();
    
    app.listen(PORT, () => {
      console.log(`Server successfully started and listening on port ${PORT}`);
    });
  } catch (error) {
    console.error('Server failed to start:', error);
    process.exit(1);
  }
}

startServer();
