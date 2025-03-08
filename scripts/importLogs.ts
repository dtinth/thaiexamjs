import { createReadStream } from "node:fs";
import { createInterface } from "node:readline";
import zlib from "node:zlib";
import yargs from "yargs";
import { calculateLogId, type LogEntry } from "../src/LogEntry";
import { logStorage } from "../src/logStorage";

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

async function importLogs() {
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
      const logEntry: LogEntry = JSON.parse(line);
      const notice = (message: string) => {
        console.warn(`Line ${lineNumber}: ${message}`);
      };

      if (!logEntry.time) {
        notice("Adding missing time");
        logEntry.time = "2025-02-25T00:00:00.000Z";
      }
      if (!logEntry.presetId) {
        logEntry.presetId = logEntry.modelId;
        notice(`Adding missing presetId: ${logEntry.presetId}`);
      }
      const expectedId = calculateLogId(logEntry);
      if (logEntry.id !== expectedId) {
        notice(`Migrating log entry ID from ${logEntry.id} to ${expectedId}`);
        logEntry.id = expectedId;
      }

      logStorage[logEntry.id] = JSON.stringify(logEntry);
      imported++;
      console.log(`Line ${lineNumber}: Imported log entry ${logEntry.id}`);
    } catch (error) {
      console.error(
        `Error parsing or importing log entry at line ${lineNumber}:`,
        error
      );
    }
  }

  console.log(
    `Successfully imported ${imported} log entries from ${inputPath}${
      inputPath.endsWith(".br") ? " (compressed)" : ""
    }`
  );
}

await importLogs();
