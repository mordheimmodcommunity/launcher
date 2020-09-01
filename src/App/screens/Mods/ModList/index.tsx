import React from 'react'

export interface ModListProps {
  modList: {}
  selectMod: (mod: string) => void
  modsData: {
    mods: {}
    files: string[]
  }
}

const ModList = ({
  modList,
  selectMod,
  modsData,
}: ModListProps): JSX.Element => {
  const getModName = (mod: string): string => modsData.mods[mod].name

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
