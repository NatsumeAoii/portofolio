const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const exec = (command) => execSync(command, { stdio: 'inherit' });

const DIRS = [
  'dist',
  'dist/src/css',
  'dist/src/fonts',
  'dist/src/js',
  'dist/assets',
];

console.log('Starting build process...');

// 1. Create directory structure
console.log('Creating output directories...');
DIRS.forEach((dir) => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});

// 2. Minify HTML
console.log('Minifying HTML...');
const htmlMinifierOptions = [
  '--collapse-whitespace',
  '--remove-comments',
  '--remove-optional-tags',
  '--remove-script-type-attributes',
  '--remove-style-link-type-attributes',
  '--minify-css true',
  '--minify-js true',
].join(' ');

exec(`npx html-minifier ${htmlMinifierOptions} -o dist/index.html index.html`);
exec(`npx html-minifier ${htmlMinifierOptions} -o dist/404.html 404.html`);
exec(`npx html-minifier ${htmlMinifierOptions} -o dist/src/html/archive.html src/html/archive.html`);

// 3. Minify JS
console.log('Minifying JavaScript...');
exec('npx terser src/js/config.js -c -m --module -o dist/src/js/config.js');
exec('npx terser src/js/main.js -c -m --module -o dist/src/js/main.js');

// 4. Minify CSS
console.log('Minifying CSS...');
exec('npx csso -i src/css/style.css -o dist/src/css/style.css');

// 5. Copy assets
console.log('Copying assets...');
fs.cpSync('assets', 'dist/assets', { recursive: true });

// 6. Copy root files (favicons, etc.)
console.log('Copying root files...');
const rootFiles = fs.readdirSync('.').filter((file) => file.endsWith('.ico') || file.endsWith('.png'));
rootFiles.forEach((file) => {
  fs.copyFileSync(file, path.join('dist', file));
});

console.log('Build process completed successfully!');
