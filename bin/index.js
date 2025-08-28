#!/usr/bin/env node
const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");

// ANSI color codes for console output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  dim: '\x1b[2m',
  cyan: '\x1b[36m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  white: '\x1b[37m',
  gray: '\x1b[90m'
};

// Helper functions for beautiful console output
function colorCommand(command, color = 'cyan') {
  return `${colors[color]}${colors.bright}${command}${colors.reset}`;
}

function success(message) {
  return `${colors.green}${colors.bright}✓${colors.reset} ${message}`;
}

function info(message) {
  return `${colors.blue}${colors.bright}ℹ${colors.reset} ${message}`;
}

function warning(message) {
  return `${colors.yellow}${colors.bright}⚠${colors.reset} ${message}`;
}

function error(message) {
  return `${colors.red}${colors.bright}✗${colors.reset} ${message}`;
}

function header(message) {
  return `${colors.magenta}${colors.bright}${message}${colors.reset}`;
}

function dim(message) {
  return `${colors.gray}${message}${colors.reset}`;
}

function box(message) {
  const visibleLength = message.replace(/\x1b\[[0-9;]*m/g, '').length;
  const line = '─'.repeat(visibleLength + 4);
  return `${colors.cyan}┌${line}┐${colors.reset}
${colors.cyan}│${colors.reset}  ${message}  ${colors.cyan}│${colors.reset}
${colors.cyan}└${line}┘${colors.reset}`;
}

function copyRecursive(src, dest) {
  if (!fs.existsSync(dest)) {
    fs.mkdirSync(dest, { recursive: true });
  }

  fs.readdirSync(src).forEach((file) => {
    const srcPath = path.join(src, file);
    const destPath = path.join(dest, file);

    if (fs.lstatSync(srcPath).isDirectory()) {
      copyRecursive(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  });
}

const projectName = process.argv[2];
if (!projectName) {
  console.log('');
  console.log(header('Create Emerald App'));
  console.log('');
  console.log(error('Please provide a project name.'));
  console.log('');
  console.log(dim('Usage:'));
  console.log(`  ${colorCommand('npx create-emerald-app <project-name>')}`);
  console.log('');
  process.exit(1);
}

const projectPath = path.join(process.cwd(), projectName);
if (fs.existsSync(projectPath)) {
  console.log('');
  console.log(error(`Directory ${colors.cyan}${projectName}${colors.reset} already exists!`));
  console.log('');
  process.exit(1);
}

const packageJson = {
  name: projectName,
  private: true,
  version: "1.0.0",
  type: "module",
  scripts: {
    dev: "vite",
    build: "vite build",
    preview: "vite preview",
    start: "vite preview --host",
  },
  devDependencies: {
    vite: "^7.0.4",
    "vite-node": "^3.2.4",
  },
  dependencies: {
    emeraldengine: "^2.0.0",
  },
};

const indexHtml = `
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <link rel="icon" type="image/svg+xml" href="/logo.svg" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>${projectName}</title>
  </head>
  <body>
    <canvas id="canvas">
      <p>Your browser doesn't support this feature</p>
    </canvas>
    <script type="module" src="/src/main.js"></script>
  </body>
</html>
`;

// Create project structure
fs.mkdirSync(projectPath);
fs.mkdirSync(path.join(projectPath, "src"));
fs.writeFileSync(path.join(projectPath, "index.html"), indexHtml);

const styleCssPath = path.join(__dirname, "../data/style.css");
fs.copyFileSync(styleCssPath, path.join(projectPath, "src/style.css"));

const mainJsPath = path.join(__dirname, "../data/main.js");
fs.copyFileSync(mainJsPath, path.join(projectPath, "src/main.js"));

fs.writeFileSync(
  path.join(projectPath, "package.json"),
  JSON.stringify(packageJson, null, 2)
);

const readmePath = path.join(__dirname, "../README.md");
fs.copyFileSync(readmePath, path.join(projectPath, "README.md"));

const publicPath = path.join(__dirname, "../data/public");
copyRecursive(publicPath, path.join(projectPath, "public"));

const assetsPath = path.join(__dirname, "../data/assets");
copyRecursive(assetsPath, path.join(projectPath, "src/assets"));

// Beautiful startup message
console.log('');
console.log(box(`Creating a new Emerald app in ${colors.green}${projectName}${colors.reset}`));
console.log('');

// Install dependencies
console.log(info('Installing packages. This might take a couple of minutes.'));
console.log('');
try {
  execSync("npm install --silent", { 
    cwd: projectPath, 
    stdio: ["ignore", "ignore", "inherit"] 
  });
  
  console.log('');
  console.log(success('Created Emerald project successfully!'));
  console.log('');
  console.log(dim('Inside that directory, you can run several commands:'));
  console.log('');
  console.log(`  ${colorCommand('npm run dev', 'cyan')}`);
  console.log(`    ${dim('Starts the development server.')}`);
  console.log('');
  console.log(`  ${colorCommand('npm run build', 'cyan')}`);
  console.log(`    ${dim('Bundles the app into static files for production.')}`);
  console.log('');
  console.log(dim('We suggest that you begin by typing:'));
  console.log('');
  console.log(`  ${colorCommand(`cd ${projectName}`, 'green')}`);
  console.log(`  ${colorCommand('npm run dev', 'green')}`);
  console.log('');
  console.log(header('Happy coding! 🚀'));
  console.log('');
  
} catch (error) {
  console.log('');
  console.log(success('Created Emerald project successfully!'));
  console.log('');
  console.log(warning('Failed to install dependencies automatically.'));
  console.log('');
  console.log(dim('Please run the following commands:'));
  console.log('');
  console.log(`  ${colorCommand(`cd ${projectName}`, 'green')}`);
  console.log(`  ${colorCommand('npm install', 'green')}`);
  console.log(`  ${colorCommand('npm run dev', 'green')}`);
  console.log('');
  console.log(header('Happy coding! 🚀'));
  console.log('');
}