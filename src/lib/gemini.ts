import { GoogleGenerativeAI } from "@google/generative-ai";
import type { Appliance, EnergyTip } from "../types";
import type { AnomalyResult } from "./ml/anomaly";

let genAI: GoogleGenerativeAI | null = null;
let model: any = null;

try {
  if (import.meta.env.VITE_GEMINI_API_KEY) {
    genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY);
    model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
  }
} catch (e) {
  console.warn("Gemini API initialization failed:", e);
}

const geminiCache = new Map<string, { response: string; timestamp: number }>();

function cacheKey(obj: object): string {
  try {
    return btoa(JSON.stringify(obj)).slice(0, 40);
  } catch {
    return Date.now().toString();
  }
}

export async function getEnergyTips(
  appliances: Appliance[],
  monthlyBill: number,
  habitScore: number,
  localRate: number,
  bypassCache: boolean = false
): Promise<EnergyTip[]> {
  const fallback: EnergyTip[] = [
    { appliance: "AC", action: "Raise thermostat to 24°C instead of 18°C", savingRupees: 480, category: "temperature" },
    { appliance: "Ceiling Fan", action: "Turn off fans in unoccupied rooms", savingRupees: 120, category: "habit" },
    { appliance: "Water Heater", action: "Reduce heating duration to 20 minutes daily", savingRupees: 300, category: "duration" }
  ];

  const inputObj = { appliances, monthlyBill, habitScore, localRate };
  const key = cacheKey(inputObj);
  
  const cached = geminiCache.get(key);
  if (!bypassCache && cached && Date.now() - cached.timestamp < 1800000) {
    try {
      return JSON.parse(cached.response);
    } catch {
      // Ignore cache parse error
    }
  }

  if (!model) {
    console.warn("Gemini model not initialized, using fallback tips");
    return fallback;
  }

  const applianceListText = appliances.map(a => 
    `${a.name} — ${a.powerWatts} W — ${a.hoursPerDay} hrs/day — ₹${((a.powerWatts * a.hoursPerDay * 30 / 1000) * localRate).toFixed(0)}/month`
  ).join("\n    ");

  const prompt = `
You are an energy efficiency expert for Indian households.

User data:
- Monthly electricity bill: ₹${monthlyBill}
- Local rate: ₹${localRate} per kWh
- Habit score: ${habitScore}/100
- Top appliances by consumption:
  ${applianceListText}

Give exactly 3 energy-saving tips. Each tip MUST:
1. Name one specific appliance from the list above
2. State one concrete action (not vague advice)
3. Include the exact estimated ₹ saving per month
4. Be under 30 words

Return ONLY a valid JSON array. No explanation, no markdown, no code fences.
Format:
[
  {
    "appliance": "appliance name here",
    "action": "specific action here",
    "savingRupees": 350,
    "category": "timing"
  }
]
category must be one of: timing | temperature | duration | replacement | habit
`.trim();

  try {
    const raw = await model.generateContent(prompt);
    const text = raw.response.text().trim();
    
    // Strip markdown formatting if any
    const jsonStr = text.startsWith('```') 
      ? text.replace(/```json\n?|```\n?/g, "") 
      : text;
      
    const parsed = JSON.parse(jsonStr);
    
    if (Array.isArray(parsed) && parsed.length === 3 && parsed[0].appliance) {
      geminiCache.set(key, { response: JSON.stringify(parsed), timestamp: Date.now() });
      return parsed as EnergyTip[];
    } else {
       throw new Error("Invalid response format");
    }
  } catch (error) {
    console.error("Gemini API Error:", error);
    return fallback;
  }
}

export async function explainAnomaly(anomaly: AnomalyResult): Promise<string> {
  const fallback = JSON.stringify({
    causes: ["AC or water heater may have run longer than usual", "Additional guests or appliances in use"],
    fix: "Check your AC thermostat setting and verify all appliances were switched off at night."
  });

  if (!model) {
    return fallback;
  }

  const prompt = `
You are an energy expert for Indian homes.

Energy usage spiked ${anomaly.percentAbove.toFixed(0)}% above normal on ${anomaly.date}.
Normal daily average: ${anomaly.expectedKwh.toFixed(2)} kWh
Actual that day: ${anomaly.actualKwh.toFixed(2)} kWh

Give exactly 2 likely causes and 1 fix specific to Indian homes.
Keep total response under 45 words.
Return ONLY JSON:
{ "causes": ["cause 1", "cause 2"], "fix": "one actionable fix" }
`.trim();

  try {
    const raw = await model.generateContent(prompt);
    const text = raw.response.text().trim();
    
    // Strip markdown formatting if any
    const jsonStr = text.startsWith('```') 
      ? text.replace(/```json\n?|```\n?/g, "") 
      : text;
      
    // Validate JSON structure
    JSON.parse(jsonStr); 
    
    return jsonStr;
  } catch (error) {
    console.error("Gemini API Error in explainAnomaly:", error);
    return fallback;
  }
}
