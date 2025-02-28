import fs from "node:fs";
import { Readable, compose } from "node:stream";
import { pipeline } from "node:stream/promises";
import zlib from "node:zlib";
import yargs from "yargs";
import { getAllLogEntries } from "../src/logStorage";

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
async function* generateLogs() {
  for (const logEntry of getAllLogEntries()) {
    yield JSON.stringify(logEntry) + "\n";
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

const logsStream = Readable.from(generateLogs());
const outputStream = getOutput(outputPath);

await pipeline(logsStream, outputStream);
if (outputPath) {
  console.log(
    `Logs exported${
      outputPath.endsWith(".br") ? " and compressed" : ""
    } to ${outputPath}`
  );
}
