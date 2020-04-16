import React from 'react'
import { promises as fs } from 'fs'
import { exec } from 'child_process'
import { remote } from 'electron'
import extractZip from 'extract-zip'

import SearchMordheimFolder from './SearchMordheimFolder'
import ModList from './ModList'
import modsData from './data/mods.json'

export interface AppProps {}

export interface AppState {
  mordheimDirectory: string | null
  searchError: boolean
  install: boolean
  modList: {
    vanilla: boolean
    paraMod: boolean
    pvpMod: boolean
  }
}

class App extends React.Component<AppProps, AppState> {
  state = {
    mordheimDirectory: null,
    searchError: false,
    install: false,
    modList: {
      vanilla: true,
      paraMod: false,
      pvpMod: false,
    },
  }

  getModFolderName = (mod: string): string => {
    return {
      vanilla: 'Vanilla',
      paraMod: 'ParaMod',
      pvpMod: 'PvPMod',
    }[mod]
  }

  componentDidMount = async (): Promise<void> => {
    await this.checkDirectory(
      'C:/Program Files (x86)/Steam/SteamApps/common/mordheim',
    )
    await this.setupAllModFolder()
  }

  checkMod = (mod: string): void => {
    const newModList = {
      vanilla: false,
      paraMod: false,
      pvpMod: false,
    }

    newModList[mod] = true

    this.setState({
      modList: newModList,
    })
  }

  backupVanillaFiles = async (): Promise<void> => {
    const { mordheimDirectory, searchError } = this.state

    if (searchError || !mordheimDirectory) return

    try {
      await fs.mkdir(this.getModFolderName('vanilla'))
    } catch (e) {
      console.warn(e)
    }

    try {
      await fs.copyFile(
        `${mordheimDirectory}/mordheim_Data/Managed/Assembly-CSharp.dll`,
        `./${this.getModFolderName('vanilla')}/Assembly-CSharp.dll`,
      )
      await fs.copyFile(
        `${mordheimDirectory}/mordheim_Data/Managed/UnityEngine.dll`,
        `./${this.getModFolderName('vanilla')}/UnityEngine.dll`,
      )
      await fs.copyFile(
        `${mordheimDirectory}/mordheim_Data/StreamingAssets/database/mordheim`,
        `./${this.getModFolderName('vanilla')}/mordheim`,
      )
      await fs.copyFile(
        `${mordheimDirectory}/mordheim_Data/resources.assets`,
        `./${this.getModFolderName('vanilla')}/resources.assets`,
      )
    } catch (e) {
      console.warn(e)
    }
  }

  setupAllModFolder = async (): Promise<void> => {
    const { modList } = this.state

    Object.keys(modList).forEach(async (mod: string) => {
      try {
        const modDir = await fs.readdir(this.getModFolderName(mod))
        if (modDir && modDir.length > 0) return
      } catch {}

      try {
        await fs.mkdir(this.getModFolderName(mod))
      } catch {}

      try {
        await extractZip(`${process.cwd()}/${modsData[mod].source}`, {
          dir: `${process.cwd()}/${this.getModFolderName(mod)}`,
        })
      } catch {}
    })
  }

  installMod = async (): Promise<void> => {
    try {
      const { modList, mordheimDirectory, searchError } = this.state

      if (searchError || !mordheimDirectory)
        throw new Error('invalid mordheimDirectory')

      const modToInstall = Object.keys(modList).find(
        (mod: string): boolean => modList[mod],
      )

      if (!modToInstall)
        throw new Error('no mod to install: should not happens!')

      await fs.copyFile(
        `./${this.getModFolderName(modToInstall)}/Assembly-CSharp.dll`,
        `${mordheimDirectory}/mordheim_Data/Managed/Assembly-CSharp.dll`,
      )

      await fs.copyFile(
        `./${this.getModFolderName(modToInstall)}/UnityEngine.dll`,
        `${mordheimDirectory}/mordheim_Data/Managed/UnityEngine.dll`,
      )

      await fs.copyFile(
        `./${this.getModFolderName(modToInstall)}/mordheim`,
        `${mordheimDirectory}/mordheim_Data/StreamingAssets/database/mordheim`,
      )

      await fs.copyFile(
        `./${this.getModFolderName(modToInstall)}/resources.assets`,
        `${mordheimDirectory}/mordheim_Data/resources.assets`,
      )

      this.setState({ install: false })
    } catch (e) {
      this.setState({ install: false })
      console.warn(e)
    }
  }

  checkDirectory = async (directoryPath): Promise<void> => {
    try {
      if (!directoryPath) throw new Error('invalid directoryPath')
      const mordheimDir = await fs.readdir(directoryPath)

      if (mordheimDir.includes('mordheim_Data'))
        this.setState({
          mordheimDirectory: directoryPath,
          searchError: false,
        })
      else
        this.setState({
          mordheimDirectory:
            'This is not a valid mordheim installation directory!',
          searchError: true,
        })
    } catch (e) {
      this.setState({
        mordheimDirectory: 'Did not found mordheim installation directory!',
        searchError: true,
      })
    }
  }

  play = (): void => {
    exec('start steam://rungameid/276810', (error) => {
      if (error !== null) {
        console.warn(`exec error: ${error}`)
      }
    })
  }

  searchDirectory = (): void => {
    const getFolder = remote.dialog.showOpenDialogSync({
      properties: ['openDirectory'],
    })

    const mordheimDirectory = getFolder && getFolder[0].replace(/\\/g, '/')

    this.checkDirectory(mordheimDirectory)
  }

  render(): JSX.Element {
    const { searchDirectory, checkMod, installMod, play } = this
    const { mordheimDirectory, searchError, modList, install } = this.state
    const disabled = searchError || !mordheimDirectory || install
    return (
      <div
        style={{
          display: 'flex',
          flex: 1,
          flexDirection: 'column',
          justifyContent: 'space-evenly',
          alignItems: 'center',
          height: '100%',
          width: '100%',
        }}
      >
        <SearchMordheimFolder
          searchDirectory={searchDirectory}
          mordheimDirectory={mordheimDirectory}
          searchError={searchError}
        />
        <ModList modList={modList} checkMod={checkMod} />
        <button
          onClick={(): void => this.setState({ install: true }, installMod)}
          disabled={disabled}
          style={{
            backgroundColor: disabled ? undefined : 'green',
            borderColor: disabled ? undefined : 'green',
            color: disabled ? undefined : 'white',
          }}
        >
          Install Mod
        </button>
        <button
          onClick={play}
          disabled={disabled}
          style={{
            backgroundColor: disabled ? undefined : 'green',
            borderColor: disabled ? undefined : 'green',
            color: disabled ? undefined : 'white',
          }}
        >
          Play
        </button>
      </div>
    )
  }
}

export default App
