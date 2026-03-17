import inquirer from 'inquirer';
import chalk from 'chalk';

export async function promptTemplates(allTemplates, suggested) {
  const suggestedSet = new Set(suggested);

  // Trier : suggestions en tête, puis le reste alphabétiquement
  const sorted = [
    ...suggested.filter(t => allTemplates.includes(t)),
    ...allTemplates.filter(t => !suggestedSet.has(t)),
  ];

  const choices = sorted.map(t => ({
    name: suggestedSet.has(t) ? chalk.green(`${t} ✦ détecté`) : t,
    value: t,
    checked: suggestedSet.has(t),
  }));

  const { templates } = await inquirer.prompt([
    {
      type: 'checkbox',
      name: 'templates',
      message: 'Sélectionne les templates à inclure (espace pour cocher, entrée pour valider) :',
      choices,
      pageSize: 20,
      loop: false,
      validate(selected) {
        return selected.length > 0 || 'Sélectionne au moins un template.';
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
      message: 'Chemin du fichier de sortie :',
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
      message: 'Un .gitignore existe déjà. Que faire ?',
      choices: [
        { name: 'Fusionner (ajouter sans doublons)',  value: 'merge' },
        { name: 'Remplacer (écraser complètement)',   value: 'overwrite' },
        { name: 'Annuler',                            value: 'cancel' },
      ],
    },
  ]);
  return strategy;
}
