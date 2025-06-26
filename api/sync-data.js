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
        const { userId, historico, action = 'merge' } = req.body;
        
        // Validar dados obrigatórios
        if (!userId || !historico) {
            res.status(400).json({ error: 'userId e historico são obrigatórios' });
            return;
        }
        
        const client = await connectToDatabase();
        const db = client.db(dbName);
        const collection = db.collection(collectionName);
        
        const agora = new Date();
        const resultados = {
            produtos_processados: 0,
            produtos_criados: 0,
            produtos_atualizados: 0,
            entries_adicionadas: 0,
            entries_atualizadas: 0,
            erros: []
        };
        
        // Processar cada produto do histórico local
        for (const [asin, dadosLocal] of Object.entries(historico)) {
            try {
                resultados.produtos_processados++;
                
                // Buscar documento existente na nuvem
                const docNuvem = await collection.findOne({
                    asin: asin,
                    usuario_id: userId
                });
                
                if (!docNuvem) {
                    // Criar novo documento na nuvem
                    await collection.insertOne({
                        asin: asin,
                        titulo_produto: dadosLocal.titulo?.substring(0, 100) || 'Produto sem título',
                        termo_pesquisa: dadosLocal.termo || 'termo-desconhecido',
                        usuario_id: userId,
                        historico: dadosLocal.historico || [],
                        created_at: agora,
                        updated_at: agora
                    });
                    
                    resultados.produtos_criados++;
                    resultados.entries_adicionadas += (dadosLocal.historico || []).length;
                } else {
                    // Merge dos históricos
                    const historicoNuvem = new Map();
                    docNuvem.historico.forEach(entry => {
                        historicoNuvem.set(entry.data, entry);
                    });
                    
                    let novasEntries = 0;
                    let entriesAtualizadas = 0;
                    
                    // Processar histórico local
                    (dadosLocal.historico || []).forEach(entryLocal => {
                        const entryNuvem = historicoNuvem.get(entryLocal.data);
                        
                        if (!entryNuvem) {
                            // Nova entrada
                            historicoNuvem.set(entryLocal.data, entryLocal);
                            novasEntries++;
                        } else {
                            // Merge - manter a entrada mais recente baseada no timestamp
                            if (entryLocal.timestamp > entryNuvem.timestamp) {
                                historicoNuvem.set(entryLocal.data, entryLocal);
                                entriesAtualizadas++;
                            }
                        }
                    });
                    
                    // Converter Map de volta para array e ordenar
                    const historicoMerged = Array.from(historicoNuvem.values())
                        .sort((a, b) => new Date(b.data) - new Date(a.data))
                        .slice(0, 30); // Manter apenas últimas 30 entradas
                    
                    // Atualizar documento na nuvem se houve mudanças
                    if (novasEntries > 0 || entriesAtualizadas > 0) {
                        await collection.updateOne(
                            { asin: asin, usuario_id: userId },
                            {
                                $set: {
                                    historico: historicoMerged,
                                    titulo_produto: dadosLocal.titulo?.substring(0, 100) || docNuvem.titulo_produto,
                                    termo_pesquisa: dadosLocal.termo || docNuvem.termo_pesquisa,
                                    updated_at: agora
                                }
                            }
                        );
                        
                        resultados.produtos_atualizados++;
                        resultados.entries_adicionadas += novasEntries;
                        resultados.entries_atualizadas += entriesAtualizadas;
                    }
                }
                
            } catch (error) {
                console.error(`Erro ao processar ASIN ${asin}:`, error);
                resultados.erros.push({
                    asin: asin,
                    erro: error.message
                });
            }
        }
        
        res.status(200).json({
            success: true,
            message: 'Sincronização concluída',
            usuario_id: userId,
            action: action,
            resultados: resultados,
            timestamp: agora.toISOString()
        });
        
    } catch (error) {
        console.error('Erro na sincronização:', error);
        res.status(500).json({ 
            error: 'Erro interno do servidor',
            details: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
} 