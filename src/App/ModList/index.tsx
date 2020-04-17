import React from 'react'

import modsData from '../data/mods.json'

export interface ModListProps {
  modList: {
    vanilla: boolean
    paraMod: boolean
    pvpMod: boolean
  }
  selectMod: (mod: string) => void
}

const ModList = ({ modList, selectMod }: ModListProps): JSX.Element => {
  const getModName = (mod: string): string => {
    if (mod === 'vanilla') return 'No Mod ( vanilla )'
    return modsData[mod].name
  }
  return (
    <div>
      {Object.keys(modList).map((mod) => (
        <div key={`${mod}_div`} style={{ display: 'flex' }}>
          <input
            key={`${mod}_input`}
            type='checkbox'
            name={mod}
            onChange={(): void => selectMod(mod)}
            checked={modList[mod]}
          />
          <label key={`${mod}_label`}> {getModName(mod)} </label>
        </div>
      ))}
    </div>
  )
}

export default ModList
