const mongoose = require("mongoose");

const progresoSchema = new mongoose.Schema({
  usuarioId: { type: mongoose.Schema.Types.ObjectId, ref: "Usuario", required: true },
  nivel: { type: String, required: true },
  semana: { type: Number, required: true },
  tema: { type: Number, required: true },
  ejercicio: { type: Number, required: true },
}, { timestamps: true });

module.exports = mongoose.model("Progreso", progresoSchema);
