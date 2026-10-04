import 'dotenv/config';
import cors from 'cors';
import express from 'express';
import { APP_PORT, CLIENT_URL } from './config/env.config';
import authRouter from './routers/auth.router';
import appErrorHandler, { errorNormalizer } from './errors/app-error.handler';
import cookieParser from 'cookie-parser';

export const app = express();
app.use(cors());
app.use(express.json());
app.use(cookieParser()); 
app.use(
  cors({
    origin: [CLIENT_URL],
    credentials: true,
  })
)

app.get('/api', (_request, response) => {
  response.json({ status: 'ok' });
});

app.use('/api/auth', authRouter);
app.use(errorNormalizer);
app.use(appErrorHandler);

// Start the server
app.listen(APP_PORT, () => {
  console.log(`Server is running on http://localhost:${APP_PORT}`);
});