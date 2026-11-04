const fs = require('node:fs');
const path = require('node:path');

const root = process.cwd();
const output = path.join(root, 'dist');
fs.mkdirSync(output, { recursive: true });

for (const directory of ['css', 'images', 'js']) {
  const dirPath = path.join(root, directory);
  if (fs.existsSync(dirPath)) {
    fs.cpSync(dirPath, path.join(output, directory), { recursive: true });
  }
}

function setApiMeta(html, name, value) {
  const escapedValue = value.replace(/&/g, '&amp;').replace(/"/g, '&quot;');
  const meta = new RegExp(
    `<meta\\s+name="${name}"\\s+content="[^"]*"\\s*\\/?>`,
    'i',
  );
  return html.replace(meta, `<meta name="${name}" content="${escapedValue}" />`);
}

const rawApiUrl = process.env.BOOKING_API_URL;
let apiUrl = null;
if (rawApiUrl) {
  try {
    apiUrl = new URL(rawApiUrl);
  } catch (err) {
    console.warn('Invalid BOOKING_API_URL provided, skipping meta substitution:', err);
  }
}

for (const file of fs.readdirSync(root).filter((name) => name.endsWith('.html'))) {
  let html = fs.readFileSync(path.join(root, file), 'utf8');
  if (apiUrl) {
    if (file === 'fees.html') {
      html = setApiMeta(html, 'booking-api-url', `${apiUrl.origin}/bookings`);
    }
    if (file === 'account.html') {
      html = setApiMeta(html, 'account-api-url', apiUrl.origin);
    }
  }
  fs.writeFileSync(path.join(output, file), html);
}
console.log('Build completed successfully.');
