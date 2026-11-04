// ============================================================
// Junetts - Servidor (Node.js + Express + MySQL con mysql2)
// ============================================================
const express = require('express');
const mysql   = require('mysql2');
const cors    = require('cors');
const path    = require('path');
const crypto  = require('crypto'); // viene incluido en Node, no hay que instalarlo

const app    = express();
const PUERTO = 3000;

// ---------- Middlewares ----------
app.use(cors());                 // permite que el navegador llame a la API
app.use(express.json());         // permite leer el cuerpo de las peticiones en JSON
app.use(express.static(path.join(__dirname, 'public'))); // sirve el frontend
app.get('/admin', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'admin', 'login.html'));
});

app.get('/admin/panel', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'admin', 'panel.html'));
});

const configBD = {
  host: 'localhost',
  user: 'root',       
  password: '',        
  database: 'junetts'
};

let db;
function conectar() {
  db = mysql.createConnection(configBD);
  db.connect((err) => {
    if (err) {
      console.error('No se pudo conectar a MySQL:', err.message);
      console.error('¿Está iniciado MySQL en XAMPP y creaste la base con database.sql?');
      return;
    }
    console.log('Conectado a MySQL (base: junetts)');
  });

  db.on('error', (err) => {
    console.error('Error de MySQL:', err.code);
    if (err.code === 'PROTOCOL_CONNECTION_LOST' || err.fatal) conectar();
  });
}
conectar();
const sesiones = new Map(); 
const DURACION = 1000 * 60 * 60 * 2; 

function hashear(texto) {
  return crypto.createHash('sha256').update(texto).digest('hex');
}
function requiereLogin(req, res, next) {
  const cabecera = req.headers.authorization || '';
  const token = cabecera.replace('Bearer ', '');
  const vence = sesiones.get(token);
  if (!token || !vence || vence < Date.now()) {
    sesiones.delete(token);
    return res.status(401).json({ error: 'No autorizado. Iniciá sesión.' });
  }
  next();
}
app.get('/api/servicios', (req, res) => {
  db.query('SELECT * FROM servicios ORDER BY id', (err, filas) => {
    if (err) return res.status(500).json({ error: 'Error al leer los servicios.' });
    res.json(filas);
  });
});

app.post('/api/consultas', (req, res) => {
  const { nombre, email, telefono, asunto, mensaje } = req.body;
  if (!nombre || !email || !asunto || !mensaje) {
    return res.status(400).json({ error: 'Faltan campos obligatorios.' });
  }
  if (!/^\S+@\S+\.\S+$/.test(email)) {
    return res.status(400).json({ error: 'El email no es válido.' });
  }
  if (mensaje.trim().length < 10) {
    return res.status(400).json({ error: 'El mensaje es muy corto.' });
  }

  const sql = 'INSERT INTO consultas (nombre, email, telefono, asunto, mensaje) VALUES (?, ?, ?, ?, ?)';
  db.query(sql, [nombre.trim(), email.trim(), telefono || null, asunto.trim(), mensaje.trim()], (err, resultado) => {
    if (err) return res.status(500).json({ error: 'No se pudo guardar la consulta.' });
    res.status(201).json({ mensaje: 'Consulta recibida. ¡Gracias!', id: resultado.insertId });
  });
});
app.post('/api/login', (req, res) => {
  const { usuario, password } = req.body;
  if (!usuario || !password) {
    return res.status(400).json({ error: 'Completá usuario y contraseña.' });
  }
  const sql = 'SELECT id FROM administradores WHERE usuario = ? AND password_hash = ?';
  db.query(sql, [usuario, hashear(password)], (err, filas) => {
    if (err) return res.status(500).json({ error: 'Error del servidor.' });
    if (filas.length === 0) return res.status(401).json({ error: 'Usuario o contraseña incorrectos.' });
    const token = crypto.randomBytes(24).toString('hex');
    sesiones.set(token, Date.now() + DURACION);
    res.json({ token });
  });
});

app.post('/api/logout', requiereLogin, (req, res) => {
  sesiones.delete((req.headers.authorization || '').replace('Bearer ', ''));
  res.json({ mensaje: 'Sesión cerrada.' });
});
app.get('/api/consultas', requiereLogin, (req, res) => {
  const { estado, fecha, q } = req.query;
  let sql = 'SELECT id, nombre, email, asunto, fecha, leida FROM consultas WHERE 1=1';
  const valores = [];

  if (estado === 'leida')   { sql += ' AND leida = 1'; }
  if (estado === 'noleida') { sql += ' AND leida = 0'; }
  if (fecha)                { sql += ' AND DATE(fecha) = ?'; valores.push(fecha); }
  if (q)                    { sql += ' AND (nombre LIKE ? OR email LIKE ?)'; valores.push(`%${q}%`, `%${q}%`); }

  sql += ' ORDER BY fecha DESC';
  db.query(sql, valores, (err, filas) => {
    if (err) return res.status(500).json({ error: 'Error al leer las consultas.' });
    res.json(filas);
  });
});
app.get('/api/consultas/:id', requiereLogin, (req, res) => {
  db.query('SELECT * FROM consultas WHERE id = ?', [req.params.id], (err, filas) => {
    if (err) return res.status(500).json({ error: 'Error al leer la consulta.' });
    if (filas.length === 0) return res.status(404).json({ error: 'Consulta no encontrada.' });
    res.json(filas[0]);
  });
});
app.put('/api/consultas/:id/leida', requiereLogin, (req, res) => {
  const valor = req.body.leida ? 1 : 0;
  db.query('UPDATE consultas SET leida = ? WHERE id = ?', [valor, req.params.id], (err, resultado) => {
    if (err) return res.status(500).json({ error: 'No se pudo actualizar.' });
    if (resultado.affectedRows === 0) return res.status(404).json({ error: 'Consulta no encontrada.' });
    res.json({ mensaje: 'Estado actualizado.', leida: valor });
  });
});

app.listen(PUERTO, () => {
  console.log(`Sitio funcionando en http://localhost:${PUERTO}`);
});
