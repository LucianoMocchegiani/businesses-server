import * as admin from 'firebase-admin';

try {
  // Validar que la variable de entorno existe
  if (!process.env.FIREBASE_SERVICE_ACCOUNT) {
    throw new Error('FIREBASE_SERVICE_ACCOUNT environment variable is not set');
  }

  // Lee el JSON desde la variable de entorno
  const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);

  // Validar campos requeridos
  const requiredFields = ['type', 'project_id', 'private_key', 'client_email'];
  const missingFields = requiredFields.filter(field => !serviceAccount[field]);
  
  if (missingFields.length > 0) {
    throw new Error(`Missing required fields in service account: ${missingFields.join(', ')}`);
  }

  console.log('🔥 Firebase Admin - Service Account Info:');
  console.log('Project ID:', serviceAccount.project_id);
  console.log('Client Email:', serviceAccount.client_email);
  console.log('Private Key exists:', !!serviceAccount.private_key);

  if (!admin.apps.length) {
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
    });
    console.log('✅ Firebase Admin initialized successfully');
  } else {
    console.log('✅ Firebase Admin already initialized');
  }

} catch (error) {
  console.error('❌ Firebase Admin initialization error:', error);
  throw error;
}

export default admin;