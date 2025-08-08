import client from 'prom-client';
import { Express, Request, Response } from 'express';

const register = new client.Registry();
client.collectDefaultMetrics({ register });

const httpRequestDuration = new client.Histogram({
  name: 'http_request_duration_ms',
  help: 'Duration of HTTP requests in ms',
  labelNames: ['method', 'route', 'status'],
  buckets: [50, 100, 200, 300, 500, 1000],
});

const dbQueryDuration = new client.Histogram({
  name: 'db_query_duration_ms',
  help: 'Duration of database queries in ms',
  buckets: [10, 50, 100, 200, 500],
});

register.registerMetric(httpRequestDuration);
register.registerMetric(dbQueryDuration);

export const setupMetrics = (app: Express) => {
  app.use((req: Request, res: Response, next) => {
    const end = httpRequestDuration.startTimer();
    res.on('finish', () => {
      end({ method: req.method, route: req.path, status: res.statusCode });
    });
    next();
  });

  app.get('/metrics', async (req, res) => {
    res.set('Content-Type', register.contentType);
    res.end(await register.metrics());
  });
};

export { dbQueryDuration };