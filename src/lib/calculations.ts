import type { Appliance } from '../types';

export const ELECTRICITY_RATE = 6.5; // ₹ per kWh
export const CO2_FACTOR = 0.82; // kg per kWh

export function calculateApplianceMonthlyConsumption(appliance: Appliance) {
  const kwh = (appliance.powerWatts * appliance.hoursPerDay * 30) / 1000;
  return { kwh, cost: kwh * ELECTRICITY_RATE };
}

export function calculateTotalMonthlyBill(appliances: Appliance[]) {
  const totalKwh = appliances.reduce((sum, app) => sum + (app.powerWatts * app.hoursPerDay * 30) / 1000, 0);
  return {
    kwh: totalKwh,
    cost: totalKwh * ELECTRICITY_RATE,
    co2: totalKwh * CO2_FACTOR
  };
}

export function calculateDailyBill(appliances: Appliance[]) {
  const totalKwh = appliances.reduce((sum, app) => sum + (app.powerWatts * app.hoursPerDay) / 1000, 0);
  return {
    kwh: totalKwh,
    cost: totalKwh * ELECTRICITY_RATE,
    co2: totalKwh * CO2_FACTOR
  };
}

export interface CO2Result {
  kgCO2: number;
  treeDays: number;    // kgCO2 / 0.021  (one tree absorbs ~0.021 kg CO2 per day)
  carKm: number;       // kgCO2 / 0.21   (average car emits ~0.21 kg CO2 per km)
}

export function calculateCO2(totalKwh: number, co2Factor: number = 0.82): CO2Result {
  const kgCO2 = totalKwh * co2Factor;
  return {
    kgCO2,
    treeDays: kgCO2 / 0.021,
    carKm: kgCO2 / 0.21
  };
}
