import fs from 'fs';

const SIGNATURES = [
  // Android
  { file: 'AndroidManifest.xml',   templates: ['android'] },

  // C / C++
  { file: 'CMakeLists.txt',        templates: ['cmake', 'c', 'c++'] },
  { file: '*.c',                   templates: ['c'] },
  { file: '*.cpp',                 templates: ['c++'] },

  // C#
  { file: '*.csproj',              templates: ['csharp'] },
  { file: '*.sln',                 templates: ['visualstudio'] },

  // Dart / Flutter
  { file: 'pubspec.yaml',          templates: ['flutter', 'dart'] },

  // Deno
  { file: 'deno.json',             templates: ['deno'] },

  // Elixir
  { file: 'mix.exs',               templates: ['elixir'] },

  // Go
  { file: 'go.mod',                templates: ['go'] },

  // Haskell
  { file: '*.cabal',               templates: ['haskell'] },
  { file: 'stack.yaml',            templates: ['haskell'] },

  // Java / Kotlin / Scala
  { file: 'pom.xml',               templates: ['java', 'maven'] },
  { file: 'build.gradle',          templates: ['java', 'gradle'] },
  { file: 'build.gradle.kts',      templates: ['java', 'kotlin', 'gradle'] },
  { file: '*.kt',                  templates: ['kotlin'] },
  { file: 'build.sbt',             templates: ['scala'] },

  // JavaScript / TypeScript
  { file: 'package.json',          templates: ['node'] },
  { file: 'tsconfig.json',         templates: ['node'] },
  { file: '*.ts',                  templates: ['node'] },
  { file: 'angular.json',          templates: ['node', 'angular'] },
  { file: 'nest-cli.json',         templates: ['node'] },
  { file: 'next.config.js',        templates: ['node'] },
  { file: 'next.config.ts',        templates: ['node'] },
  { file: 'svelte.config.js',      templates: ['node'] },
  { file: 'vue.config.js',         templates: ['node', 'vue'] },

  // Julia
  { file: '*.jl',                  templates: ['julia'] },

  // Lua
  { file: '*.lua',                 templates: ['lua'] },

  // PHP
  { file: 'composer.json',         templates: ['php'] },

  // Python
  { file: 'requirements.txt',      templates: ['python'] },
  { file: 'Pipfile',               templates: ['python'] },
  { file: 'pyproject.toml',        templates: ['python'] },
  { file: '*.py',                  templates: ['python'] },

  // R
  { file: '*.Rproj',               templates: ['r'] },

  // Ruby
  { file: 'Gemfile',               templates: ['ruby'] },

  // Rust
  { file: 'Cargo.toml',            templates: ['rust'] },

  // Swift / Xcode
  { file: '*.xcodeproj',           templates: ['swift', 'xcode'] },
  { file: '*.xcworkspace',         templates: ['swift', 'xcode'] },

  // Terraform
  { file: '*.tf',                  templates: ['terraform'] },

  // Unity
  { file: 'ProjectSettings',       templates: ['unity'] },
];

const OS_SIGNATURES = {
  darwin: ['macos'],
  win32:  ['windows'],
  linux:  ['linux'],
};

export function detectTemplates(dir = process.cwd()) {
  const files    = fs.readdirSync(dir);
  const detected = new Set();

  for (const sig of SIGNATURES) {
    const isGlob = sig.file.includes('*');
    const ext    = isGlob ? sig.file.replace('*', '') : null;
    const found  = isGlob
      ? files.some(f => f.endsWith(ext))
      : files.includes(sig.file);

    if (found) sig.templates.forEach(t => detected.add(t));
  }

  (OS_SIGNATURES[process.platform] ?? []).forEach(t => detected.add(t));

  return [...detected];
}
