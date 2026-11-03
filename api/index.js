// Vercel Node serverless entrypoint for the Smart Factory Monitor API.
//
// The Express app is imported from server/src/app.js (shared with the local /
// Render runtime). bootstrap() connects storage, seeds demo data and starts the
// live simulation once per warm instance. Every /api/* request is rewritten here
// by vercel.json and the original path is preserved, so the app's existing
// /api/... route mounts match unchanged.
//
// NOTE: serverless functions are ephemeral. Use MongoDB Atlas (MONGO_URI) for
// persistence — the in-memory fallback resets on every cold start. The live
// simulation ticks only while an instance is warm.
const app = require('../server/src/app');
const { bootstrap } = require('../server/src/bootstrap');

module.exports = async (req, res) => {
  await bootstrap();
  return app(req, res);
};
