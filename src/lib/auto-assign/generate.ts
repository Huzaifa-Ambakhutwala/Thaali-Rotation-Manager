import { addDays, addMonths, addWeeks, format, isAfter, isBefore, parseISO, startOfDay } from "date-fns";

export type AutoAssignRuleInput =
  | {
      frequencyType: "WEEKLY_DAYS";
      daysOfWeek: number[]; // 0-6
      startDate: string; // yyyy-mm-dd
      endDate?: string | null;
    }
  | {
      frequencyType: "EVERY_N_WEEKS";
      frequencyValue: number; // N
      startDate: string;
      endDate?: string | null;
    }
  | {
      frequencyType: "EVERY_N_MONTHS";
      frequencyValue: number; // N
      startDate: string;
      endDate?: string | null;
    }
  | {
      frequencyType: "CUSTOM_DATES";
      customDates: string[]; // yyyy-mm-dd
      startDate: string;
      endDate?: string | null;
    };

export function generateDates(rule: AutoAssignRuleInput, monthsAhead = 3): string[] {
  const start = startOfDay(parseISO(rule.startDate));
  const end =
    rule.endDate ? startOfDay(parseISO(rule.endDate)) : addMonths(start, monthsAhead);

  if (rule.frequencyType === "CUSTOM_DATES") {
    return rule.customDates
      .map((d) => startOfDay(parseISO(d)))
      .filter((d) => !isBefore(d, start) && !isAfter(d, end))
      .map((d) => format(d, "yyyy-MM-dd"))
      .sort();
  }

  if (rule.frequencyType === "EVERY_N_WEEKS") {
    const out: string[] = [];
    let cur = start;
    while (!isAfter(cur, end)) {
      out.push(format(cur, "yyyy-MM-dd"));
      cur = addWeeks(cur, rule.frequencyValue);
    }
    return out;
  }

  if (rule.frequencyType === "EVERY_N_MONTHS") {
    const out: string[] = [];
    let cur = start;
    while (!isAfter(cur, end)) {
      out.push(format(cur, "yyyy-MM-dd"));
      cur = addMonths(cur, rule.frequencyValue);
    }
    return out;
  }

  // WEEKLY_DAYS
  const daysSet = new Set(rule.daysOfWeek);
  const out: string[] = [];
  for (let cur = start; !isAfter(cur, end); cur = addDays(cur, 1)) {
    if (daysSet.has(cur.getDay())) out.push(format(cur, "yyyy-MM-dd"));
  }
  return out;
}

