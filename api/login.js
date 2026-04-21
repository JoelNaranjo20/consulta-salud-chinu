const fs = require('fs');
const path = require('path');

let database = [];
try {
    const rawData = fs.readFileSync(path.join(__dirname, '..', 'data.json'));
    database = JSON.parse(rawData);
} catch (error) {
    console.error('Error cargando data.json:', error);
}

module.exports = (req, res) => {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Método no permitido' });
    }

    const { user, pass } = req.body || {};

    if (user === 'admin' && pass === 'salud2026') {
        res.status(200).json(database);
    } else {
        res.status(401).json({ error: 'Credenciales inválidas' });
    }
};
