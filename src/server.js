const app = require('./app');
const connectDB = require('./config/db');

const PORT = process.env.PORT || 5000;
const HOST = '0.0.0.0';

connectDB().then(() => {
  app.listen(PORT, HOST, () => {
    console.log(`Server running on ${HOST}:${PORT}`);
  });
}).catch(err => {
  console.error('Failed to connect to database. Server not started.', err);
  process.exit(1);
});
