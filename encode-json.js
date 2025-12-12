const fs = require('fs');
const env = fs.readFileSync('.env.local', 'utf8');
const match = env.match(/GOOGLE_PRIVATE_KEY="(.+?)"/s);
if (match) {
  const key = match[1].replace(/\\n/g, '\n');
  const creds = {
    type: "service_account",
    project_id: "nfsu-projects-system",
    private_key: key,
    client_email: "nfsu-sheets-access@nfsu-projects-system.iam.gserviceaccount.com"
  };
  const encoded = Buffer.from(JSON.stringify(creds)).toString('base64');
  console.log('\n=== COPY THIS TO VERCEL as GOOGLE_CREDENTIALS ===\n');
  console.log(encoded);
  console.log('\n===========================\n');
}
