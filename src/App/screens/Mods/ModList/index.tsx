import React from 'react'
import { observer } from 'mobx-react'
import { useStore } from 'store'
import { Radio, FormControlLabel } from '@material-ui/core'

const ModList = (): JSX.Element => {
  const { modList, selectMod, modsData } = useStore()

  const getModName = (mod: string): string => modsData.mods[mod].name

  return (
    <div style={{ display: 'flex', flexDirection: 'column' }}>
      {Object.keys(modList).map((mod) => (
        <FormControlLabel
          key={`${mod}_label`}
          label={getModName(mod)}
          labelPlacement='end'
          control={
            <Radio
              key={`${mod}_input`}
              name={mod}
              onChange={(): void => selectMod(mod)}
              checked={modList[mod]}
            />
          }
        />
      ))}
    </div>
  )
}

export default observer(ModList)
