const fs = require('fs');
const env = fs.readFileSync('.env.local', 'utf8');
const match = env.match(/GOOGLE_PRIVATE_KEY="(.+?)"/s);
if (match) {
  const key = match[1].replace(/\\n/g, '\n');
  const encoded = Buffer.from(key).toString('base64');
  console.log('\n=== COPY THIS TO VERCEL ===\n');
  console.log(encoded);
  console.log('\n===========================\n');
} else {
  console.log('Could not find GOOGLE_PRIVATE_KEY in .env.local');
}
