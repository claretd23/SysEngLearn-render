import mongoose from "mongoose";
import bcrypt from "bcrypt";
import dotenv from "dotenv";
import User from "./models/User.js"; // Asegúrate de que la ruta es correcta

dotenv.config(); // Carga las variables del archivo .env

async function createSuperAdmin() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("✅ Conectado a MongoDB");

    const email = "andrea@doably.com"; 
    const password = "123456"; 
    const hashedPassword = await bcrypt.hash(password, 10);

    // Verificar si ya existe
    const existing = await User.findOne({ email });
    if (existing) {
      console.log("⚠️ El superadmin ya existe.");
      mongoose.disconnect();
      return;
    }

    // Crear el superadmin
    const superadmin = new User({
      name: "Super Admin",
      email,
      password: hashedPassword,
      role: "superadmin",
    });

    await superadmin.save();
    console.log("✅ Superadmin creado con éxito:");
    console.log({
      email,
      password,
    });

    mongoose.disconnect();
  } catch (error) {
    console.error("❌ Error al crear el superadmin:", error);
  }
}

createSuperAdmin();
