import { createServer } from 'http';
import { readFileSync, existsSync } from 'fs';
import { join, extname } from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

// Auto-load .env file
const __envPath = join(dirname(fileURLToPath(import.meta.url)), '.env');
if (existsSync(__envPath)) {
  readFileSync(__envPath, 'utf8').split('\n').forEach(line => {
    const [key, ...val] = line.split('=');
    if (key && val.length && !process.env[key.trim()]) {
      process.env[key.trim()] = val.join('=').trim();
    }
  });
}

const __dirname = dirname(fileURLToPath(import.meta.url));
const PORT = 3001;

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.css':  'text/css',
  '.js':   'application/javascript',
  '.json': 'application/json',
  '.png':  'image/png',
  '.jpg':  'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.svg':  'image/svg+xml',
  '.ico':  'image/x-icon',
  '.woff2':'font/woff2',
  '.woff': 'font/woff',
  '.ttf':  'font/ttf',
};

const SYSTEM_PROMPT = `You are a knowledgeable and professional representative for Landscaper Collective, a national buying association for independent landscape companies. Keep responses concise and helpful (2-4 sentences max unless a list is genuinely needed).

ABOUT:
Landscaper Collective is a national buying association that helps independent landscape companies access national pricing from major vendors and suppliers by leveraging the combined purchasing power of members across the country.

FOUNDERS:
- Brian Lemmermann — Co-Founder, former Regional Vice President at Yellowstone Landscape (one of the top 5 largest landscape companies in the U.S.)
- Jason Lamb — Co-Founder, former CFO at United Landscape
- Combined background connects to organizations representing over $2 billion in landscape industry value

HOW IT WORKS:
1. Apply online and complete member onboarding
2. Access preferred vendor pricing through your existing accounts — no middlemen, no markups
3. Improve profitability through lower cost of goods

VENDOR PARTNERS (21+ partners):
- Mowers & Equipment: Hustler Mowers (up to 27% off), Wright Mowers, Walker Mowers, Exmark Mowers, John Deere Equipment, Bobcat
- Irrigation: SiteOne Landscape Supply, Ewing Irrigation, Horizon Irrigation, Rain Bird, Irritrol, Thrive Irrigation Controllers
- Robotics & Tech: Husqvarna Robotics, Aspire Software (landscape business management)
- Power Equipment: Caterpillar, Honda, Stihl
- Supplies: Home Depot, Fimco, Fertilizers & Nutrients, Low Voltage Lighting

KEY BENEFITS:
- National pricing access (pricing normally only available to the largest companies)
- Better margins — reduce cost of goods without changing operations
- No minimum purchase requirements
- Works through existing vendor accounts
- Founded by operators who understand the landscape industry

CONTACT & APPLICATION:
- Apply via the form on the website (scroll down to "Apply to Join the Collective")
- Email: info@landscapercollective.com

If someone wants to apply, direct them to the form on the page or to info@landscapercollective.com. Do not make up specific pricing or membership fees — those are discussed during the application process.`;

async function handleChat(req, res) {
  const chunks = [];
  for await (const chunk of req) chunks.push(chunk);
  const body = Buffer.concat(chunks).toString();

  let messages;
  try {
    ({ messages } = JSON.parse(body));
    if (!Array.isArray(messages) || messages.length === 0) throw new Error();
  } catch {
    res.writeHead(400, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'Invalid request body' }));
    return;
  }

  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    res.writeHead(500, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'OPENAI_API_KEY not set. Run: OPENAI_API_KEY=your_key node serve.mjs' }));
    return;
  }

  try {
    const openaiRes = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        max_tokens: 512,
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          ...messages.slice(-10),
        ],
      }),
    });

    const data = await openaiRes.json();

    if (!openaiRes.ok) {
      throw new Error(data.error?.message || 'OpenAI API error');
    }

    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ response: data.choices[0].message.content }));
  } catch (err) {
    res.writeHead(500, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: err.message }));
  }
}

const server = createServer(async (req, res) => {
  // CORS for local dev
  res.setHeader('Access-Control-Allow-Origin', '*');

  // Chat API endpoint
  if (req.method === 'POST' && req.url === '/api/chat') {
    await handleChat(req, res);
    return;
  }

  // Static files
  const urlPath = decodeURIComponent(req.url.split('?')[0]);
  const filePath = join(__dirname, urlPath === '/' ? 'index.html' : urlPath);

  if (!existsSync(filePath)) {
    res.writeHead(404, { 'Content-Type': 'text/plain' });
    res.end(`404 Not Found: ${urlPath}`);
    return;
  }

  const ext = extname(filePath).toLowerCase();
  const contentType = MIME[ext] || 'application/octet-stream';

  try {
    const content = readFileSync(filePath);
    res.writeHead(200, { 'Content-Type': contentType });
    res.end(content);
  } catch {
    res.writeHead(500);
    res.end('Internal server error');
  }
});

server.listen(PORT, () => {
  console.log(`\n  Landscaper Collective dev server`);
  console.log(`  Running at: http://localhost:${PORT}`);
  if (!process.env.OPENAI_API_KEY) {
    console.log(`\n  ⚠  OPENAI_API_KEY not set — chat will return an error.`);
    console.log(`  Set it with: OPENAI_API_KEY=your_key node serve.mjs\n`);
  } else {
    console.log(`  Chat AI: enabled (gpt-4o-mini)\n`);
  }
});
