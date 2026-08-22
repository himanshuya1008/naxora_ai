const modules = [
  ['node:http', 'node:http'],
  ['express', 'express'],
  ['socket.io', 'socket.io'],
  ['helmet', 'helmet'],
  ['cors', 'cors'],
  ['compression', 'compression'],
  ['cookie-parser', 'cookie-parser'],
  ['pino-http', 'pino-http'],
  ['config/env.js', './src/config/env.js'],
  ['utils/logger.js', './src/utils/logger.js'],
  ['config/db.js', './src/config/db.js'],
  ['config/openai.js', './src/config/openai.js'],
  ['config/deepgram.js', './src/config/deepgram.js'],
  ['config/elevenlabs.js', './src/config/elevenlabs.js'],
  ['sockets/index.js', './src/sockets/index.js'],
  ['jobs/staleConversationSweeper.js', './src/jobs/staleConversationSweeper.js'],
  ['routes/index.js', './src/routes/index.js'],
  ['app.js', './src/app.js'],
];

for (const [label, path] of modules) {
  const start = Date.now();
  process.stdout.write(`START ${label}\n`);
  try {
    await import(path);
    process.stdout.write(`OK    ${label} (${Date.now() - start}ms)\n`);
  } catch (err) {
    process.stdout.write(`FAIL  ${label} (${Date.now() - start}ms): ${err.message}\n`);
  }
}
process.stdout.write('ALL DONE\n');
process.exit(0);
