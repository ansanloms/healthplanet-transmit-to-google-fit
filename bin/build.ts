import * as path from "std/path/mod.ts";
import * as fs from "std/fs/mod.ts";
import { build, stop } from "esbuild/mod.js";
import { GasPlugin } from "esbuild-gas-plugin";
import httpFetch from "esbuild_plugin_http_fetch/index.js";

const __dirname = path.dirname(path.fromFileUrl(import.meta.url));

const copy = async (filename: string) => {
  const src = path.join(__dirname, `../src/${filename}`);
  const dest = path.join(__dirname, `../dist/${filename}`);

  if (!(await fs.exists(src))) {
    return;
  }

  const file = await Deno.stat(src);

  if (await fs.exists(dest)) {
    await Deno.remove(dest, { recursive: true });
  }

  if (file.isFile) {
    await Deno.mkdir(path.dirname(dest), { recursive: true });
    await fs.copy(src, dest);
  } else if (file.isDirectory) {
    for await (const entry of Deno.readDir(src)) {
      await copy(`${filename}/${entry.name}`);
    }
  }
};

await build({
  entryPoints: [path.join(__dirname, "../src/main.ts")],
  bundle: true,
  outfile: path.join(__dirname, "../dist/bundle.js"),
  plugins: [httpFetch, GasPlugin],
});
stop();

await Promise.all([
  "appsscript.json",
  "templates",
].map(copy));
