import fs from 'fs';

interface Signature {
  file:      string;
  templates: string[];
}

const SIGNATURES: Signature[] = [
  { file: 'AndroidManifest.xml',  templates: ['android'] },
  { file: 'CMakeLists.txt',       templates: ['cmake', 'c', 'c++'] },
  { file: '*.c',                  templates: ['c'] },
  { file: '*.cabal',              templates: ['haskell'] },
  { file: '*.cpp',                templates: ['c++'] },
  { file: '*.csproj',             templates: ['csharp'] },
  { file: '*.jl',                 templates: ['julia'] },
  { file: '*.kt',                 templates: ['kotlin'] },
  { file: '*.lua',                templates: ['lua'] },
  { file: '*.py',                 templates: ['python'] },
  { file: '*.Rproj',              templates: ['r'] },
  { file: '*.sln',                templates: ['visualstudio'] },
  { file: '*.tf',                 templates: ['terraform'] },
  { file: '*.ts',                 templates: ['node'] },
  { file: '*.xcodeproj',          templates: ['swift', 'xcode'] },
  { file: '*.xcworkspace',        templates: ['swift', 'xcode'] },
  { file: 'angular.json',         templates: ['node', 'angular'] },
  { file: 'build.gradle',         templates: ['java', 'gradle'] },
  { file: 'build.gradle.kts',     templates: ['java', 'kotlin', 'gradle'] },
  { file: 'build.sbt',            templates: ['scala'] },
  { file: 'Cargo.toml',           templates: ['rust'] },
  { file: 'composer.json',        templates: ['php'] },
  { file: 'deno.json',            templates: ['deno'] },
  { file: 'Gemfile',              templates: ['ruby'] },
  { file: 'go.mod',               templates: ['go'] },
  { file: 'mix.exs',              templates: ['elixir'] },
  { file: 'nest-cli.json',        templates: ['node'] },
  { file: 'next.config.js',       templates: ['node'] },
  { file: 'next.config.ts',       templates: ['node'] },
  { file: 'package.json',         templates: ['node'] },
  { file: 'Pipfile',              templates: ['python'] },
  { file: 'pom.xml',              templates: ['java', 'maven'] },
  { file: 'ProjectSettings',      templates: ['unity'] },
  { file: 'pubspec.yaml',         templates: ['flutter', 'dart'] },
  { file: 'pyproject.toml',       templates: ['python'] },
  { file: 'requirements.txt',     templates: ['python'] },
  { file: 'stack.yaml',           templates: ['haskell'] },
  { file: 'svelte.config.js',     templates: ['node'] },
  { file: 'tsconfig.json',        templates: ['node'] },
  { file: 'vue.config.js',        templates: ['node', 'vue'] },
];

const OS_SIGNATURES: Partial<Record<NodeJS.Platform, string[]>> = {
  darwin: ['macos'],
  linux:  ['linux'],
  win32:  ['windows'],
};

export function detectTemplates(dir: string = process.cwd()): string[] {
  const files    = fs.readdirSync(dir);
  const detected = new Set<string>();

  for (const sig of SIGNATURES) {
    const isGlob = sig.file.includes('*');
    const ext    = isGlob ? sig.file.replace('*', '') : null;
    const found  = isGlob
      ? files.some(f => f.endsWith(ext!))
      : files.includes(sig.file);

    if (found) sig.templates.forEach(t => detected.add(t));
  }

  (OS_SIGNATURES[process.platform] ?? []).forEach(t => detected.add(t));

  return [...detected];
}
