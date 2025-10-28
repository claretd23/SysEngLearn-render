// routes/progreso.js
import express from "express";
import Progreso from "../models/progreso.js";
import { authMiddleware } from "../auth.js";

const router = express.Router();

// Guardar ejercicio completado
router.post("/", authMiddleware, async (req, res) => {
  try {
    const { nivel, semana, tema, ejercicio } = req.body;
    const usuarioId = req.user.id;

    const existente = await Progreso.findOne({ usuarioId, nivel, semana, tema, ejercicio });
    if (existente) {
      return res.status(200).json({ message: "Ya guardado" });
    }

    await Progreso.create({ usuarioId, nivel, semana, tema, ejercicio });
    res.status(201).json({ message: "Progreso guardado" });
  } catch (error) {
    console.error("Error guardando progreso:", error);
    res.status(500).json({ message: "Error en el servidor" });
  }
});

// Obtener progreso del usuario por nivel
router.get("/:nivel", authMiddleware, async (req, res) => {
  try {
    const usuarioId = req.user.id;
    const { nivel } = req.params;

    const progreso = await Progreso.find({ usuarioId, nivel });
    res.status(200).json(progreso);
  } catch (error) {
    console.error("Error obteniendo progreso:", error);
    res.status(500).json({ message: "Error en el servidor" });
  }
});

// ✅ Exportar router como ESM
export default router;
