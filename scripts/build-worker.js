/* eslint-disable no-console */
import { spawnSync } from 'node:child_process'
import fs from 'node:fs'
import path from 'node:path'

const projectRoot = process.cwd()
const distDir = path.join(projectRoot, 'dist')
fs.mkdirSync(distDir, { recursive: true })

const outputName = process.platform === 'win32' ? 'worker.exe' : 'worker'
const outputPath = path.join(distDir, outputName)

console.log(`[worker:build] Building Go worker -> ${outputPath}`)

const build = spawnSync('go', ['build', '-o', outputPath, './cmd/worker'], {
  cwd: path.join(projectRoot, 'worker'),
  stdio: 'inherit',
  shell: process.platform === 'win32'
})

if (build.status !== 0) {
  console.error('[worker:build] Build failed')
  process.exit(build.status ?? 1)
}

console.log('[worker:build] Build completed successfully')

