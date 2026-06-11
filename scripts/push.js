require('dotenv').config({ path: '.env.local' });
require('child_process').execSync('npx drizzle-kit push', { stdio: 'inherit' });
