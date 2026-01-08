/* eslint-disable no-console */
import { spawnSync } from 'node:child_process'
import fs from 'node:fs'
import path from 'node:path'

const projectRoot = process.cwd()
const distDir = path.join(projectRoot, 'dist')
fs.mkdirSync(distDir, { recursive: true })

const isWindows = process.platform === 'win32'

// Build main worker (disparos)
const workerOutput = path.join(distDir, isWindows ? 'worker.exe' : 'worker')
console.log(`[worker:build] Building Go worker -> ${workerOutput}`)

const workerBuild = spawnSync('go', ['build', '-o', workerOutput, './cmd/worker'], {
  cwd: path.join(projectRoot, 'worker'),
  stdio: 'inherit',
  shell: isWindows
})

if (workerBuild.status !== 0) {
  console.error('[worker:build] Worker build failed')
  process.exit(workerBuild.status ?? 1)
}

console.log('[worker:build] Worker build completed successfully')

// Build maturation worker
const maturationOutput = path.join(distDir, isWindows ? 'maturation-worker.exe' : 'maturation-worker')
console.log(`[worker:build] Building Go maturation worker -> ${maturationOutput}`)

const maturationBuild = spawnSync('go', ['build', '-o', maturationOutput, './cmd/maturation'], {
  cwd: path.join(projectRoot, 'worker'),
  stdio: 'inherit',
  shell: isWindows
})

if (maturationBuild.status !== 0) {
  console.error('[worker:build] Maturation worker build failed')
  process.exit(maturationBuild.status ?? 1)
}

console.log('[worker:build] Maturation worker build completed successfully')
console.log('[worker:build] All builds completed!')

