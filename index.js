import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import connectDB from './db.js';             // ahora ESM
import userRoutes from './routes/users.js';
import progresoRoutes from './routes/progreso.js';
import dotenv from 'dotenv';

dotenv.config();

const app = express();

app.use(cors({
  origin: [
    "http://localhost:5173",
    "https://sys-eng-learn1-wg8e.vercel.app"
  ],
  methods: ['GET','POST','PUT','DELETE'],
  credentials: true
}));

app.use(bodyParser.json());
connectDB();

app.use('/api/users', userRoutes);
app.use('/api/progreso', progresoRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Servidor corriendo en puerto ${PORT}`));
