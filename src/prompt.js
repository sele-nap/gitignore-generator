import inquirer from 'inquirer';
import chalk from 'chalk';

export async function promptTemplates(allTemplates, suggested) {
  const suggestedSet = new Set(suggested);

  // Sort: suggestions first, then the rest alphabetically
  const sorted = [
    ...suggested.filter(t => allTemplates.includes(t)),
    ...allTemplates.filter(t => !suggestedSet.has(t)),
  ];

  const choices = sorted.map(t => ({
    name: suggestedSet.has(t) ? chalk.green(`${t} ✦ detected`) : t,
    value: t,
    checked: suggestedSet.has(t),
  }));

  const { templates } = await inquirer.prompt([
    {
      type: 'checkbox',
      name: 'templates',
      message: 'Select templates to include (space to check, enter to confirm):',
      choices,
      pageSize: 20,
      loop: false,
      validate(selected) {
        return selected.length > 0 || 'Please select at least one template.';
      },
    },
  ]);

  return templates;
}

export async function promptOutputPath(defaultPath) {
  const { outputPath } = await inquirer.prompt([
    {
      type: 'input',
      name: 'outputPath',
      message: 'Output file path:',
      default: defaultPath,
    },
  ]);
  return outputPath;
}

export async function promptMergeStrategy() {
  const { strategy } = await inquirer.prompt([
    {
      type: 'list',
      name: 'strategy',
      message: 'A .gitignore already exists. What do you want to do?',
      choices: [
        { name: 'Merge (add without duplicates)',  value: 'merge' },
        { name: 'Overwrite (replace completely)',  value: 'overwrite' },
        { name: 'Cancel',                          value: 'cancel' },
      ],
    },
  ]);
  return strategy;
}
