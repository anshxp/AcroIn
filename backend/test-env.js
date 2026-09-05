import dotenv from 'dotenv';
dotenv.config();

console.log('PORT:', process.env.PORT || '(not configured)');
console.log('MONGO_URI configured:', Boolean(process.env.MONGO_URI));
console.log('JWT_SECRET configured:', Boolean(process.env.JWT_SECRET));
