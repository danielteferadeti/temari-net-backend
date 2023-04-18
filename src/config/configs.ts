import dotenv from 'dotenv';
dotenv.config();

const  DB_URI = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/a2sv"
const SERVER_URL = process.env.SERVER_URL || 'http://localhost:'
const PORT = process.env.PORT || 3000
const EMAIL = process.env.EMAIL 
const PASSWORD = process.env.PASSWORD 
const JWT_SECRET = process.env.JWT_SECRET || 'tempSeceret' 

const configs = {
  DB_URI,
  SERVER_URL,
  PORT,
  EMAIL,
  PASSWORD,
  JWT_SECRET
}

export default configs

