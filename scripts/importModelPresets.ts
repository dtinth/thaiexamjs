import { writeFileSync } from "fs";

const url =
  "https://docs.getgrist.com/api/docs/eZu7fq4wNtiVroYZuUus4j/tables/Model_presets/records";

const response = await fetch(url);
if (!response.ok) {
  throw new Error(`Failed to fetch: ${response.status} ${response.statusText}`);
}

const data = (await response.json()) as {
  records: {
    id: number;
    fields: {
      id2: string;
      inputPrice: number;
      outputPrice: number;
      icon: string;
      model: string;
      params: string;
      old: boolean;
    };
  }[];
};

const presets = data.records.map(({ fields }) => ({
  id: fields.id2,
  inputPrice: fields.inputPrice,
  outputPrice: fields.outputPrice,
  icon: fields.icon,
  model: fields.model,
  params: fields.params ? JSON.parse(fields.params) : undefined,
  old: fields.old,
}));

const outputPath = "src/modelPresetsBase.json";
writeFileSync(outputPath, JSON.stringify(presets, null, 2) + "\n", "utf-8");
console.log(`Imported ${presets.length} model presets to ${outputPath}`);
