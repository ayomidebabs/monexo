import dotenv from 'dotenv';
dotenv.config();
import app from './app.js';
import connectDB from './config/db.js';

const PORT = process.env.PORT;
connectDB().then(() => {
  app.listen(Number(PORT), 'localhost', () =>
    console.log(`Listening on port ${PORT}`)
  );
});
