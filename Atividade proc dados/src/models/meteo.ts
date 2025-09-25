// src/models/Meteo.ts

function parseToNumber(value: string, isInt = false): number {
    if (typeof value !== 'string' || value.trim() === '') {
      return 0;
    }
    const sanitizedValue = value.replace(',', '.');
    const result = isInt ? parseInt(sanitizedValue, 10) : parseFloat(sanitizedValue);
    return isNaN(result) ? 0 : result;
  }
  
  class Meteo {
    Date: Date;
    Time: string;
    Temp_C: number;
    Hum: number;
    Press_Bar: number;
    TempCabine_C: number;
    Charge: number;
    SR_Wm2: number;
    WindPeak_ms: number;
    WindSpeed_Inst: number;
    WindSpeed_Avg: number;
    WindDir_Inst: number;
    WindDir_Avg: number;
  
    constructor(data: any) {
      // Acessa a data pela chave correta ou pela chave com BOM
      const dateValue = data.Date || data['\uFEFFDate'];
      const [day, month, year] = dateValue.split('/');
      this.Date = new Date(`${year}-${month}-${day}`);
      this.Time = data.Time;
      this.Temp_C = parseToNumber(data.Temp_C);
      this.Hum = parseToNumber(data.Hum);
      this.Press_Bar = parseToNumber(data.Press_Bar);
      this.TempCabine_C = parseToNumber(data.TempCabine_C);
      this.Charge = parseToNumber(data.Charge);
      this.SR_Wm2 = parseToNumber(data.SR_Wm2);
      this.WindPeak_ms = parseToNumber(data.WindPeak_ms);
      this.WindSpeed_Inst = parseToNumber(data.WindSpeed_Inst);
      this.WindSpeed_Avg = parseToNumber(data.WindSpeed_Avg);
      this.WindDir_Inst = parseToNumber(data.WindDir_Inst, true);
      this.WindDir_Avg = parseToNumber(data.WindDir_Avg, true);
    }
  }
  
  export = Meteo;