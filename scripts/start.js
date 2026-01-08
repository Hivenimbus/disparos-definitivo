/* eslint-disable no-console */
import { spawn } from 'node:child_process'
import fs from 'node:fs'
import path from 'node:path'
import dotenv from 'dotenv'

dotenv.config()

const processes = []
let exiting = false

const workerDir = path.join(process.cwd(), 'worker')
const isWindows = process.platform === 'win32'

// Main worker (disparos)
const workerBin = path.join(process.cwd(), 'dist', isWindows ? 'worker.exe' : 'worker')
const workerCommand = fs.existsSync(workerBin) ? workerBin : null
const workerAddr = process.env.WORKER_HTTP_ADDR || ':8080'

// Maturation worker
const maturationBin = path.join(process.cwd(), 'dist', isWindows ? 'maturation-worker.exe' : 'maturation-worker')
const maturationCommand = fs.existsSync(maturationBin) ? maturationBin : null
const maturationAddr = process.env.MATURATION_WORKER_ADDR || ':8081'

const spawnProcess = (label, command, args, options = {}) => {
  const proc = spawn(command, args, {
    cwd: process.cwd(),
    env: process.env,
    shell: process.platform === 'win32',
    ...options
  })

  proc.stdout?.on('data', (data) => {
    process.stdout.write(`[${label}] ${data}`)
  })

  proc.stderr?.on('data', (data) => {
    process.stderr.write(`[${label}] ${data}`)
  })

  proc.on('exit', (code, signal) => {
    console.log(`[${label}] exited with code=${code} signal=${signal ?? 'none'}`)
    if (!exiting) {
      exiting = true
      shutdown(code ?? (signal ? 1 : 0))
    }
  })

  processes.push({ label, proc })
}

const shutdown = (code = 0) => {
  exiting = true
  processes.forEach(({ proc }) => {
    if (!proc.killed) {
      proc.kill('SIGTERM')
    }
  })

  // Give children a moment to exit gracefully
  setTimeout(() => {
    processes.forEach(({ proc }) => {
      if (!proc.killed) {
        proc.kill('SIGKILL')
      }
    })
    process.exit(code)
  }, 1000)
}

process.on('SIGINT', () => {
  console.log('Received SIGINT. Shutting down services...')
  if (!exiting) {
    shutdown(0)
  }
})

process.on('SIGTERM', () => {
  console.log('Received SIGTERM. Shutting down services...')
  if (!exiting) {
    shutdown(0)
  }
})

// Start main worker (disparos)
const workerEnv = {
  ...process.env,
  WORKER_HTTP_ADDR: workerAddr
}

if (workerCommand) {
  spawnProcess('go-worker', workerCommand, [], { env: workerEnv })
} else {
  spawnProcess('go-worker', 'go', ['run', './cmd/worker'], { cwd: workerDir, env: workerEnv })
}

// Start maturation worker
const maturationEnv = {
  ...process.env,
  MATURATION_WORKER_ADDR: maturationAddr
}

if (maturationCommand) {
  spawnProcess('maturation-worker', maturationCommand, [], { env: maturationEnv })
} else {
  spawnProcess('maturation-worker', 'go', ['run', './cmd/maturation'], { cwd: workerDir, env: maturationEnv })
}

spawnProcess('nuxt', 'node', ['-r', 'dotenv/config', path.join('.output', 'server', 'index.mjs')])
