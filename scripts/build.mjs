import { readFile, writeFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';

const root = new URL('../', import.meta.url);
const read = path => readFile(new URL(path, root), 'utf8');
const data = JSON.parse(await read('data/site.json'));
const join = async paths => (await Promise.all(paths.map(read))).join('\n');
const css = await join(['css/variables.css', 'css/styles.css', 'css/responsive.css', 'css/animations.css']);
const js = await join(['js/script.js', 'js/navbar.js', 'js/effects.js', 'js/animations.js']);
const legalAssets = await join(['css/legal.css', 'js/legal.js']);
let html = await read('components/page.html');

for (const match of html.matchAll(/<!-- include:([\w/.-]+) -->/g)) {
    const part = await read(match[1]);
    html = html.replace(match[0], () => part);
}
const escapeHTML = value => String(value)
    .replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;').replaceAll("'", '&#39;');
html = html.replace(/\{\{(yearsExp|totalProjects)\}\}/g, (_, key) => escapeHTML(data[key]));
const version = createHash('sha256').update(css).update(js).update(html).update(legalAssets).digest('hex').slice(0, 10);
html = html.replaceAll('{{version}}', version);
const legal = (await read('terminos/index.html')).replace(
    /(\.\.\/(?:css\/portfolio\.css|css\/legal\.css|js\/legal\.js)\?v=)[\w.-]+/g,
    (_, prefix) => prefix + version
);

await Promise.all([
    writeFile(new URL('index.html', root), html),
    writeFile(new URL('css/portfolio.css', root), css),
    writeFile(new URL('js/portfolio.js', root), js),
    writeFile(new URL('terminos/index.html', root), legal)
]);
console.log('Portfolio generado: HTML completo, 1 CSS y 1 JS. Versión ' + version + '.');
