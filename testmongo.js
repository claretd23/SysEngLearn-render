// testMongo.js
import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('Conexión a MongoDB exitosa ✅'))
  .catch(err => console.error('Error de conexión:', err));
