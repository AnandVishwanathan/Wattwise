import { useState, useEffect } from 'react';
import { AlertTriangle, X } from 'lucide-react';
import { detectAnomalies } from '../../lib/ml/anomaly';
import type { AnomalyResult } from '../../lib/ml/anomaly';
import { explainAnomaly } from '../../lib/gemini';
import type { EnergyLog } from '../../types';

interface AnomalyAlertProps {
  logs: EnergyLog[];
}

export function AnomalyAlert({ logs }: AnomalyAlertProps) {
  const [anomaly, setAnomaly] = useState<AnomalyResult | null>(null);
  const [explanation, setExplanation] = useState<{ causes: string[]; fix: string } | null>(null);
  const [loading, setLoading] = useState(false);
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    const results = detectAnomalies(logs);
    if (results.length > 0) {
      // most recent anomaly (logs is sorted by date ascending inside detectAnomalies, 
      // but let's just pick the max date result from whatever is returned)
      const sortedResults = [...results].sort((a, b) => b.date.localeCompare(a.date));
      const mostRecent = sortedResults[0];

      // check if dismissed
      const dismissed = localStorage.getItem("dismissed_anomalies");
      if (dismissed) {
        try {
          const dismissedDates = JSON.parse(dismissed);
          if (dismissedDates.includes(mostRecent.date)) return;
        } catch {}
      }
      setAnomaly(mostRecent);
    }
  }, [logs]);

  const handleDismiss = () => {
    if (!anomaly) return;
    const dismissed = localStorage.getItem("dismissed_anomalies");
    let dates: string[] = [];
    if (dismissed) {
      try { dates = JSON.parse(dismissed); } catch {}
    }
    dates.push(anomaly.date);
    localStorage.setItem("dismissed_anomalies", JSON.stringify(dates));
    setAnomaly(null);
  };

  const handleWhy = async () => {
    if (expanded) {
      setExpanded(false);
      return;
    }
    setExpanded(true);
    
    if (!explanation && !loading && anomaly) {
      setLoading(true);
      try {
        const jsonStr = await explainAnomaly(anomaly);
        const parsed = JSON.parse(jsonStr);
        setExplanation(parsed);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
  };

  if (!anomaly) return null;

  let bg = "bg-amber-50";
  let border = "border-l-amber-500";
  let iconClass = "text-amber-500";
  
  if (anomaly.severity === "medium") {
    bg = "bg-orange-50";
    border = "border-l-orange-500";
    iconClass = "text-orange-500";
  } else if (anomaly.severity === "high") {
    bg = "bg-red-50";
    border = "border-l-red-500";
    iconClass = "text-red-500";
  }

  // format date (assume YYYY-MM-DD)
  const formattedDate = new Date(anomaly.date).toLocaleDateString('en-IN', {
    day: 'numeric', month: 'short', year: 'numeric'
  });

  return (
    <div className={`mb-lg p-md rounded-lg border border-border border-l-4 ${bg} ${border} shadow-sm relative`}>
      <button onClick={handleDismiss} className="absolute top-2 right-2 p-1 text-text-muted hover:text-text-primary rounded-full hover:bg-black/5 transition-colors touch-target flex items-center justify-center">
        <X size={16} />
      </button>

      <div className="flex items-start gap-3">
        <AlertTriangle size={18} className={`${iconClass} flex-shrink-0 mt-0.5`} />
        <div className="flex-1 pr-6">
          <p className="text-body font-medium text-text-primary">
            Usage spike detected — {anomaly.percentAbove.toFixed(0)}% above normal on {formattedDate}
          </p>
          
          {!expanded && (
            <button 
              onClick={handleWhy}
              className={`mt-2 text-small font-medium underline-offset-2 hover:underline touch-target px-2 py-1 -ml-2 rounded ${iconClass}`}
            >
              Why?
            </button>
          )}

          {expanded && (
            <div className="mt-md pt-sm border-t border-black/10">
              {loading ? (
                <div className="flex items-center gap-2 text-small text-text-muted">
                  Analysing<span className="animate-pulse">...</span>
                </div>
              ) : explanation ? (
                <div className="text-small text-text-primary space-y-2">
                  <ul className="list-disc pl-4 space-y-1 text-text-muted">
                    {explanation.causes.map((cause, i) => (
                      <li key={i}>{cause}</li>
                    ))}
                  </ul>
                  <p className="font-medium pt-1 text-text-primary">
                    <span className="text-primary mr-1">Fix:</span> 
                    {explanation.fix}
                  </p>
                </div>
              ) : (
                <p className="text-small text-danger">Failed to load explanation.</p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
