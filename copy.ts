import $ from "https://deno.land/x/dax/mod.ts"

if (Deno.args[0] == null) {
  console.error("Missing directory argument")
  Deno.exit(1)
}

const newDir = $.path(Deno.args[0]).resolve()
console.log(`Creating new project at "${newDir}"`)

const extraIgnore = new Set(["copy.mjs", "copy.ts"])
const files = (await $`git ls-tree -r main --name-only`.lines()).filter(
  (item) => Boolean(item) && !extraIgnore.has(item),
)

await $`mkdir -p ${newDir}`
for (const filePath of files) {
  await $`mkdir -p ${$.path(newDir, $.path(filePath).dirname()).resolve()}`
  await $`cp ${filePath} ${$.path(newDir, filePath).resolve()}`
}

$.cd(newDir)

const name = $.path(Deno.args[0]).basename()
await Deno.writeTextFile(
  "README.md",
  `
# ${name}

<!--
[![npm](https://img.shields.io/npm/v/${name})](https://www.npmjs.com/package/${name})
![npm bundle size](https://img.shields.io/bundlephobia/minzip/${name})
![node-current](https://img.shields.io/node/v/${name})
[![Codecov](https://img.shields.io/codecov/c/github/BeeeQueue/${name}?token=TOKEN_HERE)](https://app.codecov.io/github/BeeeQueue/${name})
-->
`.trim(),
)

await Deno.writeTextFile(
  "package.json",
  (await Deno.readTextFile("package.json")).replace("@beequeue/project-template", name),
)

// Remove git history

await $`git init --quiet`
await $`git add .`
await $`git commit --quiet -m "init"`

await $`pnpm i`
await $`smerge .`
await $`webstorm .`
