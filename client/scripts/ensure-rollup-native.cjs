// Vercel/Linux fallback for npm optional Rollup native binary installation.
// Does nothing on non-Linux platforms or when the native package is already available.
const { execFileSync } = require('node:child_process');
const path = require('node:path');

if (process.platform === 'linux' && process.arch === 'x64') {
  const isGlibc = Boolean(process.report?.getReport()?.header?.glibcVersionRuntime);
  const packageName = isGlibc
    ? '@rollup/rollup-linux-x64-gnu'
    : '@rollup/rollup-linux-x64-musl';

  const rollupLocation = require.resolve('rollup/package.json');
  const rollupVersion = require(rollupLocation).version;

  try {
    require.resolve(packageName, { paths: [path.dirname(rollupLocation)] });
    console.log(`Rollup native dependency available: ${packageName}`);
  } catch (error) {
    if (error.code !== 'MODULE_NOT_FOUND') throw error;

    console.log(`Installing missing Rollup native dependency: ${packageName}@${rollupVersion}`);
    execFileSync(
      'npm',
      ['install', '--no-save', '--package-lock=false', '--include=optional', `${packageName}@${rollupVersion}`],
      { cwd: path.resolve(__dirname, '..'), stdio: 'inherit' },
    );
    require.resolve(packageName, { paths: [path.dirname(rollupLocation)] });
  }
}
