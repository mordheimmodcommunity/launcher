// complete bundle with dependencies for release
const fs = require('fs')
const copy = require('./utils/copy')

if (fs.existsSync('launcher')) fs.rmdirSync('launcher', { recursive: true })

if (fs.existsSync('build/win-unpacked'))
  fs.renameSync('build/win-unpacked', 'launcher')

copy('7zip', 'launcher/7zip')
copy('Mods', 'launcher/Mods')
