#!/usr/bin/env node
import path from 'path';
import { color, spinner } from './ui.js';
import { fetchTemplateList, fetchTemplate } from './api.js';
import { detectTemplates } from './detect.js';
import { promptTemplates, promptOutputPath, promptMergeStrategy } from './prompt.js';
import { fileExists, mergeContent, writeFile, readFile } from './writer.js';

async function main() {
  console.log(color.boldCyan('\n🔥 Interactive .gitignore Generator\n'));

  const s1 = spinner('Fetching templates from gitignore.io…');
  let allTemplates;
  try {
    allTemplates = await fetchTemplateList();
    s1.succeed(color.green(`${allTemplates.length} templates available.`));
  } catch {
    s1.fail(color.red('Could not reach gitignore.io. Check your internet connection.'));
    process.exit(1);
  }

  const suggested = detectTemplates();
  if (suggested.length > 0) {
    console.log(color.yellow(`\n✦ Detected in this directory: ${suggested.join(', ')}\n`));
  }

  const selected = await promptTemplates(allTemplates, suggested);

  const s2 = spinner(`Generating .gitignore for: ${selected.join(', ')}…`);
  let content;
  try {
    content = await fetchTemplate(selected);
    s2.succeed(color.green('Content generated successfully.'));
  } catch {
    s2.fail(color.red('Error while fetching content.'));
    process.exit(1);
  }

  const defaultPath = path.join(process.cwd(), '.gitignore');
  const outputPath  = await promptOutputPath(defaultPath);

  if (fileExists(outputPath)) {
    const strategy = await promptMergeStrategy();
    if (strategy === 'cancel') {
      console.log(color.gray('\nCancelled. No file was modified.'));
      process.exit(0);
    }
    if (strategy === 'merge') {
      content = mergeContent(readFile(outputPath), content);
    }
  }

  writeFile(outputPath, content);
  console.log(color.boldGreen(`\n✅ .gitignore written to: ${outputPath}\n`));
}

main().catch(err => {
  console.error(color.red('\nUnexpected error:'), err.message);
  process.exit(1);
});
