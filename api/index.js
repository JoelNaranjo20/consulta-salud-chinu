const express = require('express');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

// Proteger data.json de manera que no se pueda acceder directamente a través de URL
app.get('/data.json', (req, res) => {
    res.status(403).json({ error: 'Acceso denegado.' });
});

// Cargar la base de datos en memoria para búsquedas eficientes (una sola vez)
let database = [];
try {
    const rawData = fs.readFileSync(path.join(__dirname, '..', 'data.json'));
    database = JSON.parse(rawData);
    console.log(`✅ Base de datos cargada: ${database.length} registros.`);
} catch (error) {
    console.error('❌ Error al cargar data.json:', error);
}

// Servir archivos estáticos controlando explícitamente qué entregamos
app.use(express.static(__dirname, {
    index: 'index.html',
    setHeaders: (res, path) => {
        // Asegurarnos que data.json nunca se entregue accidentalmente aquí
        if (path.endsWith('data.json')) {
            res.status(403).end('Forbidden');
        }
    }
}));

// =======================
// API DE BÚSQUEDA PÚBLICA
// =======================
app.get('/api/search', (req, res) => {
    const query = req.query.q;
    if (!query) {
        return res.status(400).json({ error: 'Falta el parámetro de búsqueda' });
    }

    const q = query.trim().toUpperCase();
    const results = database.filter(r => {
        const docStr = String(r.ID_USUARIO || '').toUpperCase();
        return docStr.includes(q);
    });

    res.json(results);
});

// =======================
// API PARA ADMIN
// =======================
app.post('/api/admin/data', (req, res) => {
    const { user, pass } = req.body;
    
    // Aquí validamos el usuario. Idealmente usar variables de entorno, por ahora hardcodeado como solicitaste:
    if (user === 'admin' && pass === 'salud2026') {
        res.json(database);
    } else {
        res.status(401).json({ error: 'Credenciales inválidas' });
    }
});

// Arrancar el backend
app.listen(PORT, () => {
    console.log(`🚀 Servidor ejecutándose en http://localhost:${PORT}`);
    console.log(`🔒 La base de datos /data.json ahora está segura y oculta.`);
});

module.exports = app;
