// index.js
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const connectDB = require('./db'); // Conexión a la base de datos
const userRoutes = require('./routes/users'); // Rutas de usuarios
const progresoRoutes = require("./routes/progreso"); // Rutas de progreso
require('dotenv').config(); // Cargar variables de entorno

const app = express();

// Middlewares
app.use(cors({
  origin: [
    "http://localhost:5173",                   // Frontend local (Vite)
    "https://sys-eng-learn1-wg8e.vercel.app"  // Frontend en producción (Vercel)
  ],
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  credentials: true
}));

app.use(bodyParser.json()); // Parsear JSON en las solicitudes

// Conectar a la base de datos
connectDB();

// Rutas principales
app.use('/api/users', userRoutes);
app.use("/api/progreso", progresoRoutes);

// Iniciar servidor
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Servidor corriendo en el puerto ${PORT}`);
});
