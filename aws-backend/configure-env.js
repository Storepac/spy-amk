/**
 * Script para configurar arquivo .env com credenciais AWS RDS
 */
const fs = require('fs');
const path = require('path');

const envContent = `# Configurações do AWS RDS PostgreSQL
DB_HOST=spy-amk-db.cluster-crai2eouav4j.us-east-2.rds.amazonaws.com
DB_PORT=5432
DB_NAME=spy_amk
DB_USER=postgres
DB_PASSWORD=5CqwC[o&[REc93,M

# Configurações da API
PORT=3000
NODE_ENV=development

# Segurança
JWT_SECRET=spy-amk-jwt-secret-2024-muito-seguro
API_KEY=spy-amk-api-key-opcional

# AWS (opcional se usar outras funções)
AWS_REGION=us-east-2
AWS_ACCESS_KEY_ID=sua-access-key
AWS_SECRET_ACCESS_KEY=sua-secret-key
`;

try {
    fs.writeFileSync('.env', envContent);
    console.log('✅ Arquivo .env criado com sucesso!');
    console.log('🔧 Configurações AWS RDS aplicadas');
    console.log('🚀 Agora execute: npm install && npm run dev');
} catch (error) {
    console.error('❌ Erro ao criar .env:', error.message);
    console.log('\n📝 Crie manualmente o arquivo .env com o conteúdo:');
    console.log(envContent);
} 