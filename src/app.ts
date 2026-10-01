import 'dotenv/config';
import cors from 'cors';
import express from 'express';
import { APP_PORT } from './config/env.config';
import authRouter from './routes/auth.routes';
import appErrorHandler from './errors/app-error.handler';

export const app = express();
app.use(cors());
app.use(express.json());

app.get('/api', (_request, response) => {
  response.json({ status: 'ok' });
});

app.use('/api/auth', authRouter);
app.use(appErrorHandler);

// Start the server
app.listen(APP_PORT, () => {
  console.log(`Server is running on http://localhost:${APP_PORT}`);
});