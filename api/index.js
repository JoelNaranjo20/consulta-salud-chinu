const express = require('express');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

// Cargar la base de datos en memoria para búsquedas eficientes (una sola vez)
let database = [];
try {
    const rawData = fs.readFileSync(path.join(__dirname, '..', 'data.json'));
    database = JSON.parse(rawData);
    console.log(`✅ Base de datos cargada: ${database.length} registros.`);
} catch (error) {
    console.error('❌ Error al cargar data.json:', error);
}

// =======================
// API DE BÚSQUEDA PÚBLICA
// =======================
// En Vercel: api/index.js se monta en /api, así que las rutas son relativas
// GET /api/search?q=123 → este handler responde a /api/search
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
// POST /api/admin/data
app.post('/api/admin/data', (req, res) => {
    const { user, pass } = req.body;
    
    if (user === 'admin' && pass === 'salud2026') {
        res.json(database);
    } else {
        res.status(401).json({ error: 'Credenciales inválidas' });
    }
});

// Ruta por defecto para /api
app.all('/', (req, res) => {
    res.json({ status: 'ok', message: 'API Secretaría de Salud - Chinú' });
});

// Solo arrancar si se ejecuta directamente (NO en Vercel)
if (process.env.VERCEL !== '1') {
    // En local, también servir archivos estáticos
    app.use(express.static(path.join(__dirname, '..'), {
        index: 'index.html'
    }));
    
    // Proteger data.json localmente
    app.get('/data.json', (req, res) => {
        res.status(403).json({ error: 'Acceso denegado.' });
    });

    app.listen(PORT, () => {
        console.log(`🚀 Servidor ejecutándose en http://localhost:${PORT}`);
        console.log(`🔒 La base de datos /data.json ahora está segura y oculta.`);
    });
}

module.exports = app;
