# gitignore-generator

Interactive CLI to generate a `.gitignore` file from [gitignore.io](https://www.toptal.com/developers/gitignore) templates.

## Features

- Auto-detects your project's languages and frameworks
- Searchable list of 500+ templates
- Merge or overwrite an existing `.gitignore`
- Zero dependencies — pure Node.js

## Requirements

- Node.js 18+

## Usage

```bash
node src/index.js
```

Or install globally:

```bash
npm link
gitignore-gen
```

## Supported languages

Android, C, C++, C#, Dart, Deno, Elixir, Flutter, Go, Haskell, Java, JavaScript, Julia, Kotlin, Lua, PHP, Python, R, Ruby, Rust, Scala, Swift, Terraform, TypeScript, Unity, and more.

## Project structure

```
src/
├── index.js    entry point
├── api.js      fetches templates from gitignore.io
├── detect.js   auto-detects project languages
├── prompt.js   CLI prompts
├── ui.js       colors, spinner, interactive inputs
└── writer.js   reads and writes the .gitignore file
```
