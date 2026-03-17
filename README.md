# gitignore-generator

Interactive CLI to generate a `.gitignore` file from [gitignore.io](https://www.toptal.com/developers/gitignore) templates.

## Features

- Auto-detects your project's languages and frameworks
- Searchable list of 500+ templates
- Merge or overwrite an existing `.gitignore`
- Zero dependencies — pure Node.js

## Requirements

- Node.js 18+
- TypeScript 5+

## Usage

```bash
npm run build
node dist/index.js
```

Or install globally:

```bash
npm run build
npm link
gitignore-gen
```

## Supported languages

Android, C, C++, C#, Dart, Deno, Elixir, Flutter, Go, Haskell, Java, JavaScript, Julia, Kotlin, Lua, PHP, Python, R, Ruby, Rust, Scala, Swift, Terraform, TypeScript, Unity, and more.

## Project structure

```
src/
├── index.ts    entry point
├── api.ts      fetches templates from gitignore.io
├── detect.ts   auto-detects project languages
├── prompt.ts   CLI prompts
├── ui.ts       colors, spinner, interactive inputs
└── writer.ts   reads and writes the .gitignore file
```
