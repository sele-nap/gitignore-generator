const BASE_URL = 'https://www.toptal.com/developers/gitignore/api';

export async function fetchTemplateList() {
  const res  = await fetch(`${BASE_URL}/list?format=json`);
  const data = await res.json();
  return Object.keys(data);
}

export async function fetchTemplate(templates) {
  const res = await fetch(`${BASE_URL}/${templates.join(',')}`);
  return res.text();
}
