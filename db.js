const mongoose = require('mongoose');

// URI de conexión 
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/SysEngLearn';

//conectar db
async function connectDB() {  try {
    await mongoose.connect(MONGO_URI); //conexion a mongoDB
    console.log('MongoDB conectado');
  } catch (error) {
    console.error('Error al conectar MongoDB:', error);
  }
}

module.exports = connectDB;
