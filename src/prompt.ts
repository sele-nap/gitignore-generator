import { color, promptCheckbox, promptInput, promptList } from './ui.js';

export async function promptTemplates(allTemplates: string[], suggested: string[]): Promise<string[]> {
  const suggestedSet = new Set(suggested);

  const sorted = [
    ...suggested.filter(t => allTemplates.includes(t)),
    ...allTemplates.filter(t => !suggestedSet.has(t)),
  ];

  const choices = sorted.map(t => ({
    checked: suggestedSet.has(t),
    name:    suggestedSet.has(t) ? color.green(`${t} ✦ detected`) : t,
    value:   t,
  }));

  return promptCheckbox(
    'Select templates to include (space to check, enter to confirm):',
    choices,
  );
}

export async function promptOutputPath(defaultPath: string): Promise<string> {
  return promptInput('Output file path', defaultPath);
}

export type MergeStrategy = 'cancel' | 'merge' | 'overwrite';

export async function promptMergeStrategy(): Promise<MergeStrategy> {
  const result = await promptList('A .gitignore already exists. What do you want to do?', [
    { name: 'Merge (add without duplicates)', value: 'merge' },
    { name: 'Overwrite (replace completely)', value: 'overwrite' },
    { name: 'Cancel',                         value: 'cancel' },
  ]);
  return result as MergeStrategy;
}
