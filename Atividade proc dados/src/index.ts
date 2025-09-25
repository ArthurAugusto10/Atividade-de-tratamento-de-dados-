import * as fs from 'fs';
import * as path from 'path';
import { parse } from 'csv-parse';
import Meteo from './models/meteo';
import { connectToDatabase } from './config/database';
import { Collection } from 'mongodb';

// Função para ler o CSV (continua a mesma)
async function processDataFromCSV(): Promise<Meteo[]> {
  const records: Meteo[] = [];
  const fileName = 'Desafio_Dados_Meteorologicos.csv';
  const filePath = path.resolve(__dirname, '..', fileName);

  if (!fs.existsSync(filePath)) {
    console.error(`ERRO: Arquivo "${fileName}" não encontrado.`);
    return [];
  }

  const parser = fs.createReadStream(filePath)
    .pipe(parse({
      delimiter: ';',
      columns: true,
      trim: true,
      bom: true 
    }));

  for await (const record of parser) {
    if (record && record.Date) {
      records.push(new Meteo(record));
    }
  }
  return records;
}

async function main() {
  const db = await connectToDatabase();
  const collection: Collection<Meteo> = db.collection('registros');
  
  console.log('\nLimpando coleção antiga...');
  await collection.deleteMany({});

  const meteoDataFromCSV = await processDataFromCSV();
  if (meteoDataFromCSV.length === 0) {
    console.log("Nenhum dado encontrado no CSV. Encerrando.");
    return;
  }
  
  console.log(`Inserindo ${meteoDataFromCSV.length} registros no banco de dados...`);
  await collection.insertMany(meteoDataFromCSV);
  console.log('Dados inseridos com sucesso!');

  console.log('\n--- Análises baseadas nos dados do MongoDB ---');
  
  const top5HottestDays = await collection.aggregate([
    { $group: { _id: { $dateToString: { format: "%Y-%m-%d", date: "$Date" } }, maxTemp: { $max: "$Temp_C" } } },
    { $sort: { maxTemp: -1 } },
    { $limit: 5 }
  ]).toArray();

  console.log('Os 5 dias com as mais altas temperaturas (via MongoDB):');
  top5HottestDays.forEach(day => {
    console.log(`- ${new Date(day._id).toLocaleDateString('pt-BR', { timeZone: 'UTC' })}: ${day.maxTemp.toFixed(2)}°C`);
  });

  // Pergunta 2: Média de todas as temperaturas
  const avgTempResult = await collection.aggregate([
    { $group: { _id: null, avgTemp: { $avg: "$Temp_C" } } }
  ]).next();
  
  // **CORREÇÃO APLICADA AQUI**
  if (avgTempResult) {
    console.log(`\nMédia de todas as temperaturas (via MongoDB): ${avgTempResult.avgTemp.toFixed(2)}°C`);
  }

  // Pergunta 3: Média geral das médias de vento
  const avgWindResult = await collection.aggregate([
    { $group: { _id: null, avgWind: { $avg: "$WindSpeed_Avg" } } }
  ]).next();

  // **CORREÇÃO APLICADA AQUI**
  if (avgWindResult) {
    console.log(`Média geral das médias de vento (via MongoDB): ${avgWindResult.avgWind.toFixed(2)} m/s`);
  }

  // Pergunta 4: Top 3 dias com maior pressão
  const top3PressureDays = await collection.aggregate([
    { $group: { _id: { $dateToString: { format: "%Y-%m-%d", date: "$Date" } }, maxPress: { $max: "$Press_Bar" } } },
    { $sort: { maxPress: -1 } },
    { $limit: 3 }
  ]).toArray();

  console.log('\nOs 3 dias com as maiores medições de pressão atmosférica (via MongoDB):');
  top3PressureDays.forEach(day => {
    console.log(`- ${new Date(day._id).toLocaleDateString('pt-BR', { timeZone: 'UTC' })}: ${day.maxPress.toFixed(2)} Bar`);
  });

  // Pergunta 5: Média geral da umidade
  const avgHumidityResult = await collection.aggregate([
    { $group: { _id: null, avgHum: { $avg: "$Hum" } } }
  ]).next();

  // **CORREÇÃO APLICADA AQUI**
  if (avgHumidityResult) {
    console.log(`Média geral da umidade do ar (via MongoDB): ${avgHumidityResult.avgHum.toFixed(2)}%`);
  }
  
  await db.client.close();
  console.log('\nConexão com o MongoDB fechada.');
}

main().catch(console.error);