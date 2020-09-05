import React from 'react'
import fs from 'fs'
import { exec } from 'child_process'
import { remote } from 'electron'
import { observable, action } from 'mobx'

import unzip from 'library/utils/unzip'

const modsData: { mods: {}; files: string[] } = JSON.parse(
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

class AppStore {
  @observable
  mordheimDirectory: string | null

  @observable
  searchError = false

  @observable
  install = true

  @observable
  modsData = modsData

  @observable
  modList = defaultModList

  @action
  setInstall = (bool: boolean): void => {
    this.install = bool
  }

  @action
  getModFolderName = (mod: string): string => {
    return modsData.mods[mod].source.split('.zip')[0]
  }

  @action
  getModZipName = (mod: string): string => {
    return modsData.mods[mod].source
  }

  @action
  selectMod = (mod: string): void => {
    const newModList = { ...defaultModList }
    newModList['classic'] = false
    newModList[mod] = true

    this.modList = newModList
  }

  @action
  installMod = async (): Promise<void> => {
    try {
      const { modList, mordheimDirectory, searchError } = this

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

    this.install = false
  }

  @action
  resetGameFiles = async (): Promise<void> => {
    await this.unzipMod('classic')
    this.copyModFiles('classic')
  }

  @action
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

  @action
  copyModFiles = (mod: string): void => {
    const { mordheimDirectory } = this

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

  @action
  removeModFolder = (mod: string): void => {
    try {
      fs.rmdirSync(this.getModFolderName(mod), { recursive: true })
    } catch (e) {
      console.warn(e)
    }
  }

  @action
  searchDirectory = (): void => {
    const getFolder = remote.dialog.showOpenDialogSync({
      properties: ['openDirectory'],
    })

    const mordheimDirectory =
      (getFolder && getFolder[0].replace(/\\/g, '/')) || null

    this.checkDirectory(mordheimDirectory)
  }

  @action
  checkDirectory = async (directoryPath: string | null): Promise<void> => {
    try {
      if (!directoryPath) throw new Error('invalid directoryPath')
      const mordheimDir = fs.readdirSync(directoryPath)

      if (mordheimDir.includes('mordheim_Data')) {
        this.mordheimDirectory = directoryPath
        this.searchError = false
      } else {
        this.mordheimDirectory =
          'This is not a valid mordheim installation directory!'
        this.searchError = true
      }
    } catch (e) {
      this.mordheimDirectory = 'Did not found mordheim installation directory!'
      this.searchError = true
    }
  }

  @action
  play = (): void => {
    exec('start steam://rungameid/276810', (error) => {
      if (error !== null) {
        console.warn(`exec error: ${error}`)
      }
    })
  }
}

const store = new AppStore()

export const storeContext = React.createContext(store)

export const useStore = (): AppStore => React.useContext(storeContext)
