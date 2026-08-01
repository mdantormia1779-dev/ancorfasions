const fs = require('fs');
const path = require('path');

const appDir = path.join(process.cwd(), 'app');
const componentsDir = path.join(process.cwd(), 'components');

const getFiles = (dir) => {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach(file => {
    file = path.join(dir, file);
    const stat = fs.statSync(file);
    if (stat && stat.isDirectory()) {
      results = results.concat(getFiles(file));
    } else {
      if (file.endsWith('.tsx') || file.endsWith('.ts')) {
        results.push(file);
      }
    }
  });
  return results;
};

const appFiles = getFiles(appDir);
const componentsFiles = getFiles(componentsDir);
const allFiles = [...appFiles, ...componentsFiles];

const linkRegex = /href=["']([^"']+)["']/g;
const routerPushRegex = /router\.push\(["']([^"']+)["']\)/g;
const redirectRegex = /redirect\(["']([^"']+)["']\)/g;

let links = new Set();
let fileLinks = {};

allFiles.forEach(file => {
  const content = fs.readFileSync(file, 'utf-8');
  let match;
  while ((match = linkRegex.exec(content)) !== null) {
    if (match[1].startsWith('/')) links.add(match[1]);
    if (!fileLinks[file]) fileLinks[file] = [];
    fileLinks[file].push({ type: 'href', link: match[1] });
  }
  while ((match = routerPushRegex.exec(content)) !== null) {
    if (match[1].startsWith('/')) links.add(match[1]);
    if (!fileLinks[file]) fileLinks[file] = [];
    fileLinks[file].push({ type: 'push', link: match[1] });
  }
  while ((match = redirectRegex.exec(content)) !== null) {
    if (match[1].startsWith('/')) links.add(match[1]);
    if (!fileLinks[file]) fileLinks[file] = [];
    fileLinks[file].push({ type: 'redirect', link: match[1] });
  }
});

console.log('Total unique absolute links found:', links.size);
console.log(Array.from(links).join('\n'));
