const mongoose = require('mongoose');
const User = require('../src/models/User');
require('dotenv').config();

mongoose.connect(
  process.env.MONGODB_URI || 'mongodb://localhost:27017/fleetdb',
  {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  }
);

async function checkUsers() {
  try {
    const users = await User.find({}).select('email role name');
    
    console.log('\n📊 Users in database:');
    console.log(`Total: ${users.length} users\n`);
    
    if (users.length === 0) {
      console.log('❌ No users found! Run: node scripts/populateDummyData.js\n');
    } else {
      users.forEach(user => {
        console.log(`- ${user.email.padEnd(25)} | ${user.role.padEnd(10)} | ${user.name}`);
      });
    }
    
    mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    mongoose.connection.close();
    process.exit(1);
  }
}

checkUsers();
