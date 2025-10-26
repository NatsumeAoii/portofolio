const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const exec = (command) => execSync(command, { stdio: 'inherit' });

console.log('Cleaning old build directory...');
if (fs.existsSync('dist')) {
  fs.rmSync('dist', { recursive: true, force: true });
}

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
exec(`npx html-minifier ${htmlMinifierOptions} -o dist/archive.html archive.html`);

// --- START OF JS FIX ---
console.log('Minifying JavaScript...');
// Replaced 'terser' with 'esbuild' and updated flags
exec('npx esbuild src/js/config.js --minify --format=esm --outfile=dist/src/js/config.js');
exec('npx esbuild src/js/main.js --minify --format=esm --outfile=dist/src/js/main.js');
// --- END OF JS FIX ---

console.log('Minifying CSS...');
exec('npx lightningcss --minify src/css/style.css -o dist/src/css/style.css');

console.log('Copying assets...');
fs.cpSync('assets', 'dist/assets', { recursive: true });
fs.cpSync('src/fonts', 'dist/src/fonts', { recursive: true });

console.log('Copying root files...');
const rootFiles = fs.readdirSync('.').filter((file) => file.endsWith('.ico') || file.endsWith('.png'));
rootFiles.forEach((file) => {
  fs.copyFileSync(file, path.join('dist', file));
});

console.log('Build process completed successfully!');
