import fs from 'fs/promises';

export default async base64Str => {
  const buffer = Buffer.from(base64Str, "base64");
  const date = new Date();
  await fs.writeFile(`./static/avatar/${date.getTime()}.png`, buffer);
  return `${date.getTime()}.png`;
}