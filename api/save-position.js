import { MongoClient } from 'mongodb';

const uri = process.env.MONGODB_URI || "mongodb+srv://db_amk:iqpW69yVTmoNIqnw@dbamk.imkhszp.mongodb.net/?retryWrites=true&w=majority&appName=dbamk";
const dbName = 'amk_spy';
const collectionName = 'position_tracking';

let cachedClient = null;

async function connectToDatabase() {
    if (cachedClient) {
        return cachedClient;
    }
    
    const client = new MongoClient(uri, {
        serverSelectionTimeoutMS: 10000, // 10 segundos
        connectTimeoutMS: 10000, // 10 segundos
        maxPoolSize: 10,
        minPoolSize: 1,
        maxIdleTimeMS: 30000
    });
    
    await client.connect();
    cachedClient = client;
    return client;
}

export default async function handler(req, res) {
    // Configurar CORS
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    
    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }
    
    if (req.method !== 'POST') {
        res.status(405).json({ error: 'Método não permitido' });
        return;
    }
    
    try {
        const { asin, titulo, posicao, termoPesquisa, userId } = req.body;
        
        // Validar dados obrigatórios
        if (!asin || !posicao || !userId) {
            res.status(400).json({ error: 'ASIN, posição e userId são obrigatórios' });
            return;
        }
        
        const client = await connectToDatabase();
        const db = client.db(dbName);
        const collection = db.collection(collectionName);
        
        const agora = new Date();
        const dataHoje = agora.toISOString().split('T')[0]; // YYYY-MM-DD
        
        // Buscar documento existente
        const docExistente = await collection.findOne({
            asin: asin,
            usuario_id: userId
        });
        
        if (docExistente) {
            // Verificar se já existe entrada para hoje
            const entryHoje = docExistente.historico.find(entry => entry.data === dataHoje);
            
            if (entryHoje) {
                // Atualizar posição se diferente
                if (entryHoje.posicao !== posicao) {
                    await collection.updateOne(
                        { 
                            asin: asin, 
                            usuario_id: userId,
                            'historico.data': dataHoje 
                        },
                        {
                            $set: {
                                'historico.$.posicao': posicao,
                                'historico.$.timestamp': agora.getTime(),
                                updated_at: agora
                            }
                        }
                    );
                }
            } else {
                // Adicionar nova entrada ao histórico
                await collection.updateOne(
                    { asin: asin, usuario_id: userId },
                    {
                        $push: {
                            historico: {
                                data: dataHoje,
                                posicao: posicao,
                                timestamp: agora.getTime()
                            }
                        },
                        $set: {
                            titulo_produto: titulo?.substring(0, 100) || docExistente.titulo_produto,
                            termo_pesquisa: termoPesquisa || docExistente.termo_pesquisa,
                            updated_at: agora
                        }
                    }
                );
                
                // Limitar histórico a 30 entradas mais recentes
                await collection.updateOne(
                    { asin: asin, usuario_id: userId },
                    {
                        $push: {
                            historico: {
                                $each: [],
                                $sort: { data: -1 },
                                $slice: 30
                            }
                        }
                    }
                );
            }
        } else {
            // Criar novo documento
            await collection.insertOne({
                asin: asin,
                titulo_produto: titulo?.substring(0, 100) || 'Produto sem título',
                termo_pesquisa: termoPesquisa || 'termo-desconhecido',
                usuario_id: userId,
                historico: [{
                    data: dataHoje,
                    posicao: posicao,
                    timestamp: agora.getTime()
                }],
                created_at: agora,
                updated_at: agora
            });
        }
        
        res.status(200).json({ 
            success: true, 
            message: 'Posição salva com sucesso',
            asin: asin,
            posicao: posicao,
            data: dataHoje
        });
        
    } catch (error) {
        console.error('Erro ao salvar posição:', error);
        res.status(500).json({ 
            error: 'Erro interno do servidor',
            details: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
} 