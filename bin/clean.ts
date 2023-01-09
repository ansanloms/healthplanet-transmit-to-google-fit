import * as path from "std/path/mod.ts";
import * as fs from "std/fs/mod.ts";

const __dirname = path.dirname(path.fromFileUrl(import.meta.url));

await fs.emptyDir(path.join(__dirname, `../dist`));
