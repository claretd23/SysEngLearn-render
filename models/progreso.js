// models/progreso.js
import mongoose from "mongoose";

const progresoSchema = new mongoose.Schema({
  usuarioId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  nivel: { type: String, required: true },
  semana: { type: Number, required: true },
  tema: { type: Number, required: true },
  ejercicio: { type: Number, required: true },
}, { timestamps: true });

const Progreso = mongoose.model("Progreso", progresoSchema);

export default Progreso;
