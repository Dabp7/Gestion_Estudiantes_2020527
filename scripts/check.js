import { readdir } from 'node:fs/promises'
import { spawnSync } from 'node:child_process'
async function scan(directory) {
    for (const entry of await readdir(directory, { withFileTypes: true })) {
        const file = `${directory}/${entry.name}`
        if (entry.isDirectory()) await scan(file)
        else if (entry.name.endsWith('.js')) {
            const result = spawnSync(process.execPath, ['--check', file], { stdio: 'inherit' })
            if (result.status) process.exit(result.status)
        }
    }
}
await scan('src'); await scan('configs'); await scan('scripts')
console.log('Sintaxis de src, configs y scripts verificada')
