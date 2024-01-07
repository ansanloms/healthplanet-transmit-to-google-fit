// @see https://scrapbox.io/takker/Deno%E3%81%8B%E3%82%89Google_Apps_Script%E3%81%AE%E5%9E%8B%E5%AE%9A%E7%BE%A9%E3%83%95%E3%82%A1%E3%82%A4%E3%83%AB%E3%82%92%E4%BD%BF%E3%81%88%E3%82%8B%E3%81%8B%E8%A9%A6%E3%81%99

import { Octokit } from "octokit";
import * as fs from "std/fs/mod.ts";
import * as path from "std/path/mod.ts";

const __dirname = path.dirname(path.fromFileUrl(import.meta.url));

const octokit = new Octokit();

const expand = async (contentPath: string, dir: string) => {
  await fs.emptyDir(dir);

  const options = {
    owner: "DefinitelyTyped",
    repo: "DefinitelyTyped",
    ref: "master",
  };

  const { data } = await octokit.rest.repos.getContent({
    path: contentPath,
    ...options,
  });

  await Promise.all(data.map(async (content) => {
    const p = path.join(dir, content.name);

    if (content.type === "dir") {
      await expand(content.path, p);
    } else if (path.extname(content.name) === ".ts") {
      const code = await (await fetch(content.download_url)).text();

      await Deno.writeTextFile(
        p,
        code
          .replace(
            '/// <reference types="google-apps-script" />',
            '/// <reference types="../google-apps-script/index.d.ts" />',
          )
          .replace(
            /\/\/\/\s*<reference\s*path="([^"]+)"\s*\/>/g,
            '/// <reference types="./$1" />',
          ),
      );
    }
  }));
};

try {
  await Promise.all(
    ["google-apps-script", "google-apps-script-oauth2"].map(async (type) => {
      const contentPath = `types/${type}`;
      await expand(contentPath, path.join(__dirname, `../${contentPath}`));
    }),
  );

  Deno.exit(0);
} catch (err) {
  console.error(err);
  Deno.exit(1);
}
