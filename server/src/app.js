require('dotenv').config();
const path = require('path');
const fs = require('fs');
const express = require('express');
const cors = require('cors');
const { getMode } = require('./config/db');
const authRoutes = require('./routes/auth');
const zoneRoutes = require('./routes/zones');
const workerRoutes = require('./routes/workers');
const robotRoutes = require('./routes/robots');
const safetyRoutes = require('./routes/safety');
const maintenanceRoutes = require('./routes/maintenance');
const analyticsRoutes = require('./routes/analytics');
const complianceRoutes = require('./routes/compliance');
const reportRoutes = require('./routes/reports');
const userRoutes = require('./routes/users');
const settingsRoutes = require('./routes/settings');

const app = express();
app.use(cors());
app.use(express.json());

app.get('/api/health', (req, res) => {
  res.json({ ok: true, storage: getMode(), uptime: process.uptime() });
});
app.use('/api/auth', authRoutes);
app.use('/api/zones', zoneRoutes);
app.use('/api/workers', workerRoutes);
app.use('/api/robots', robotRoutes);
app.use('/api', safetyRoutes);
app.use('/api/maintenance', maintenanceRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/compliance', complianceRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/users', userRoutes);
app.use('/api/settings', settingsRoutes);

// Serve the built React client when it exists (Render single-service / local production
// preview). On Vercel the CDN serves client/dist directly and this folder is absent at
// runtime, so the block is skipped and only /api/* reaches the function.
const clientDist = path.join(__dirname, '../../client/dist');
if (fs.existsSync(clientDist)) {
  app.use(express.static(clientDist));
  // SPA fallback for client-side routes (React Router). /api/* is matched above first.
  app.get('*', (req, res) => res.sendFile(path.join(clientDist, 'index.html')));
}

module.exports = app;
