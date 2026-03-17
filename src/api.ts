const BASE_URL = 'https://www.toptal.com/developers/gitignore/api';

export async function fetchTemplateList(): Promise<string[]> {
  const res  = await fetch(`${BASE_URL}/list?format=json`);
  const data = await res.json() as Record<string, unknown>;
  return Object.keys(data);
}

export async function fetchTemplate(templates: string[]): Promise<string> {
  const res = await fetch(`${BASE_URL}/${templates.join(',')}`);
  return res.text();
}
