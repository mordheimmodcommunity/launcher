import React from 'react'
import fs from 'fs'
import { exec } from 'child_process'
import { remote } from 'electron'

import SearchMordheimFolder from 'screens/Mods/SearchMordheimFolder'
import ModList from 'screens/Mods/ModList'
import unzip from 'library/utils/unzip'

export interface ModsData {
  mods: {}
  files: string[]
}

const modsData: ModsData = JSON.parse(
  fs.readFileSync(`Mods/mods.json`, {
    encoding: 'utf8',
  }),
)

const defaultModList: {} = Object.keys(modsData.mods).reduce(
  (reducer, modKey) => {
    if (modKey === 'classic') return { ...reducer, [modKey]: true }
    return { ...reducer, [modKey]: false }
  },
  {},
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
    modList: defaultModList,
  }

  componentDidMount = async (): Promise<void> => {
    await this.checkDirectory(
      'C:/Program Files (x86)/Steam/SteamApps/common/mordheim',
    )
    this.setState({ install: false })
  }

  getModFolderName = (mod: string): string => {
    return modsData.mods[mod].source.split('.zip')[0]
  }

  getModZipName = (mod: string): string => {
    return modsData.mods[mod].source
  }

  selectMod = (mod: string): void => {
    const newModList = { ...defaultModList }
    newModList['classic'] = false
    newModList[mod] = true

    this.setState({
      modList: newModList,
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

      await this.resetGameFiles()
      await this.unzipMod(modToInstall)
      this.copyModFiles(modToInstall)
    } catch (e) {
      console.warn(e)
    }

    this.setState({ install: false })
  }

  resetGameFiles = async (): Promise<void> => {
    await this.unzipMod('classic')
    this.copyModFiles('classic')
  }

  unzipMod = async (mod: string): Promise<void> => {
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
        `${process.cwd()}/Mods/${this.getModZipName(mod)}`,
        `${process.cwd()}/Mods/${this.getModFolderName(mod)}`,
      )
    } catch (e) {
      console.warn(e)
    }
  }

  copyModFiles = (mod: string): void => {
    const { mordheimDirectory } = this.state

    modsData.files.forEach((filePath) => {
      const fileName = filePath.split('/').pop()
      try {
        fs.copyFileSync(
          `Mods/${this.getModFolderName(mod)}/${fileName}`,
          `${mordheimDirectory}/${filePath}`,
        )
      } catch (e) {
        console.warn(e)
      }
    })

    this.removeModFolder(mod)
  }

  removeModFolder = (mod: string): void => {
    try {
      fs.rmdirSync(this.getModFolderName(mod), { recursive: true })
    } catch (e) {
      console.warn(e)
    }
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
