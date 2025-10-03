import cors, { CorsOptions } from 'cors';

const allowedOrigins = ['http://localhost:5173'];

const corsOptions: CorsOptions = {
  origin: (origin, cb) => {
    !origin || allowedOrigins.includes(origin)
      ? cb(null, true)
      : cb(new Error('Not allowed by cors'));
  },
  credentials: true,
};

export default cors(corsOptions);
