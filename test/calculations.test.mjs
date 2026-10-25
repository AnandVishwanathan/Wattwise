import test from 'node:test';
import assert from 'node:assert/strict';

const ELECTRICITY_RATE = 6.5; // ₹ per kWh
const CO2_FACTOR = 0.82; // kg per kWh

function calculateApplianceMonthlyConsumption(appliance) {
  const kwh = (appliance.powerWatts * appliance.hoursPerDay * 30) / 1000;
  return { kwh, cost: kwh * ELECTRICITY_RATE };
}

function calculateTotalMonthlyBill(appliances) {
  const totalKwh = appliances.reduce((sum, app) => sum + (app.powerWatts * app.hoursPerDay * 30) / 1000, 0);
  return {
    kwh: totalKwh,
    cost: totalKwh * ELECTRICITY_RATE,
    co2: totalKwh * CO2_FACTOR
  };
}

function calculateDailyBill(appliances) {
  const totalKwh = appliances.reduce((sum, app) => sum + (app.powerWatts * app.hoursPerDay) / 1000, 0);
  return {
    kwh: totalKwh,
    cost: totalKwh * ELECTRICITY_RATE,
    co2: totalKwh * CO2_FACTOR
  };
}

function calculateCO2(totalKwh, co2Factor = 0.82) {
  const kgCO2 = totalKwh * co2Factor;
  return {
    kgCO2,
    treeDays: kgCO2 / 0.021,
    carKm: kgCO2 / 0.21
  };
}

test('calculateApplianceMonthlyConsumption computes correct monthly kWh and cost', () => {
  const appliance = { name: 'AC', powerWatts: 1500, hoursPerDay: 8 };
  // (1500 * 8 * 30) / 1000 = 360 kWh
  const result = calculateApplianceMonthlyConsumption(appliance);
  assert.equal(result.kwh, 360);
  assert.equal(result.cost, 360 * 6.5);
});

test('calculateTotalMonthlyBill aggregates multiple appliances accurately', () => {
  const appliances = [
    { name: 'Fan', powerWatts: 75, hoursPerDay: 12 },    // (75 * 12 * 30) / 1000 = 27 kWh
    { name: 'Fridge', powerWatts: 200, hoursPerDay: 24 } // (200 * 24 * 30) / 1000 = 144 kWh
  ];
  const result = calculateTotalMonthlyBill(appliances);
  assert.equal(result.kwh, 171);
  assert.equal(result.cost, 171 * 6.5);
  assert.equal(result.co2, 171 * 0.82);
});

test('calculateDailyBill computes single day usage', () => {
  const appliances = [
    { name: 'TV', powerWatts: 100, hoursPerDay: 5 } // (100 * 5) / 1000 = 0.5 kWh
  ];
  const result = calculateDailyBill(appliances);
  assert.equal(result.kwh, 0.5);
  assert.equal(result.cost, 0.5 * 6.5);
  assert.equal(result.co2, 0.5 * 0.82);
});

test('calculateCO2 returns correct environmental offsets and vehicle equivalents', () => {
  const totalKwh = 100;
  const result = calculateCO2(totalKwh);
  assert.equal(result.kgCO2, 82);
  assert.equal(Math.round(result.treeDays), Math.round(82 / 0.021));
  assert.equal(Math.round(result.carKm), Math.round(82 / 0.21));
});

test('handles empty appliance list gracefully', () => {
  const result = calculateTotalMonthlyBill([]);
  assert.equal(result.kwh, 0);
  assert.equal(result.cost, 0);
  assert.equal(result.co2, 0);
});
