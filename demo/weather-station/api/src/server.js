import express from 'express';
import { createHealthRoutes } from './routes/health-routes.js';
import { createWeatherRoutes } from './routes/weather-routes.js';

const port = Number(process.env.PORT ?? 3000);
const app = express();

app.use(createHealthRoutes());
app.use('/api', createWeatherRoutes());

app.listen(port, () => {
  process.stdout.write(`weather-api listening on ${port}\n`);
});
