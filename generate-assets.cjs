const fs = require('fs');

function toB64(p, mime) {
  const data = fs.readFileSync(p).toString('base64');
  return 'data:' + mime + ';base64,' + data;
}

const out = [
  "export const MESSI_WP = '" + toB64('./messi.jpg', 'image/jpeg') + "';",
  "export const CURRENT_LOGO = '" + toB64('./current.png', 'image/png') + "';",
  "export const SPACEJUMP_LOGO = '" + toB64('./spacejump.png', 'image/png') + "';",
  "export const TICKING_LOGO = '" + toB64('./ticking.png', 'image/png') + "';",
  "export const EVENTIFY_LOGO = '" + toB64('./eventify.png', 'image/png') + "';",
  "export const RESUME_PDF = '" + toB64('./resume.pdf', 'application/pdf') + "';",
].join('\n');

fs.writeFileSync('./client/src/components/assets.ts', out);
console.log('assets.ts created successfully!');
