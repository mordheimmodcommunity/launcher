// complete bundle with dependencies for release
const fs = require('fs')
const copy = require('./utils/copy')

if (fs.existsSync('build/win-unpacked'))
  fs.renameSync('build/win-unpacked', 'build/launcher')

copy('7zip', 'build/launcher/7zip')
copy('Mods', 'build/launcher/Mods')
