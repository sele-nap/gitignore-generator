import { color, promptInput, promptList, promptCheckbox } from './ui.js';

export async function promptTemplates(allTemplates, suggested) {
  const suggestedSet = new Set(suggested);

  const sorted = [
    ...suggested.filter(t => allTemplates.includes(t)),
    ...allTemplates.filter(t => !suggestedSet.has(t)),
  ];

  const choices = sorted.map(t => ({
    name:    suggestedSet.has(t) ? color.green(`${t} ✦ detected`) : t,
    value:   t,
    checked: suggestedSet.has(t),
  }));

  return promptCheckbox(
    'Select templates to include (space to check, enter to confirm):',
    choices,
  );
}

export async function promptOutputPath(defaultPath) {
  return promptInput('Output file path', defaultPath);
}

export async function promptMergeStrategy() {
  return promptList('A .gitignore already exists. What do you want to do?', [
    { name: 'Merge (add without duplicates)', value: 'merge' },
    { name: 'Overwrite (replace completely)', value: 'overwrite' },
    { name: 'Cancel',                         value: 'cancel' },
  ]);
}
