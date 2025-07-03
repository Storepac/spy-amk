const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Importar routes
const productRoutes = require('./routes/products');
const positionRoutes = require('./routes/positions');
const statsRoutes = require('./routes/stats');

// Middleware de segurança
app.use(helmet());
app.use(cors({
    origin: ['http://localhost:3000', 'https://spy-amk.vercel.app', 'https://www.amazon.com.br'],
    credentials: true
}));

// Rate limiting
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutos
    max: 100, // máximo 100 requests por IP
    message: 'Muitas requisições deste IP, tente novamente em 15 minutos.'
});
app.use('/api/', limiter);

// Middleware para parsing JSON
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api', productRoutes);
app.use('/api', positionRoutes);
app.use('/api', statsRoutes);

// Health check
app.get('/api/health', (req, res) => {
    res.json({ 
        status: 'OK', 
        timestamp: new Date().toISOString(),
        uptime: process.uptime()
    });
});

// Test connection
app.get('/api/test-connection', async (req, res) => {
    try {
        const { Pool } = require('pg');
        const pool = new Pool({
            host: process.env.DB_HOST,
            port: process.env.DB_PORT,
            database: process.env.DB_NAME,
            user: process.env.DB_USER,
            password: process.env.DB_PASSWORD,
            ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
        });

        const result = await pool.query('SELECT NOW()');
        await pool.end();

        res.json({
            success: true,
            message: 'Conexão com AWS RDS bem-sucedida!',
            timestamp: result.rows[0].now,
            database: process.env.DB_NAME
        });
    } catch (error) {
        console.error('Erro ao testar conexão:', error);
        res.status(500).json({
            success: false,
            message: 'Erro ao conectar com AWS RDS',
            error: error.message
        });
    }
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error('Erro não tratado:', err);
    res.status(500).json({
        success: false,
        message: 'Erro interno do servidor',
        error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
});

// 404 handler
app.use((req, res) => {
    res.status(404).json({
        success: false,
        message: 'Endpoint não encontrado'
    });
});

// Iniciar servidor
app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Servidor AWS RDS rodando na porta ${PORT}`);
    console.log(`📊 Environment: ${process.env.NODE_ENV}`);
    console.log(`🗄️ Database: ${process.env.DB_HOST}:${process.env.DB_PORT}/${process.env.DB_NAME}`);
});

module.exports = app; 