import React from 'react'

import modsData from '../data/mods.json'

export interface ModListProps {
  modList: {
    vanilla: boolean
    paraMod: boolean
    pvpMod: boolean
  }
  checkMod: (mod: string) => void
}

const ModList = ({ modList, checkMod }: ModListProps): JSX.Element => {
  const getModName = (mod: string): string => {
    if (mod === 'vanilla') return 'No Mod ( vanilla )'
    return modsData[mod].name
  }
  return (
    <div>
      {Object.keys(modList).map((mod) => (
        <div key={mod} style={{ display: 'flex' }}>
          <input
            key={mod}
            type='checkbox'
            name={mod}
            onClick={(): void => checkMod(mod)}
            checked={modList[mod]}
          />
          <label key={mod}> {getModName(mod)} </label>
        </div>
      ))}
    </div>
  )
}

export default ModList
