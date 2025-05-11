const fs = require('node:fs')
const manifest = require('./manifest.json')

async function main() {
  const { background } = manifest
  if (!background) {
    console.log('No background')
    return
  }

  const { scripts } = background
  if (!scripts) {
    console.log('No background.scripts')
    return
  }

  let code = '';

  for (const scr of scripts) {
    code += '// --------------- ' + scr + ' ------------------\r\n'
    console.log('Reading:', scr)
    const scrCode = fs.readFileSync(scr)
    code += scrCode + '\r\n'
  }

  const outFile = 'back-sw.js'
  fs.writeFileSync(outFile, code)

  console.log('Done.', outFile, 'saved.')
}

main()
