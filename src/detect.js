import fs from 'fs';
import path from 'path';

const SIGNATURES = [
  { file: 'package.json',        templates: ['node'] },
  { file: 'requirements.txt',    templates: ['python'] },
  { file: 'Pipfile',             templates: ['python'] },
  { file: 'pyproject.toml',      templates: ['python'] },
  { file: 'Cargo.toml',          templates: ['rust'] },
  { file: 'go.mod',              templates: ['go'] },
  { file: 'pom.xml',             templates: ['java', 'maven'] },
  { file: 'build.gradle',        templates: ['java', 'gradle'] },
  { file: 'composer.json',       templates: ['php'] },
  { file: 'Gemfile',             templates: ['ruby'] },
  { file: '*.sln',               templates: ['visualstudio'] },
  { file: '*.xcodeproj',         templates: ['swift', 'xcode'] },
  { file: 'pubspec.yaml',        templates: ['flutter', 'dart'] },
  { file: 'mix.exs',             templates: ['elixir'] },
  { file: 'deno.json',           templates: ['deno'] },
];

const OS_SIGNATURES = {
  darwin: ['macos'],
  win32:  ['windows'],
  linux:  ['linux'],
};

export function detectTemplates(dir = process.cwd()) {
  const files = fs.readdirSync(dir);
  const detected = new Set();

  for (const sig of SIGNATURES) {
    const isGlob = sig.file.includes('*');
    const ext = isGlob ? sig.file.replace('*', '') : null;
    const found = isGlob
      ? files.some(f => f.endsWith(ext))
      : files.includes(sig.file);

    if (found) sig.templates.forEach(t => detected.add(t));
  }

  const osSuggestions = OS_SIGNATURES[process.platform] ?? [];
  osSuggestions.forEach(t => detected.add(t));

  return [...detected];
}
