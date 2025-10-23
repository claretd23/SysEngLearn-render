const express = require('express');
const router = express.Router();
const nodemailer = require('nodemailer');
const crypto = require('crypto');
const bcrypt = require('bcrypt');
const User = require('../models/User');
const jwt = require('jsonwebtoken');


// Configura el transporte de correo (gmail que se utilizara para mandar correo de recuperacion de contraseña )
const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 465,           
  secure: true, 
  auth: {
    user: 'mariaclaretdelgadomacias@gmail.com', 
    pass: 'nhoigoqurvayzagz',
  }               
});

transporter.verify((error, success) => {
  if (error) {
    console.error('❌ ERROR SMTP:', error);
  } else {
    console.log('✅ SMTP listo para enviar correos');
  }
});

// Middleware para verificar token y rol superadmin
function verifySuperadmin(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).json({ message: 'No autorizado' });

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (decoded.role !== 'superadmin') {
      return res.status(403).json({ message: 'Acceso denegado' });
    }
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ message: 'Token inválido' });
  }
}

// REGISTRO DE USUARIO
router.post('/register', async (req, res) => {
  const { email, password } = req.body;

  try {
    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(400).json({ message: 'Ya existe un usuario con ese correo' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new User({
      email,
      password: hashedPassword,
      role: 'user',  
    });

    await newUser.save();
    res.status(201).json({ message: 'Usuario registrado exitosamente' });
  } catch (error) {
    console.error('Error al registrar usuario:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
});

//CREAR USUARIO (solo admin) 
router.post('/admin/create', verifySuperadmin, async (req, res) => {
  const { email, password, role = 'user', name, level } = req.body;

  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) return res.status(400).json({ message: 'Usuario ya existe' });

    const hashedPassword = await bcrypt.hash(password, 10);


    if (role !== 'user' && level) {
      return res.status(400).json({ message: 'Solo los usuarios normales deben tener nivel asignado' });
    }

    const newUser = new User({
      email,
      password: hashedPassword,
      role,
      name,
      level: role === 'user' ? level : undefined, // solo guarda nivel si es user
    });

    await newUser.save();

    res.status(201).json({
      message: 'Usuario creado exitosamente',
      user: { name, email, role, level: role === 'user' ? level : null }
    });
  } catch (error) {
    console.error('Error creando usuario:', error);
    res.status(500).json({ message: 'Error del servidor' });
  }
});


// SOLICITAR RECUPERACIÓN DE CONTRASEÑA
router.post('/forgot-password', async (req, res) => {
  const { email } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(200).json({ message: 'Si el correo está registrado, recibirás un enlace.' });
    }

    const token = crypto.randomBytes(20).toString('hex');
    user.resetPasswordToken = token;
    user.resetPasswordExpires = Date.now() + 3600000; // aspira en 1 hora
    await user.save();

    const resetLink = `http://localhost:5173/reset-password?token=${token}`;

    await transporter.sendMail({
      from: '"DOABLY ACADEMY" <sysenglearn@gmail.com>', 
      to: email,
      subject: 'Recuperación de contraseña - DOABLY ACADEMY',
      html: `
        <div style="font-family: Arial, sans-serif; color: #222a5c;">
          <img src="https://www.doablyacademy.com/wp-content/uploads/2022/04/LOGO-DOABLY-768x168.png" alt="SysEng Learn" style="width: 150px; margin-bottom: 20px;" />
          <p>Hola,</p>
          <p>Recibimos una solicitud para restablecer la contraseña de tu cuenta en <strong>Doably Academy</strong>.</p>
          <p>Haz clic en el siguiente enlace para restablecer tu contraseña:</p>
          <p><a href="${resetLink}" style="color: #1a73e8;">${resetLink}</a></p>
          <p>Este enlace expirará en 1 hora.</p>
          <hr />
          <p style="font-size: 12px; color: gray;">© 2025 Doably academy. Todos los derechos reservados.</p>
        </div>
      `
    });

    res.status(200).json({ message: 'Correo enviado correctamente' });
  } catch (error) {
    console.error('Error al enviar correo:', error);
    res.status(500).json({ error: 'Error al enviar el correo' });
  }
});

//RESTABLECER CONTRASEÑA DE USUARIO
router.post('/reset-password', async (req, res) => {
  const { token, newPassword } = req.body;

  try {
    const user = await User.findOne({
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({ message: 'Token inválido o expirado' });
    }

    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(newPassword, salt);

    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;

    await user.save();

    res.json({ message: 'Contraseña actualizada correctamente' });
  } catch (error) {
    console.error('Error al actualizar contraseña:', error);
    res.status(500).json({ message: 'Error en el servidor' });
  }
});

// LOGIN 
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(401).json({ message: 'Login failed. Usuario no encontrado.' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(401).json({ message: 'Login failed. Contraseña incorrecta.' });

    // 🔐 Generar token
    const token = jwt.sign(
      { id: user._id, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );

    // Aquí se incluye level para que llegue al frontend
    res.json({
      message: 'Login exitoso',
      user: {
        email: user.email,
        role: user.role,
        level: user.level || null
      },
      token 
    });
  } catch (error) {
    console.error('Error en login:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
});


// Eliminar usuario (solo puede el admin)
router.delete('/:id', verifySuperadmin, async (req, res) => {
  try {
    const { id } = req.params;

    // Buscar usuario por id
    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }

    // No permitir eliminar admin
    if (user.role === 'superadmin') {
      return res.status(403).json({ message: 'No puedes eliminar al administrador' });
    }

    // Eliminar usuario
    await User.findByIdAndDelete(id);

    res.json({ message: 'Usuario eliminado correctamente' });
  } catch (err) {
    console.error('Error al eliminar usuario:', err);
    res.status(500).json({ message: 'Error al eliminar usuario' });
  }
});


// Ruta para obtener todos los usuarios
router.get('/', verifySuperadmin, async (req, res) => {

  try {
    const users = await User.find();
    res.json(users);
  } catch (error) {
    console.error('Error al obtener usuarios:', error);
    res.status(500).json({ message: 'Error del servidor al obtener usuarios' });
  }
});


module.exports = router;

