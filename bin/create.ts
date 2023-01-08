import * as path from "std/path/mod.ts";
import * as fs from "std/fs/mod.ts";
import { parse } from "std/flags/mod.ts";

const __dirname = path.dirname(path.fromFileUrl(import.meta.url));

const BASE_DIR = path.join(__dirname, "..");
const DIST_DIR = path.join(BASE_DIR, "./dist");

const args = parse(Deno.args);

const title = typeof args?.title === "string"
  ? args.title as string
  : "New Script";

const dir = await Deno.stat(DIST_DIR).catch((error) => {
  if ((error as Error).name === Deno.errors.NotFound.name) {
    return undefined;
  } else {
    throw error;
  }
});

if (typeof dir === "undefined") {
  await Deno.mkdir(DIST_DIR);
} else if (!dir.isDirectory) {
  throw new Deno.errors.AlreadyExists(`'${DIST_DIR}' already exists.`);
}

await Deno.run({
  cmd: [
    "deno",
    "task",
    "clasp",
    "create",
    "--rootDir",
    DIST_DIR,
    "--title",
    title,
  ],
}).status();

await fs.copy(
  path.join(DIST_DIR, ".clasp.json"),
  path.join(BASE_DIR, ".clasp.json"),
  { overwrite: true },
);
