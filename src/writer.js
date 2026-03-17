import fs from 'fs';

export function fileExists(filePath) {
  return fs.existsSync(filePath);
}

export function mergeContent(existing, incoming) {
  const existingLines = new Set(existing.split('\n').map(l => l.trim()));
  const newLines = incoming
    .split('\n')
    .filter(line => !existingLines.has(line.trim()));

  return existing.trimEnd() + '\n\n# --- Ajout automatique ---\n' + newLines.join('\n');
}

export function writeFile(filePath, content) {
  fs.writeFileSync(filePath, content, 'utf8');
}

export function readFile(filePath) {
  return fs.readFileSync(filePath, 'utf8');
}
