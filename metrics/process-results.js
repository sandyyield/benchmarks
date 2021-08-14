const fs = require('fs')
const path = require('path')
const os = require('os')

function readableHRTimeMs (diff) {
  return (diff[0] * 1e9 + diff[1]) / 1000000
}

function updateReadme (startupResults) {
  const machineInfo = `${os.platform()} ${os.arch()} | ${os.cpus().length} vCPUs | ${(os.totalmem() / (1024 ** 3)).toFixed(1)}GB Mem`
  const benchmarkMd = `# Metrics
* __Machine:__ ${machineInfo}
* __Node:__ \`${process.version}\`
* __Run:__ ${new Date()}
* __Method:__ \`npm run metrics\` (samples: 5)
${startupResults}
`
  const md = fs.readFileSync('README.md', 'utf8')
  fs.writeFileSync('README.md', md.split('# Metrics')[0] + benchmarkMd, 'utf8')
}

const results = fs.readdirSync(__dirname).filter((x) => x.endsWith('.txt'))

let md = `
| | startup | listen |
|-| -       | -      |`

for (const r of results) {
  const data = fs.readFileSync(path.join(__dirname, r), { encoding: 'utf-8' })
  const lines = data.split('\n').filter(Boolean)
  const temp = {
    startup: 0,
    listen: 0
  }
  lines.forEach((x) => {
    const [startup, listen] = x.split('|')
    temp.startup += readableHRTimeMs(startup.split(',').map(x => parseInt(x)))
    temp.listen += readableHRTimeMs(listen.split(',').map(x => parseInt(x)))
  })
  md += `\n| ${r.replace('.txt', '')} | ${temp.startup / lines.length} | ${temp.listen / lines.length} |`
}

if (process.argv.length >= 3 && process.argv[2] === '-u') {
  console.debug('Updating README...')
  updateReadme(md)
}
console.log(md)
