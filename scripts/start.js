/* eslint-disable no-console */
import { spawn } from 'node:child_process'
import fs from 'node:fs'
import path from 'node:path'
import dotenv from 'dotenv'

dotenv.config()

const processes = []
let exiting = false

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

const workerDir = path.join(process.cwd(), 'worker')
const workerBin = path.join(process.cwd(), 'dist', process.platform === 'win32' ? 'worker.exe' : 'worker')
const workerCommand = fs.existsSync(workerBin) ? workerBin : null
const workerInstances = Math.max(1, Number(process.env.WORKER_INSTANCES) || 1)

for (let i = 1; i <= workerInstances; i += 1) {
  const label = `go-worker#${i}`
  if (workerCommand) {
    spawnProcess(label, workerCommand, [])
  } else {
    spawnProcess(label, 'go', ['run', './cmd/worker'], { cwd: workerDir })
  }
}
spawnProcess('nuxt', 'node', ['-r', 'dotenv/config', path.join('.output', 'server', 'index.mjs')])

