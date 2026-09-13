import 'dotenv/config';
import cors from 'cors';
import express, { type ErrorRequestHandler } from 'express';
import { ZodError } from 'zod';

export const app = express();
app.use(cors());
app.use(express.json());

app.get('/api', (_request, response) => {
  response.json({ status: 'ok' });
});

const errorHandler: ErrorRequestHandler = (error, _request, response, _next) => {
  if (error instanceof ZodError) {
    response.status(400).json({ message: 'Validation failed', errors: error.flatten() });
    return;
  }

  console.error(error);
  response.status(500).json({ message: 'Internal server error' });
};

app.use(errorHandler);
