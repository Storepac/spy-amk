/**
 * Script para corrigir arquivo .env com configurações corretas
 */
const fs = require('fs');

const envContent = `# Configurações do AWS RDS PostgreSQL
DB_HOST=spy-amk-db.cluster-crai2eouav4j.us-east-2.rds.amazonaws.com
DB_PORT=5432
DB_NAME=spy-amk-db
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
    console.log('✅ Arquivo .env corrigido!');
    console.log('🔧 Configurações atualizadas:');
    console.log('   DB_HOST: spy-amk-db.cluster-crai2eouav4j.us-east-2.rds.amazonaws.com');
    console.log('   DB_NAME: spy-amk-db');
    console.log('   DB_PORT: 5432');
    console.log('');
    console.log('🚀 Agora reinicie o servidor: Ctrl+C e depois npm run dev');
} catch (error) {
    console.error('❌ Erro ao corrigir .env:', error.message);
} 