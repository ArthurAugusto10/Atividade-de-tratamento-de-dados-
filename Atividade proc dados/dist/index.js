"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __asyncValues = (this && this.__asyncValues) || function (o) {
    if (!Symbol.asyncIterator) throw new TypeError("Symbol.asyncIterator is not defined.");
    var m = o[Symbol.asyncIterator], i;
    return m ? m.call(o) : (o = typeof __values === "function" ? __values(o) : o[Symbol.iterator](), i = {}, verb("next"), verb("throw"), verb("return"), i[Symbol.asyncIterator] = function () { return this; }, i);
    function verb(n) { i[n] = o[n] && function (v) { return new Promise(function (resolve, reject) { v = o[n](v), settle(resolve, reject, v.done, v.value); }); }; }
    function settle(resolve, reject, d, v) { Promise.resolve(v).then(function(v) { resolve({ value: v, done: d }); }, reject); }
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const csv_parse_1 = require("csv-parse");
const meteo_1 = __importDefault(require("./models/meteo"));
const database_1 = require("./config/database");
// Função para ler o CSV (continua a mesma)
function processDataFromCSV() {
    return __awaiter(this, void 0, void 0, function* () {
        var _a, e_1, _b, _c;
        const records = [];
        const fileName = 'Desafio_Dados_Meteorologicos.csv';
        const filePath = path.resolve(__dirname, '..', fileName);
        if (!fs.existsSync(filePath)) {
            console.error(`ERRO: Arquivo "${fileName}" não encontrado.`);
            return [];
        }
        const parser = fs.createReadStream(filePath)
            .pipe((0, csv_parse_1.parse)({
            delimiter: ';',
            columns: true,
            trim: true,
            bom: true
        }));
        try {
            for (var _d = true, parser_1 = __asyncValues(parser), parser_1_1; parser_1_1 = yield parser_1.next(), _a = parser_1_1.done, !_a; _d = true) {
                _c = parser_1_1.value;
                _d = false;
                const record = _c;
                if (record && record.Date) {
                    records.push(new meteo_1.default(record));
                }
            }
        }
        catch (e_1_1) { e_1 = { error: e_1_1 }; }
        finally {
            try {
                if (!_d && !_a && (_b = parser_1.return)) yield _b.call(parser_1);
            }
            finally { if (e_1) throw e_1.error; }
        }
        return records;
    });
}
function main() {
    return __awaiter(this, void 0, void 0, function* () {
        const db = yield (0, database_1.connectToDatabase)();
        const collection = db.collection('registros');
        console.log('\nLimpando coleção antiga...');
        yield collection.deleteMany({});
        const meteoDataFromCSV = yield processDataFromCSV();
        if (meteoDataFromCSV.length === 0) {
            console.log("Nenhum dado encontrado no CSV. Encerrando.");
            return;
        }
        console.log(`Inserindo ${meteoDataFromCSV.length} registros no banco de dados...`);
        yield collection.insertMany(meteoDataFromCSV);
        console.log('Dados inseridos com sucesso!');
        console.log('\n--- Análises baseadas nos dados do MongoDB ---');
        const top5HottestDays = yield collection.aggregate([
            { $group: { _id: { $dateToString: { format: "%Y-%m-%d", date: "$Date" } }, maxTemp: { $max: "$Temp_C" } } },
            { $sort: { maxTemp: -1 } },
            { $limit: 5 }
        ]).toArray();
        console.log('Os 5 dias com as mais altas temperaturas (via MongoDB):');
        top5HottestDays.forEach(day => {
            console.log(`- ${new Date(day._id).toLocaleDateString('pt-BR', { timeZone: 'UTC' })}: ${day.maxTemp.toFixed(2)}°C`);
        });
        // Pergunta 2: Média de todas as temperaturas
        const avgTempResult = yield collection.aggregate([
            { $group: { _id: null, avgTemp: { $avg: "$Temp_C" } } }
        ]).next();
        // **CORREÇÃO APLICADA AQUI**
        if (avgTempResult) {
            console.log(`\nMédia de todas as temperaturas (via MongoDB): ${avgTempResult.avgTemp.toFixed(2)}°C`);
        }
        // Pergunta 3: Média geral das médias de vento
        const avgWindResult = yield collection.aggregate([
            { $group: { _id: null, avgWind: { $avg: "$WindSpeed_Avg" } } }
        ]).next();
        // **CORREÇÃO APLICADA AQUI**
        if (avgWindResult) {
            console.log(`Média geral das médias de vento (via MongoDB): ${avgWindResult.avgWind.toFixed(2)} m/s`);
        }
        // Pergunta 4: Top 3 dias com maior pressão
        const top3PressureDays = yield collection.aggregate([
            { $group: { _id: { $dateToString: { format: "%Y-%m-%d", date: "$Date" } }, maxPress: { $max: "$Press_Bar" } } },
            { $sort: { maxPress: -1 } },
            { $limit: 3 }
        ]).toArray();
        console.log('\nOs 3 dias com as maiores medições de pressão atmosférica (via MongoDB):');
        top3PressureDays.forEach(day => {
            console.log(`- ${new Date(day._id).toLocaleDateString('pt-BR', { timeZone: 'UTC' })}: ${day.maxPress.toFixed(2)} Bar`);
        });
        // Pergunta 5: Média geral da umidade
        const avgHumidityResult = yield collection.aggregate([
            { $group: { _id: null, avgHum: { $avg: "$Hum" } } }
        ]).next();
        // **CORREÇÃO APLICADA AQUI**
        if (avgHumidityResult) {
            console.log(`Média geral da umidade do ar (via MongoDB): ${avgHumidityResult.avgHum.toFixed(2)}%`);
        }
        yield db.client.close();
        console.log('\nConexão com o MongoDB fechada.');
    });
}
main().catch(console.error);
