/* eslint-disable no-console */
import { spawn } from 'node:child_process'
import fs from 'node:fs'
import path from 'node:path'
import dotenv from 'dotenv'

dotenv.config()

const processes = []
let exiting = false

const portsFile = path.join(process.cwd(), '.worker-ports.json')
const workerDir = path.join(process.cwd(), 'worker')
const workerBin = path.join(process.cwd(), 'dist', process.platform === 'win32' ? 'worker.exe' : 'worker')
const workerCommand = fs.existsSync(workerBin) ? workerBin : null
const workerInstances = Math.max(1, Number(process.env.WORKER_INSTANCES) || 1)
const baseAddr = process.env.WORKER_HTTP_ADDR || ':8080'

const parseBase = () => {
  const match = baseAddr.match(/^(.*:)?(\d+)$/)
  if (match) {
    const [, prefix = ':', port] = match
    return { prefix, port: Number(port) }
  }
  const portMatch = baseAddr.match(/:(\d+)$/)
  if (portMatch) {
    return { prefix: baseAddr.replace(/:(\d+)$/, ':'), port: Number(portMatch[1]) }
  }
  return { prefix: ':', port: 8080 }
}

const { prefix, port: basePort } = parseBase()
const workerAddrs = []

const writePortsFile = () => {
  try {
    fs.writeFileSync(portsFile, JSON.stringify(workerAddrs, null, 2), 'utf8')
  } catch (error) {
    console.error('[start] failed to write worker ports file', error)
  }
}

const clearPortsFile = () => {
  try {
    if (fs.existsSync(portsFile)) {
      fs.unlinkSync(portsFile)
    }
  } catch (error) {
    console.error('[start] failed to remove worker ports file', error)
  }
}

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
    clearPortsFile()
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

for (let i = 0; i < workerInstances; i += 1) {
  const label = `go-worker#${i + 1}`
  const port = basePort + i
  const addr = `${prefix}${port}`
  workerAddrs.push({ url: `http://localhost:${port}`, port })

  const env = {
    ...process.env,
    WORKER_HTTP_ADDR: addr
  }

  if (workerCommand) {
    spawnProcess(label, workerCommand, [], { env })
  } else {
    spawnProcess(label, 'go', ['run', './cmd/worker'], { cwd: workerDir, env })
  }
}

writePortsFile()

spawnProcess('nuxt', 'node', ['-r', 'dotenv/config', path.join('.output', 'server', 'index.mjs')])

