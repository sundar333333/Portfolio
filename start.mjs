import { spawn } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

function startServer() {
  console.log('[start] Launching dev server...');
  
  const child = spawn('npx', ['tsx', 'server/index.ts'], {
    env: { 
      ...process.env, 
      NODE_ENV: 'development',
      NODE_OPTIONS: '--max-old-space-size=1536'
    },
    stdio: 'inherit',
    cwd: __dirname,
    shell: true
  });

  child.on('exit', (code, signal) => {
    console.error(`[start] Server exited (code=${code} signal=${signal}), restarting...`);
    setTimeout(startServer, 2000);
  });
}

startServer();
