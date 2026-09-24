const express = require('express');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;
const DATA_FILE = path.join(__dirname, 'data.json');

// Default data
const DEFAULTS = {
    license: {
        regStatus: 'Active',
        proponentName: 'SONASWETA COMPANY LIMITED',
        licenseNumber: 'NEMA/ENVIS/EA/0180',
        productName: 'Environment Audit - Low Risk Projects',
        issuanceDate: '9th January 2026'
    },
    styles: {
        logoScale: 100,
        badgeScale: 100,
        bold: false,
        color: '#1a1a1a',
        labelColor: '#000000'
    }
};

// Load data from file or use defaults
function loadData() {
    try {
        if (fs.existsSync(DATA_FILE)) {
            const raw = fs.readFileSync(DATA_FILE, 'utf8');
            return JSON.parse(raw);
        }
    } catch (err) {
        console.error('Error reading data file:', err.message);
    }
    return JSON.parse(JSON.stringify(DEFAULTS));
}

// Save data to file
function saveData(data) {
    try {
        fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2), 'utf8');
    } catch (err) {
        console.error('Error writing data file:', err.message);
    }
}

// Initialize data file if it doesn't exist
if (!fs.existsSync(DATA_FILE)) {
    saveData(DEFAULTS);
}

// Middleware
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// ===== API ROUTES =====

// GET license data
app.get('/api/license', (req, res) => {
    const data = loadData();
    res.json(data.license);
});

// POST update license data
app.post('/api/license', (req, res) => {
    const data = loadData();
    const { regStatus, proponentName, licenseNumber, productName, issuanceDate } = req.body;

    if (!proponentName || !licenseNumber || !productName || !issuanceDate) {
        return res.status(400).json({ error: 'All fields are required.' });
    }

    data.license = { regStatus, proponentName, licenseNumber, productName, issuanceDate };
    saveData(data);
    res.json({ success: true, license: data.license });
});

// GET styles
app.get('/api/styles', (req, res) => {
    const data = loadData();
    res.json(data.styles);
});

// POST update styles
app.post('/api/styles', (req, res) => {
    const data = loadData();
    const { logoScale, badgeScale, bold, color, labelColor } = req.body;

    data.styles = {
        logoScale: logoScale || 100,
        badgeScale: badgeScale || 100,
        bold: bold || false,
        color: color || '#1a1a1a',
        labelColor: labelColor || '#000000'
    };
    saveData(data);
    res.json({ success: true, styles: data.styles });
});

// Serve public page
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Serve admin page
app.get('/admin', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'admin.html'));
});

app.listen(PORT, () => {
    console.log(`NEMA License Server running on port ${PORT}`);
});
