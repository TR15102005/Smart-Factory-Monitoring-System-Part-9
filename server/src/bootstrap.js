const { connectDB, getMode } = require('./config/db');
const store = require('./services/store');
const simulation = require('./services/simulation');

// Idempotent startup: connect to storage, seed demo data, launch the live simulation.
// Safe to call on every serverless invocation — the work happens once per warm instance.
let ready;

async function bootstrap() {
  if (!ready) {
    ready = (async () => {
      const mode = await connectDB();
      await store.seedIfEmpty();
      const [workerDocs, robotDocs] = await Promise.all([
        store.list('workers'),
        store.list('robots')
      ]);
      simulation.start(workerDocs, robotDocs);
      return mode;
    })();
  }
  return ready;
}

module.exports = { bootstrap, getMode };
