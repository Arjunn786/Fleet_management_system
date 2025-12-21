const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../src/models/User');
require('dotenv').config();

mongoose.connect(
  process.env.MONGODB_URI || 'mongodb://localhost:27017/fleetdb',
  {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  }
);

async function testLogin(email, password) {
  try {
    console.log(`\n🔐 Testing login for: ${email}`);
    
    const user = await User.findOne({ email }).select('+password');
    
    if (!user) {
      console.log('❌ User not found!');
      return false;
    }
    
    console.log(`✅ User found: ${user.name} (${user.role})`);
    console.log(`Password hash exists: ${user.password ? 'Yes' : 'No'}`);
    console.log(`Hash starts with: ${user.password ? user.password.substring(0, 10) : 'N/A'}`);
    
    const isMatch = await bcrypt.compare(password, user.password);
    
    if (isMatch) {
      console.log('✅ Password matches!');
    } else {
      console.log('❌ Password does NOT match!');
      console.log('Expected password: password123');
      console.log(`Testing: ${password}`);
    }
    
    return isMatch;
  } catch (error) {
    console.error('Error:', error.message);
    return false;
  }
}

async function runTests() {
  await testLogin('customer1@fleet.com', 'password123');
  await testLogin('driver1@fleet.com', 'password123');
  await testLogin('admin@fleet.com', 'password123');
  
  mongoose.connection.close();
  process.exit(0);
}

runTests();
