import * as dotenv from 'dotenv';

// Cargar variables de entorno inmediatamente
const result = dotenv.config();

if (result.error) {
  console.error('❌ Error loading .env file:', result.error);
} else {
  console.log('✅ Environment variables loaded successfully');
}

// Exportar una función de validación
export function validateEnvironment() {
  const requiredVars = [
    'DATABASE_URL',
    'FIREBASE_SERVICE_ACCOUNT'
  ];

  const missingVars = requiredVars.filter(varName => !process.env[varName]);
  
  if (missingVars.length > 0) {
    console.error('❌ Missing required environment variables:', missingVars.join(', '));
    throw new Error(`Missing required environment variables: ${missingVars.join(', ')}`);
  }
  
  console.log('✅ All required environment variables are present');
  return true;
}
