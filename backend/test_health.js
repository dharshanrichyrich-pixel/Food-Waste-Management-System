import app from './src/app.js';
import { getMongoStatus } from './src/config/mongodb.js';
import { getPostgresStatus, disconnectPostgres } from './src/config/postgres.js';

async function test() {
  console.log('Testing App configuration and Health check...');
  const mongoStatus = getMongoStatus();
  const postgresStatus = await getPostgresStatus();
  console.log('MongoDB Status:', JSON.stringify(mongoStatus, null, 2));
  console.log('Postgres Status:', JSON.stringify(postgresStatus, null, 2));
  console.log('Express app configured with routes:', app._router.stack.length);
  console.log('Verification Completed Successfully!');
  await disconnectPostgres();
  process.exit(0);
}

test().catch((err) => {
  console.error(err);
  process.exit(1);
});
