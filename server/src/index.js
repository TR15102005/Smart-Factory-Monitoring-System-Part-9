require('dotenv').config();
const app = require('./app');
const { bootstrap, getMode } = require('./bootstrap');

const PORT = process.env.PORT || 5001;

(async () => {
  await bootstrap();
  app.listen(PORT, () => {
    console.log(`[api] Smart Factory Monitor API listening on http://localhost:${PORT} (storage: ${getMode()})`);
  });
})();
