import cors, { CorsOptions } from 'cors';

const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:4173',
  'http://localhost:5000',
  'http://192.168.43.179:5000',
];

const corsOptions: CorsOptions = {
  origin: (origin, cb) => {
    !origin || allowedOrigins.includes(origin)
      ? cb(null, true)
      : cb(new Error('Not allowed by cors'));
  },
  credentials: true,
};

export default cors(corsOptions);
