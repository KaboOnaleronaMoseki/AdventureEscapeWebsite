const fs = require('node:fs');
const path = require('node:path');

const rawApiUrl = process.env.BOOKING_API_URL;
if (!rawApiUrl) {
  throw new Error('BOOKING_API_URL must be set to the deployed API origin.');
}

const apiUrl = new URL(rawApiUrl);
if (
  apiUrl.protocol !== 'https:' ||
  apiUrl.pathname !== '/' ||
  apiUrl.search ||
  apiUrl.hash
) {
  throw new Error('BOOKING_API_URL must be an HTTPS origin without a path or query.');
}

const root = process.cwd();
const output = path.join(root, 'dist');
fs.mkdirSync(output, { recursive: true });
for (const directory of ['css', 'images', 'js']) {
  fs.cpSync(path.join(root, directory), path.join(output, directory), {
    recursive: true,
  });
}

function setApiMeta(html, name, value) {
  const escapedValue = value.replace(/&/g, '&amp;').replace(/"/g, '&quot;');
  const meta = new RegExp(
    `<meta\\s+name="${name}"\\s+content="[^"]*"\\s*\\/?>`,
    'i',
  );
  return html.replace(meta, `<meta name="${name}" content="${escapedValue}" />`);
}

for (const file of fs.readdirSync(root).filter((name) => name.endsWith('.html'))) {
  let html = fs.readFileSync(path.join(root, file), 'utf8');
  if (file === 'fees.html') {
    html = setApiMeta(html, 'booking-api-url', `${apiUrl.origin}/bookings`);
  }
  if (file === 'account.html') {
    html = setApiMeta(html, 'account-api-url', apiUrl.origin);
  }
  fs.writeFileSync(path.join(output, file), html);
}
