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
    const query = req.query.q;
    if (!query) {
        return res.status(400).json({ error: 'Falta el parámetro de búsqueda' });
    }

    const q = query.trim().toUpperCase();
    const results = database.filter(r => {
        const docStr = String(r.ID_USUARIO || '').toUpperCase();
        return docStr.includes(q);
    });

    res.status(200).json(results);
};
