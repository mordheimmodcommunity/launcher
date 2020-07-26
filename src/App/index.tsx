import React from 'react'
import fs from 'fs'
import { exec } from 'child_process'
import { remote } from 'electron'

import SearchMordheimFolder from './SearchMordheimFolder'
import ModList from './ModList'
import modsData from './data/mods.json'
import unzip from './helpers/unzip'

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
    install: true,
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
    this.setState({ install: false })
  }

  selectMod = (mod: string): void => {
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

  setupAllModFolder = async (): Promise<void> => {
    const { modList } = this.state

    const setupModFolderPromiseList = [
      ...Object.keys(modList).map(async (mod: string) => {
        try {
          const modDir = fs.readdirSync(this.getModFolderName(mod))
          if (modDir && modDir.length > 0) return
        } catch (e) {
          console.warn(e)
        }

        try {
          fs.mkdirSync(this.getModFolderName(mod))
        } catch (e) {
          console.warn(e)
        }

        try {
          await unzip(
            `${process.cwd()}/${modsData[mod].source}`,
            `${process.cwd()}/${this.getModFolderName(mod)}`,
          )
        } catch (e) {
          console.warn(e)
        }
      }),
    ]

    try {
      await Promise.all(setupModFolderPromiseList)
    } catch (e) {
      console.warn(e)
    }
  }

  installMod = async (): Promise<void> => {
    try {
      const { modList, mordheimDirectory, searchError } = this.state

      if (searchError || !mordheimDirectory)
        throw new Error('invalid mordheimDirectory')

      const modToInstall = Object.keys(modList).find(
        (mod: string): boolean => modList[mod],
      )

      this.resetGameFiles()
      this.copyModFiles(modToInstall)
    } catch (e) {
      console.warn(e)
    }

    this.setState({ install: false })
  }

  resetGameFiles = (): void => {
    this.copyModFiles('vanilla')
  }

  copyModFiles = (modToInstall: string | undefined): void => {
    const { mordheimDirectory } = this.state

    if (!modToInstall) throw new Error('no mod to install: should not happens!')

    try {
      fs.copyFileSync(
        `./${this.getModFolderName(modToInstall)}/Assembly-CSharp.dll`,
        `${mordheimDirectory}/mordheim_Data/Managed/Assembly-CSharp.dll`,
      )
    } catch (e) {
      console.warn(e)
    }
    try {
      fs.copyFileSync(
        `./${this.getModFolderName(modToInstall)}/UnityEngine.dll`,
        `${mordheimDirectory}/mordheim_Data/Managed/UnityEngine.dll`,
      )
    } catch (e) {
      console.warn(e)
    }
    try {
      fs.copyFileSync(
        `./${this.getModFolderName(modToInstall)}/mordheim`,
        `${mordheimDirectory}/mordheim_Data/StreamingAssets/database/mordheim`,
      )
    } catch (e) {
      console.warn(e)
    }
    try {
      fs.copyFileSync(
        `./${this.getModFolderName(modToInstall)}/resources.assets`,
        `${mordheimDirectory}/mordheim_Data/resources.assets`,
      )
    } catch (e) {
      console.warn(e)
    }
  }

  checkDirectory = async (directoryPath: string | null): Promise<void> => {
    try {
      if (!directoryPath) throw new Error('invalid directoryPath')
      const mordheimDir = fs.readdirSync(directoryPath)

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

    const mordheimDirectory =
      (getFolder && getFolder[0].replace(/\\/g, '/')) || null

    this.checkDirectory(mordheimDirectory)
  }

  render(): JSX.Element {
    const { searchDirectory, selectMod, installMod, play } = this
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
        <ModList modList={modList} selectMod={selectMod} />
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
