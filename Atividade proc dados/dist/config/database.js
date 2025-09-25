"use strict";
// src/config/database.ts
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.connectToDatabase = connectToDatabase;
const mongodb_1 = require("mongodb");
// IMPORTANTE: Substitua pela sua string de conexão do MongoDB
const mongoURI = 'mongodb://localhost:27017';
const dbName = 'meteorologiaDB'; // Nome do banco de dados
let db;
function connectToDatabase() {
    return __awaiter(this, void 0, void 0, function* () {
        if (db) {
            return db;
        }
        try {
            const client = new mongodb_1.MongoClient(mongoURI);
            yield client.connect();
            console.log('Conectado ao MongoDB com sucesso!');
            db = client.db(dbName);
            return db;
        }
        catch (error) {
            console.error('Erro ao conectar ao MongoDB:', error);
            throw error;
        }
    });
}
