// index.js
import express from "express";
import cors from "cors";
import bodyParser from "body-parser";
import dotenv from "dotenv";
import connectDB from "./db.js"; // conexión a la DB
import userRoutes from "./routes/users.js"; // rutas de usuarios
import progresoRoutes from "./routes/progreso.js"; // rutas de progreso

dotenv.config();

const app = express();

// Middlewares
app.use(cors({
  origin: [
    "http://localhost:5173",                   // frontend local
    "https://sys-eng-learn1-wg8e.vercel.app"  // frontend producción
  ],
  methods: ['GET','POST','PUT','DELETE'],
  credentials: true
}));

app.use(bodyParser.json());

// Conectar a la DB
connectDB();

// Rutas principales
app.use("/api/users", userRoutes);
app.use("/api/progreso", progresoRoutes);

// Iniciar servidor
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Servidor corriendo en el puerto ${PORT}`));
