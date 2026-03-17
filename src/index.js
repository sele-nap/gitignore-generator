#!/usr/bin/env node
import path from 'path';
import chalk from 'chalk';
import ora from 'ora';

import { fetchTemplateList, fetchTemplate } from './api.js';
import { detectTemplates } from './detect.js';
import { promptTemplates, promptOutputPath, promptMergeStrategy } from './prompt.js';
import { fileExists, mergeContent, writeFile, readFile } from './writer.js';

async function main() {
  console.log(chalk.bold.cyan('\n🔥 Générateur de .gitignore interactif\n'));

  // 1. Récupérer la liste des templates disponibles
  const spinner = ora('Récupération des templates depuis gitignore.io…').start();
  let allTemplates;
  try {
    allTemplates = await fetchTemplateList();
    spinner.succeed(chalk.green(`${allTemplates.length} templates disponibles.`));
  } catch {
    spinner.fail(chalk.red('Impossible de contacter gitignore.io. Vérifie ta connexion.'));
    process.exit(1);
  }

  // 2. Détecter automatiquement les templates pertinents
  const suggested = detectTemplates();
  if (suggested.length > 0) {
    console.log(chalk.yellow(`\n✦ Détectés dans ce dossier : ${suggested.join(', ')}\n`));
  }

  // 3. Prompt de sélection
  const selected = await promptTemplates(allTemplates, suggested);

  // 4. Télécharger le contenu
  const fetchSpinner = ora(`Génération du .gitignore pour : ${selected.join(', ')}…`).start();
  let content;
  try {
    content = await fetchTemplate(selected);
    fetchSpinner.succeed(chalk.green('Contenu généré avec succès.'));
  } catch {
    fetchSpinner.fail(chalk.red('Erreur lors de la récupération du contenu.'));
    process.exit(1);
  }

  // 5. Chemin de sortie
  const defaultPath = path.join(process.cwd(), '.gitignore');
  const outputPath = await promptOutputPath(defaultPath);

  // 6. Fusion ou remplacement si fichier existant
  if (fileExists(outputPath)) {
    const strategy = await promptMergeStrategy();
    if (strategy === 'cancel') {
      console.log(chalk.gray('\nAnnulé. Aucun fichier modifié.'));
      process.exit(0);
    }
    if (strategy === 'merge') {
      const existing = readFile(outputPath);
      content = mergeContent(existing, content);
    }
  }

  // 7. Écriture
  writeFile(outputPath, content);
  console.log(chalk.bold.green(`\n✅ .gitignore écrit dans : ${outputPath}\n`));
}

main().catch(err => {
  console.error(chalk.red('\nErreur inattendue :'), err.message);
  process.exit(1);
});
