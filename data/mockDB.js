const bcrypt = require('bcryptjs');

// Pre-seeded users (passwords will be hashed on startup)
const seedUsers = [
  {
    id: '1',
    email: 'admin@aigenius.com',
    password: 'Admin@1234',
    role: 'Admin',
  },
  {
    id: '2',
    email: 'premium@aigenius.com',
    password: 'Premium@1234',
    role: 'Premium_User',
  },
  {
    id: '3',
    email: 'free@aigenius.com',
    password: 'Free@1234',
    role: 'Free_User',
  },
];

// In-memory store
const db = {
  users: [],
  refreshTokens: [], // whitelist of active refresh tokens
};

// Hash passwords and populate db on startup
async function initDB() {
  for (const user of seedUsers) {
    const hashedPassword = await bcrypt.hash(user.password, 12);
    db.users.push({ ...user, password: hashedPassword });
  }
  console.log('✅ Mock DB initialized with 3 users (Admin, Premium_User, Free_User)');
}

module.exports = { db, initDB };
