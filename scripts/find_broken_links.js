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

let fileLinks = {};

allFiles.forEach(file => {
  const content = fs.readFileSync(file, 'utf-8');
  let match;
  while ((match = linkRegex.exec(content)) !== null) {
    if (match[1].startsWith('/')) {
        if (!fileLinks[file]) fileLinks[file] = [];
        fileLinks[file].push({ type: 'href', link: match[1] });
    }
  }
  while ((match = routerPushRegex.exec(content)) !== null) {
    if (match[1].startsWith('/')) {
        if (!fileLinks[file]) fileLinks[file] = [];
        fileLinks[file].push({ type: 'push', link: match[1] });
    }
  }
  while ((match = redirectRegex.exec(content)) !== null) {
    if (match[1].startsWith('/')) {
        if (!fileLinks[file]) fileLinks[file] = [];
        fileLinks[file].push({ type: 'redirect', link: match[1] });
    }
  }
});

// Build a set of all valid routes based on app directory structure.
const validRoutes = new Set();
// Helper function to extract routes from directory structure
const extractRoutes = (dir, currentRoute = '') => {
    const list = fs.readdirSync(dir);
    
    let hasPage = false;
    list.forEach(item => {
        const fullPath = path.join(dir, item);
        const stat = fs.statSync(fullPath);
        
        if (stat.isDirectory()) {
            if (item.startsWith('(') && item.endsWith(')')) {
                // Route group, ignore the group name in the route
                extractRoutes(fullPath, currentRoute);
            } else {
                let nextRoute = currentRoute + '/' + item;
                // Handle dynamic routes [slug] -> replace with placeholder
                if (item.startsWith('[') && item.endsWith(']')) {
                     // For simplicity, we keep it as [slug] in the set
                     // We will match regex later
                }
                extractRoutes(fullPath, nextRoute);
            }
        } else if (item === 'page.tsx' || item === 'page.ts' || item === 'route.ts' || item === 'route.tsx') {
            hasPage = true;
        }
    });
    if (hasPage) {
        validRoutes.add(currentRoute === '' ? '/' : currentRoute);
    }
};

extractRoutes(appDir);

const validRouteRegexes = Array.from(validRoutes).map(route => {
    // replace dynamic segments [slug] or [...slug] with regex
    let regexStr = route.replace(/\[\.\.\.[^\]]+\]/g, '.*');
    regexStr = regexStr.replace(/\[[^\]]+\]/g, '[^/]+');
    return new RegExp('^' + regexStr + '$');
});

const isRouteValid = (route) => {
    // strip query params and hashes
    let pureRoute = route.split('?')[0].split('#')[0];
    
    // Some routes might have trailing slash, normalise
    if (pureRoute !== '/' && pureRoute.endsWith('/')) {
        pureRoute = pureRoute.slice(0, -1);
    }
    
    return validRouteRegexes.some(regex => regex.test(pureRoute));
};

let brokenLinksFound = [];

Object.keys(fileLinks).forEach(file => {
    fileLinks[file].forEach(linkInfo => {
        const route = linkInfo.link;
        if (!isRouteValid(route)) {
            brokenLinksFound.push({file, link: route, type: linkInfo.type});
        }
    });
});

console.log(JSON.stringify(brokenLinksFound, null, 2));

