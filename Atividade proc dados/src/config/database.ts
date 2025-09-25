// src/config/database.ts

import { MongoClient, Db } from 'mongodb';

// IMPORTANTE: Substitua pela sua string de conexão do MongoDB
const mongoURI = 'mongodb://localhost:27017'; 
const dbName = 'meteorologiaDB'; // Nome do banco de dados

let db: Db;

export async function connectToDatabase() {
  if (db) {
    return db;
  }
  try {
    const client = new MongoClient(mongoURI);
    await client.connect();
    console.log('Conectado ao MongoDB com sucesso!');
    db = client.db(dbName);
    return db;
  } catch (error) {
    console.error('Erro ao conectar ao MongoDB:', error);
    throw error;
  }
}