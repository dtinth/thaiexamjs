import fs from "node:fs";
import { Readable, compose } from "node:stream";
import { pipeline } from "node:stream/promises";
import zlib from "node:zlib";
import yargs from "yargs";
import { taskStorage } from "../src/persistence";
import { enumerateAllTasks } from "../src/taskUtils";

const argv = await yargs(process.argv.slice(2))
  .option("o", {
    alias: "output",
    describe: "Output file path",
    type: "string",
  })
  .strict()
  .help()
  .parse();

const outputPath = argv.o as string | undefined;

// Create an async iterable of log entries
async function* generatePayload() {
  const tasks = enumerateAllTasks();
  for (const task of tasks) {
    const status = await taskStorage.getItem(task.id);
    if (!status) continue;
    yield JSON.stringify({ _id: task.id, ...status }) + "\n";
  }
}

// Get the appropriate output stream based on the output path
function getOutput(outputPath?: string) {
  if (!outputPath) {
    return process.stdout;
  }

  if (outputPath.endsWith(".br")) {
    const compressor = zlib.createBrotliCompress({
      params: {
        [zlib.constants.BROTLI_PARAM_QUALITY]: 7,
        [zlib.constants.BROTLI_PARAM_MODE]: zlib.constants.BROTLI_MODE_TEXT,
      },
    });
    const fileStream = fs.createWriteStream(outputPath);
    return compose(compressor, fileStream);
  } else {
    return fs.createWriteStream(outputPath);
  }
}

const ndjsonStream = Readable.from(generatePayload());
const outputStream = getOutput(outputPath);

await pipeline(ndjsonStream, outputStream);
if (outputPath) {
  console.log(
    `Data exported${
      outputPath.endsWith(".br") ? " and compressed" : ""
    } to ${outputPath}`
  );
}
