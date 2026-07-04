import { Router } from 'express';

const cities = [
  { city: 'Moscow', tempC: 18, condition: 'Cloudy' },
  { city: 'Berlin', tempC: 21, condition: 'Sunny' },
  { city: 'Tokyo', tempC: 24, condition: 'Rain' },
];

export function createWeatherRoutes() {
  const router = Router();

  router.get('/weather', (_request, response) => {
    response.json({ items: cities });
  });

  router.get('/weather/:city', (request, response) => {
    const cityName = request.params.city.toLowerCase();
    const item = cities.find((entry) => entry.city.toLowerCase() === cityName);

    if (!item) {
      response.status(404).json({ message: 'City not found' });
      return;
    }

    response.json(item);
  });

  return router;
}
