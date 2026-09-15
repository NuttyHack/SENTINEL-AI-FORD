import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";

export type FordRecall = {
  campaignId: string;
  vehicleModels: string;
  component: string;
  errorDescription: string;
  estimatedUnitsAffected: number;
  remedyAction: string;
};

export type RecallDatasetCoverage = {
  datasetId: string;
  manufacturer: string;
  label: string;
  sourceFile: string;
  sourceDescription: string;
  coveragePeriod: string;
  synthetic: boolean;
  recordCount: number;
  estimatedUnitsAffected: number;
};

const sourceFile = "ford_vehicle_error_recalls_2026_2_1789464338485.csv";
const sourceCandidates = [
  resolve(process.cwd(), "attached_assets", sourceFile),
  resolve(__dirname, "../../../attached_assets", sourceFile),
];

function readSourceCsv(): string {
  const sourcePath = sourceCandidates.find((candidate) => existsSync(candidate));
  if (!sourcePath) {
    throw new Error(`Ford recall dataset not found. Checked: ${sourceCandidates.join(", ")}`);
  }
  return readFileSync(sourcePath, "utf8");
}

function parseCsvRow(row: string): string[] {
  const values: string[] = [];
  let value = "";
  let quoted = false;

  for (let index = 0; index < row.length; index += 1) {
    const character = row[index];
    const nextCharacter = row[index + 1];
    if (character === '"' && quoted && nextCharacter === '"') {
      value += '"';
      index += 1;
    } else if (character === '"') {
      quoted = !quoted;
    } else if (character === "," && !quoted) {
      values.push(value);
      value = "";
    } else {
      value += character;
    }
  }
  values.push(value);
  return values;
}

function parseCsv(csv: string): FordRecall[] {
  const lines = csv.replace(/^\uFEFF/, "").split(/\r?\n/).filter(Boolean);
  const header = parseCsvRow(lines[0] ?? "");
  const expectedHeader = [
    "NHTSA_Campaign_ID",
    "Vehicle_Models",
    "Component_System",
    "Error_Description",
    "Estimated_Units_Affected",
    "Remedy_Action",
  ];
  if (header.join("|") !== expectedHeader.join("|")) {
    throw new Error(`Unexpected Ford recall dataset header in ${sourceFile}`);
  }

  return lines.slice(1).map((line, rowIndex) => {
    const [campaignId, vehicleModels, component, errorDescription, units, remedyAction] = parseCsvRow(line);
    const estimatedUnitsAffected = Number(units);
    if (
      !campaignId ||
      !vehicleModels ||
      !component ||
      !errorDescription ||
      !remedyAction ||
      !Number.isFinite(estimatedUnitsAffected)
    ) {
      throw new Error(`Invalid Ford recall dataset row ${rowIndex + 2} in ${sourceFile}`);
    }
    return {
      campaignId,
      vehicleModels,
      component,
      errorDescription,
      estimatedUnitsAffected,
      remedyAction,
    };
  });
}

export const fordRecalls = parseCsv(readSourceCsv());

export const fordRecallCoverage: RecallDatasetCoverage = {
  datasetId: "ford-vehicle-error-recalls-2026-2",
  manufacturer: "Ford",
  label: "Synthetic/demo dataset · Ford recall sample",
  sourceFile,
  sourceDescription: "Provided Ford vehicle error recall CSV ingested by the Sentinel API.",
  coveragePeriod: "2026 batch 2",
  synthetic: true,
  recordCount: fordRecalls.length,
  estimatedUnitsAffected: fordRecalls.reduce((sum, recall) => sum + recall.estimatedUnitsAffected, 0),
};

export function getFordRecallSummary() {
  const vehicleCounts = new Map<string, number>();
  const componentCounts = new Map<string, number>();
  for (const recall of fordRecalls) {
    for (const vehicle of recall.vehicleModels.split(",").map((item) => item.trim().replace(/\s+\(\d{4}-\d{4}\)$/, ""))) {
      vehicleCounts.set(vehicle, (vehicleCounts.get(vehicle) ?? 0) + recall.estimatedUnitsAffected);
    }
    componentCounts.set(recall.component, (componentCounts.get(recall.component) ?? 0) + recall.estimatedUnitsAffected);
  }
  const highestExposureRecall = [...fordRecalls].sort((left, right) => right.estimatedUnitsAffected - left.estimatedUnitsAffected)[0];
  const topVehicleModel = [...vehicleCounts.entries()].sort((left, right) => right[1] - left[1])[0]?.[0] ?? "Not available";
  const topComponent = [...componentCounts.entries()].sort((left, right) => right[1] - left[1])[0]?.[0] ?? "Not available";

  return {
    campaigns: fordRecallCoverage.recordCount,
    estimatedUnitsAffected: fordRecallCoverage.estimatedUnitsAffected,
    highestExposureRecall: highestExposureRecall?.campaignId ?? "Not available",
    topVehicleModel,
    topComponent,
    sourceLabel: fordRecallCoverage.label,
  };
}

export function filterFordRecalls(filters: {
  recall?: string;
  vehicle?: string;
  component?: string;
  remedy?: string;
}): FordRecall[] {
  const matches = (value: string, filter?: string) => !filter || value.toLowerCase().includes(filter.toLowerCase());
  return fordRecalls.filter(
    (recall) =>
      matches(`${recall.campaignId} ${recall.errorDescription}`, filters.recall) &&
      matches(recall.vehicleModels, filters.vehicle) &&
      matches(recall.component, filters.component) &&
      matches(recall.remedyAction, filters.remedy),
  );
}