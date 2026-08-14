import { useState } from 'react';

export type ReportPreferences = {
  clicksChart: boolean;
  spendRevenueChart: boolean;
  strategyBrief: boolean;
};

const DEFAULTS: ReportPreferences = {
  clicksChart: true,
  spendRevenueChart: true,
  strategyBrief: true,
};

const STORAGE_KEY = 'adpulse_report_preferences';

export function getReportPreferences(): ReportPreferences {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? { ...DEFAULTS, ...JSON.parse(raw) } : DEFAULTS;
  } catch {
    return DEFAULTS;
  }
}

function saveReportPreferences(prefs: ReportPreferences) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(prefs));
}

export function useReportPreferences() {
  const [prefs, setPrefs] = useState<ReportPreferences>(getReportPreferences);

  const update = (patch: Partial<ReportPreferences>) => {
    setPrefs((prev) => {
      const next = { ...prev, ...patch };
      saveReportPreferences(next);
      return next;
    });
  };

  return { prefs, update };
}
