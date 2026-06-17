const fs   = require('fs');
const path = require('path');

function copyDir(src, dest) {
  if (!fs.existsSync(src)) return;
  fs.mkdirSync(dest, { recursive: true });
  fs.readdirSync(src).forEach(function (file) {
    var s = path.join(src, file);
    var d = path.join(dest, file);
    fs.statSync(s).isDirectory() ? copyDir(s, d) : fs.copyFileSync(s, d);
  });
}

var nav    = fs.readFileSync('partials/nav.html', 'utf8');
var footer = fs.readFileSync('partials/footer.html', 'utf8');
var pages  = ['index', 'about', 'catalog', 'calculator', 'contact'];

if (!fs.existsSync('dist')) fs.mkdirSync('dist');

pages.forEach(function (page) {
  var html = fs.readFileSync(page + '.html', 'utf8');
  html = html.replace('<!--NAV-->', nav).replace('<!--FOOTER-->', footer);
  fs.writeFileSync('dist/' + page + '.html', html);
  console.log('built  → dist/' + page + '.html');
});

copyDir('assets', 'dist/assets');
copyDir('js',     'dist/js');
copyDir('data',   'dist/data');
console.log('copied → assets/ js/ data/');
