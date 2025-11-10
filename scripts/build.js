const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const ROOT_DIR = path.resolve(__dirname, '..');
const DIST_DIR = path.join(ROOT_DIR, 'dist');

const exec = (command, options = {}) => {
  try {
    execSync(command, { stdio: 'inherit', ...options });
  } catch (error) {
    console.error(`Error executing command: ${command}`);
    process.exit(1);
  }
};

const main = () => {
  console.log('Starting build process...');

  console.log('Cleaning old build directory...');
  if (fs.existsSync(DIST_DIR)) {
    fs.rmSync(DIST_DIR, { recursive: true, force: true });
  }

  console.log('Creating output directories...');
  const dirsToCreate = [
    'src/css',
    'src/fonts',
    'src/js',
    'assets',
  ].map((dir) => path.join(DIST_DIR, dir));

  dirsToCreate.forEach((dir) => fs.mkdirSync(dir, { recursive: true }));

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

  const htmlFiles = ['index.html', '404.html', 'archive.html'];
  htmlFiles.forEach((file) => {
    const inputFile = path.join(ROOT_DIR, file);
    const outputFile = path.join(DIST_DIR, file);
    exec(`npx html-minifier-terser ${htmlMinifierOptions} -o ${outputFile} ${inputFile}`);
  });

  console.log('Bundling and minifying JavaScript...');
  exec('npx esbuild src/js/main.js --bundle --minify --format=esm --outfile=dist/src/js/main.js');

  console.log('Minifying CSS...');
  exec('npx lightningcss --minify src/css/style.css -o dist/src/css/style.css');

  console.log('Copying assets...');
  fs.cpSync(path.join(ROOT_DIR, 'assets'), path.join(DIST_DIR, 'assets'), { recursive: true });
  fs.cpSync(path.join(ROOT_DIR, 'src/fonts'), path.join(DIST_DIR, 'src/fonts'), { recursive: true });

  console.log('Copying root files...');
  const rootFiles = ['favicon.ico', 'apple-touch-icon.png'];
  rootFiles.forEach((file) => {
    const source = path.join(ROOT_DIR, file);
    if (fs.existsSync(source)) {
      fs.copyFileSync(source, path.join(DIST_DIR, file));
    }
  });

  console.log('Build process completed successfully!');
};

main();
