import { createReadStream } from "node:fs";
import { createInterface } from "node:readline";
import zlib from "node:zlib";
import yargs from "yargs";
import { taskStorage } from "../src/persistence";
import type { TaskStatus } from "../src/taskStatus";

const argv = await yargs(process.argv.slice(2))
  .option("i", {
    alias: "input",
    describe: "Input file path",
    type: "string",
    demandOption: true,
  })
  .strict()
  .help()
  .parse();

const inputPath = argv.i as string;

// Get the appropriate input stream based on the input path
function getInputStream(inputPath: string) {
  const fileStream = createReadStream(inputPath);
  if (inputPath.endsWith(".br")) {
    return fileStream.pipe(zlib.createBrotliDecompress());
  } else {
    return fileStream;
  }
}

async function importTaskStatuses() {
  const inputStream = getInputStream(inputPath);
  const rl = createInterface({
    input: inputStream as any,
    crlfDelay: Infinity,
  });

  let lineNumber = 0;
  let imported = 0;

  for await (const line of rl) {
    lineNumber++;
    if (!line?.trim()) continue;

    try {
      const { _id, ...status }: TaskStatus & { _id: string } = JSON.parse(line);
      taskStorage.setItem(_id, status);
      imported++;
      console.log(`Line ${lineNumber}: Imported task status for ${_id}`);
    } catch (error) {
      console.error(
        `Error parsing or importing task status at line ${lineNumber}:`,
        error
      );
    }
  }

  console.log(
    `Successfully imported ${imported} task statuses from ${inputPath}${
      inputPath.endsWith(".br") ? " (compressed)" : ""
    }`
  );
}

await importTaskStatuses();
