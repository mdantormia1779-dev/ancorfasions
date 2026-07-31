const fs = require("fs");
const path = require("path");

const projectRoot = "d:\\AF Ecommerce\\anchor-fashion";
const targetDirs = ["app", "components", "features"];

// Find all unique absolute routes linked in the codebase
const linkedRoutes = new Set();
const routeToFile = {};

function walkSync(dir, callback) {
  const files = fs.readdirSync(dir);
  files.forEach((file) => {
    var filepath = path.join(dir, file);
    const stats = fs.statSync(filepath);
    if (stats.isDirectory()) {
      if (file !== "node_modules" && file !== ".next") {
        walkSync(filepath, callback);
      }
    } else if (
      stats.isFile() &&
      (file.endsWith(".tsx") || file.endsWith(".ts"))
    ) {
      callback(filepath);
    }
  });
}

const regex = /href=(["'])(\/[^"']*)["']/g;
const routerRegex = /router\.(?:push|replace)\((["'])(\/[^"']*)["']/g;
const redirectRegex = /redirect\((["'])(\/[^"']*)["']/g;

targetDirs.forEach((d) => {
  const targetDir = path.join(projectRoot, d);
  if (fs.existsSync(targetDir)) {
    walkSync(targetDir, (filepath) => {
      const content = fs.readFileSync(filepath, "utf8");
      let match;

      const addRoute = (route) => {
        linkedRoutes.add(route);
        if (!routeToFile[route]) routeToFile[route] = [];
        routeToFile[route].push(filepath.replace(projectRoot, ""));
      };

      while ((match = regex.exec(content)) !== null) addRoute(match[2]);
      while ((match = routerRegex.exec(content)) !== null) addRoute(match[2]);
      while ((match = redirectRegex.exec(content)) !== null) addRoute(match[2]);
    });
  }
});

// Write unique routes to console
console.log("Found routes:");
Array.from(linkedRoutes)
  .sort()
  .forEach((route) => {
    console.log(`\nRoute: ${route}`);
    console.log(
      `Used in: ${[...new Set(routeToFile[route])].slice(0, 3).join(", ")}...`
    );
  });
