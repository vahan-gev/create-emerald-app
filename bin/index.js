#!/usr/bin/env node
const fs = require("fs");
const path = require("path");

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
    console.error("❌ Please provide a project name.");
    process.exit(1);
}

const projectPath = path.join(process.cwd(), projectName);
if (fs.existsSync(projectPath)) {
    console.error("❌ Folder already exists!");
    process.exit(1);
}

const packageJson = {
    name: projectName,
    private: true,
    version: "1.0.0",
    type: "module",
    scripts: {
      "dev": "vite",
      "build": "vite build",
      "preview": "vite preview",
      "start": "vite preview --host"
    },
    devDependencies: {
      "vite": "^7.0.4",
      "vite-node": "^3.2.4"
    },
    dependencies: {
      "gl-matrix": "^3.4.3",
      "planck": "^1.4.2"
    }
}

const indexHtml = `
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <link rel="icon" type="image/svg+xml" href="/vite.svg" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <link rel="stylesheet" href="/src/style.css" />
    <title>${projectName}</title>
  </head>
  <body>
    <canvas id="canvas">
      <p>Your browser doesn't support this feature</p>
    </canvas>
    <script type="module" src="/src/main.js"></script>
  </body>
</html>
`

const mainJs = `
import { Emerald } from "./emerald/Emerald";
import { Scene } from "./emerald/Scene";
import SceneManager from "./emerald/managers/SceneManager";
import { FPSCounter } from "./emerald/FPSCounter.js";
window.onload = () => {
    const canvas = document.getElementById("canvas");
    if(!canvas) return;

    const getCanvasDimensions = () => ({
        width: window.innerWidth,
        height: window.innerHeight,
    });

    const { width: initialWidth, height: initialHeight } = getCanvasDimensions();
    canvas.width = initialWidth;
    canvas.height = initialHeight;
    
    const emerald = new Emerald(canvas);
    const fpsCounter = new FPSCounter();
    const scene = new Scene();
    SceneManager.setScene(scene);

    let lastTime = 0;

    const handleResize = () => {
        const { width, height } = getCanvasDimensions();
        emerald.resize(width, height);
    }
    window.addEventListener("resize", handleResize);

    const animate = (currentTime) => {
        const deltaTime = (currentTime - lastTime) / 1000;
        lastTime = currentTime;
        fpsCounter.update();
        emerald.drawScene(scene, deltaTime);
        requestAnimationFrame(animate);
    }
    animate(0);

    window.addEventListener("beforeunload", () => {
        window.removeEventListener("resize", handleResize);
    });
}
`;

const styleCss = `
body,
html {
  margin: 0;
  padding: 0;
  overflow: hidden;
  width: 100%;
  height: 100%;
}

body {
  margin: 0;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", "Roboto", "Oxygen",
    "Ubuntu", "Cantarell", "Fira Sans", "Droid Sans", "Helvetica Neue",
    sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

canvas {
  display: block;
  width: 100%;
  height: 100%;
}

code {
  font-family: source-code-pro, Menlo, Monaco, Consolas, "Courier New",
    monospace;
}
`

// Create project structure
fs.mkdirSync(projectPath);
fs.mkdirSync(path.join(projectPath, "src"));
fs.writeFileSync(
    path.join(projectPath, "index.html"),
    indexHtml
);
fs.writeFileSync(
    path.join(projectPath, "src/style.css"),
    styleCss
);
fs.writeFileSync(
    path.join(projectPath, "src/main.js"),
    mainJs
);
fs.writeFileSync(
    path.join(projectPath, "package.json"),
    JSON.stringify(packageJson, null, 2)
);

const readmePath = path.join(__dirname, "../README.md");
fs.copyFileSync(readmePath, path.join(projectPath, "README.md"));

const emeraldPath = path.join(__dirname, "../emerald");
copyRecursive(emeraldPath, path.join(projectPath, "src/emerald"));

const publicPath = path.join(__dirname, "../public");
copyRecursive(publicPath, path.join(projectPath, "public"));

console.log(`✅ Project ${projectName} created successfully!`);
