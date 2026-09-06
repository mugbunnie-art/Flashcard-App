import express from 'express';

const app = express();

// GET /api/ping is a health check the client (and Playwright) can call
// to confirm the server is reachable through the proxy.
app.get('/api/ping', (req, res) => {
  res.json({ message: 'pong' });
});

export default app;
