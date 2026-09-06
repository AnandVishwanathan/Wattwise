import type { Appliance, SavingOpportunity } from '../../types';

/**
 * TANGEDCO assumed rates for logic:
 * Peak Hours: 06:00 - 09:00, 18:00 - 21:00 (+20% surcharge)
 * Off-Peak Hours: 22:00 - 05:00 (-5% discount)
 * Normal Hours: All other times
 * 
 * Base Rate assumed: ₹8.00 per unit (kWh)
 */

const BASE_RATE = 8.0;
const PEAK_SURCHARGE = 1.2; // +20%
const OFF_PEAK_DISCOUNT = 0.95; // -5%

const FLEXIBLE_APPLIANCES = [
  'Washing Machine',
  'Water Heater',
  'Dishwasher',
  'Electric Vehicle',
  'Pool Pump'
];

export function calculateRateOptimizations(appliances: Appliance[]): SavingOpportunity[] {
  const opportunities: SavingOpportunity[] = [];

  appliances.forEach(appliance => {
    const isFlexible = FLEXIBLE_APPLIANCES.some(name => 
      appliance.name.toLowerCase().includes(name.toLowerCase())
    );

    if (!isFlexible) return;

    // Estimate monthly consumption: power (kW) * hours/day * 30 days
    const monthlyKwh = (appliance.powerWatts / 1000) * appliance.hoursPerDay * 30;
    
    // Assume 50% of the current usage happens during peak hours (worst case for flexible apps)
    const peakUsage = monthlyKwh * 0.5;
    const normalUsage = monthlyKwh * 0.5;
    
    const currentCost = (peakUsage * BASE_RATE * PEAK_SURCHARGE) + (normalUsage * BASE_RATE);
    
    // Optimized: Shift all peak usage to off-peak hours
    const optimizedCost = (monthlyKwh * BASE_RATE * OFF_PEAK_DISCOUNT);
    const savings = currentCost - optimizedCost;

    if (savings > 5) { // Only show if savings are significant (> ₹5)
      opportunities.push({
        applianceId: appliance.id,
        applianceName: appliance.name,
        currentMonthlyCost: Math.round(currentCost),
        optimizedMonthlyCost: Math.round(optimizedCost),
        savingRupees: Math.round(savings),
        recommendedTime: '22:00 - 05:00',
        reason: `Shift usage to off-peak hours to save on TANGEDCO peak surcharges.`,
        isFlexible: true
      });
    }
  });

  return opportunities;
}
