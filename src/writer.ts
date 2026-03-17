import fs from 'fs';

export function fileExists(filePath: string): boolean {
  return fs.existsSync(filePath);
}

export function mergeContent(existing: string, incoming: string): string {
  const existingLines = new Set(existing.split('\n').map(l => l.trim()));
  const newLines = incoming
    .split('\n')
    .filter(line => !existingLines.has(line.trim()));

  return existing.trimEnd() + '\n\n# --- Auto-generated addition ---\n' + newLines.join('\n');
}

export function writeFile(filePath: string, content: string): void {
  fs.writeFileSync(filePath, content, 'utf8');
}

export function readFile(filePath: string): string {
  return fs.readFileSync(filePath, 'utf8');
}
