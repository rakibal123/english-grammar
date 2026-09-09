require('dotenv').config({ path: 'frontend/.env.local' });
const mongoose = require('mongoose');

async function run() {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log('Connected');
  await mongoose.connection.db.dropDatabase();
  console.log('Database dropped');
  process.exit(0);
}
run();
