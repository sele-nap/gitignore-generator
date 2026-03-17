#!/usr/bin/env node
import path from 'path';
import chalk from 'chalk';
import ora from 'ora';

import { fetchTemplateList, fetchTemplate } from './api.js';
import { detectTemplates } from './detect.js';
import { promptTemplates, promptOutputPath, promptMergeStrategy } from './prompt.js';
import { fileExists, mergeContent, writeFile, readFile } from './writer.js';

async function main() {
  console.log(chalk.bold.cyan('\n🔥 Interactive .gitignore Generator\n'));

  // 1. Fetch available templates
  const spinner = ora('Fetching templates from gitignore.io…').start();
  let allTemplates;
  try {
    allTemplates = await fetchTemplateList();
    spinner.succeed(chalk.green(`${allTemplates.length} templates available.`));
  } catch {
    spinner.fail(chalk.red('Could not reach gitignore.io. Check your internet connection.'));
    process.exit(1);
  }

  // 2. Auto-detect relevant templates
  const suggested = detectTemplates();
  if (suggested.length > 0) {
    console.log(chalk.yellow(`\n✦ Detected in this directory: ${suggested.join(', ')}\n`));
  }

  // 3. Selection prompt
  const selected = await promptTemplates(allTemplates, suggested);

  // 4. Fetch content
  const fetchSpinner = ora(`Generating .gitignore for: ${selected.join(', ')}…`).start();
  let content;
  try {
    content = await fetchTemplate(selected);
    fetchSpinner.succeed(chalk.green('Content generated successfully.'));
  } catch {
    fetchSpinner.fail(chalk.red('Error while fetching content.'));
    process.exit(1);
  }

  // 5. Output path
  const defaultPath = path.join(process.cwd(), '.gitignore');
  const outputPath = await promptOutputPath(defaultPath);

  // 6. Merge or overwrite if file already exists
  if (fileExists(outputPath)) {
    const strategy = await promptMergeStrategy();
    if (strategy === 'cancel') {
      console.log(chalk.gray('\nCancelled. No file was modified.'));
      process.exit(0);
    }
    if (strategy === 'merge') {
      const existing = readFile(outputPath);
      content = mergeContent(existing, content);
    }
  }

  // 7. Write file
  writeFile(outputPath, content);
  console.log(chalk.bold.green(`\n✅ .gitignore written to: ${outputPath}\n`));
}

main().catch(err => {
  console.error(chalk.red('\nUnexpected error:'), err.message);
  process.exit(1);
});
