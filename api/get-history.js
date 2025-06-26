import { MongoClient } from 'mongodb';

const uri = process.env.MONGODB_URI || "mongodb+srv://db_amk:iqpW69yVTmoNIqnw@dbamk.imkhszp.mongodb.net/?retryWrites=true&w=majority&appName=dbamk";
const dbName = 'amk_spy';
const collectionName = 'position_tracking';

let cachedClient = null;

async function connectToDatabase() {
    if (cachedClient) {
        return cachedClient;
    }
    
    const client = new MongoClient(uri);
    await client.connect();
    cachedClient = client;
    return client;
}

export default async function handler(req, res) {
    // Configurar CORS
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    
    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }
    
    if (req.method !== 'GET') {
        res.status(405).json({ error: 'Método não permitido' });
        return;
    }
    
    try {
        const { userId, asin, limit = 30 } = req.query;
        
        // Validar dados obrigatórios
        if (!userId) {
            res.status(400).json({ error: 'userId é obrigatório' });
            return;
        }
        
        const client = await connectToDatabase();
        const db = client.db(dbName);
        const collection = db.collection(collectionName);
        
        let query = { usuario_id: userId };
        
        // Se ASIN específico foi solicitado
        if (asin) {
            query.asin = asin;
            
            const documento = await collection.findOne(query);
            
            if (!documento) {
                res.status(404).json({ error: 'Histórico não encontrado para este produto' });
                return;
            }
            
            // Ordenar histórico por data (mais recente primeiro)
            documento.historico = documento.historico
                .sort((a, b) => new Date(b.data) - new Date(a.data))
                .slice(0, parseInt(limit));
            
            res.status(200).json({
                success: true,
                asin: documento.asin,
                titulo: documento.titulo_produto,
                termo: documento.termo_pesquisa,
                historico: documento.historico,
                total_entries: documento.historico.length
            });
        } else {
            // Buscar todos os produtos do usuário
            const documentos = await collection.find(query)
                .sort({ updated_at: -1 })
                .limit(parseInt(limit))
                .toArray();
            
            // Processar dados para resposta
            const historico = {};
            documentos.forEach(doc => {
                // Ordenar histórico de cada produto
                doc.historico = doc.historico
                    .sort((a, b) => new Date(b.data) - new Date(a.data))
                    .slice(0, 10); // Últimas 10 entradas por produto
                
                historico[doc.asin] = {
                    titulo: doc.titulo_produto,
                    termo: doc.termo_pesquisa,
                    historico: doc.historico,
                    created_at: doc.created_at,
                    updated_at: doc.updated_at
                };
            });
            
            res.status(200).json({
                success: true,
                usuario_id: userId,
                total_produtos: documentos.length,
                historico: historico
            });
        }
        
    } catch (error) {
        console.error('Erro ao buscar histórico:', error);
        res.status(500).json({ 
            error: 'Erro interno do servidor',
            details: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
} 