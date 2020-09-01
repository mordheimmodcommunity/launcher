// create the zip bundle for distribution
const _7z = require('../7zip-min')
const fs = require('fs')

fs.mkdirSync('build/dist', { recursive: true })

_7z.pack('build/launcher', 'build/dist/launcher.zip', (err) => {
  if (err) console.error(err)
})

// create release on github
const appPackage = require('../package.json')

/* token from https://github.com/settings/applications */
const githubToken = require('../github.api.json').token

const grizzly = require('grizzly')

grizzly(githubToken, {
  user: 'mordheimmodcommunity',
  repo: 'launcher',
  tag: appPackage.version,
  name: 'Mordheim Mod Launcher v' + appPackage.version,
  body: '',
  prerelease: false /* default */,
}).catch((error) => {
  console.error(error.message)
})

// upload zip to release on github
const putasset = require('putasset')

putasset(githubToken, {
  owner: 'mordheimmodcommunity',
  repo: 'launcher',
  tag: appPackage.version,
  filename: 'build/dist/launcher.zip',
})
  .then((url) => {
    console.log(`Zip bundle uploaded with success, download url: ${url}`)
  })
  .catch((error) => {
    console.error(error.message)
  })
