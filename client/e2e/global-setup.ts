import { execSync } from 'node:child_process';
import path from 'node:path';

export default async function globalSetup(): Promise<void> {
  const repoRoot = path.resolve(__dirname, '..', '..');
  execSync('python backend/scripts/reset_test_db.py', {
    cwd: repoRoot,
    stdio: 'inherit',
    env: { ...process.env, OSOYAH_ENV: 'test' },
  });
}
