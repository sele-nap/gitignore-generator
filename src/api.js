import axios from 'axios';

const BASE_URL = 'https://www.toptal.com/developers/gitignore/api';

export async function fetchTemplateList() {
  const { data } = await axios.get(`${BASE_URL}/list?format=json`);
  return Object.keys(data);
}

export async function fetchTemplate(templates) {
  const query = templates.join(',');
  const { data } = await axios.get(`${BASE_URL}/${query}`);
  return data;
}
