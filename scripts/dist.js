// create the zip bundle for distribution
const _7z = require('../7zip-min')
const fs = require('fs')
const appPackage = require('../package.json')

fs.mkdirSync('build/dist', { recursive: true })

if (fs.existsSync('build/dist/launcher.zip'))
  fs.rmdirSync('build/dist/launcher.zip', { recursive: true })

_7z.pack('launcher', `build/dist/launcher.zip`, (err) => {
  if (err) return console.error(err)

  // create release on github
  /* token from https://github.com/settings/applications */
  const githubToken = require('../github.api.json').token

  const grizzly = require('grizzly')

  grizzly(githubToken, {
    user: 'mordheimmodcommunity',
    repo: 'launcher',
    tag: 'v' + appPackage.version,
    name: 'Mordheim Mod Launcher v' + appPackage.version,
    body: '### How to install\nDownload `launcher.zip`\nUnzip with [7zip](https://www.7-zip.org)\nStart `launcher.exe`',
    prerelease: false /* default */,
  })
    .catch((error) => {
      console.error(error.message)
    })
    .then(() => {
  // upload zip to release on github
  const putasset = require('putasset')

  putasset(githubToken, {
    owner: 'mordheimmodcommunity',
    repo: 'launcher',
    tag: appPackage.version,
    filename: 'build/dist/launcher.zip',
  })
    .then((url) => {
      console.log(
        `Zip bundle uploaded with success, download url: https://github.com/mordheimmodcommunity/launcher/releases`,
      )
    })
    .catch((error) => {
      console.error(error.message)
    })
  // })
})
