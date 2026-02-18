import { modelPresets } from "../src/modelPresets";
import { writeFileSync } from "fs";

const outputPath = "/tmp/model-presets.csv";

const rows = [["id", "inputPrice", "outputPrice", "icon"]];

for (const [id, preset] of Object.entries(modelPresets)) {
  const [inputPrice, outputPrice] = preset.cost;
  const icon = preset.icon ?? "";
  rows.push([id, String(inputPrice), String(outputPrice), icon]);
}

const csv = rows.map((row) => row.join(",")).join("\n");
writeFileSync(outputPath, csv, "utf-8");
console.log(`Exported ${rows.length - 1} model presets to ${outputPath}`);
