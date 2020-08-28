import React from 'react'
import fs from 'fs'
import { exec } from 'child_process'
import { remote } from 'electron'

import SearchMordheimFolder from './SearchMordheimFolder'
import ModList from './ModList'
import unzip from './helpers/unzip'

export interface ModsData {
  mods: {}
  files: string[]
}

const modsData: ModsData = JSON.parse(
  fs.readFileSync(`${process.cwd()}/mods.json`, {
    encoding: 'utf8',
  }),
)

export interface AppProps {}

export interface AppState {
  mordheimDirectory: string | null
  searchError: boolean
  install: boolean
  modList: {}
}

class App extends React.Component<AppProps, AppState> {
  state = {
    mordheimDirectory: null,
    searchError: false,
    install: true,
    modList: Object.keys(modsData.mods).reduce((reducer, modKey) => {
      if (modKey === 'vanilla') return { ...reducer, [modKey]: true }
      return { ...reducer, [modKey]: false }
    }, {}),
  }

  componentDidMount = async (): Promise<void> => {
    await this.checkDirectory(
      'C:/Program Files (x86)/Steam/SteamApps/common/mordheim',
    )
    await this.setupAllModFolder()
    this.setState({ install: false })
  }

  getModFolderName = (mod: string): string => {
    return modsData.mods[mod].source.split('.zip')[0]
  }

  getModZipName = (mod: string): string => {
    return modsData.mods[mod].source
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
          fs.rmdirSync(this.getModFolderName(mod), { recursive: true })
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
            `${process.cwd()}/${this.getModZipName(mod)}`,
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

    modsData.files.forEach((filePath) => {
      const fileName = filePath.split('/').pop()
      try {
        fs.copyFileSync(
          `${process.cwd()}/${this.getModFolderName(modToInstall)}/${fileName}`,
          `${mordheimDirectory}/${filePath}`,
        )
      } catch (e) {
        console.warn(e)
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
        <ModList modList={modList} selectMod={selectMod} modsData={modsData} />
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
