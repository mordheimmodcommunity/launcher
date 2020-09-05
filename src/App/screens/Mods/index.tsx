import React from 'react'
import { observer } from 'mobx-react'
import { useStore } from 'store'
import { Button } from '@material-ui/core'

import SearchMordheimFolder from './SearchMordheimFolder'
import ModList from './ModList'
import { ModsContainer } from './style'

const Mods = (): JSX.Element => {
  const {
    mordheimDirectory,
    searchError,
    install,
    setInstall,
    installMod,
    play,
  } = useStore()

  const disabled = searchError || !mordheimDirectory || install

  return (
    <ModsContainer>
      <SearchMordheimFolder />
      <ModList />
      <Button
        variant='contained'
        onClick={(): void => {
          setInstall(true)
          installMod()
        }}
        disabled={disabled}
        style={{
          backgroundColor: disabled ? undefined : 'green',
          borderColor: disabled ? undefined : 'green',
          color: disabled ? undefined : 'white',
        }}
      >
        Install Mod
      </Button>
      <Button
        variant='contained'
        onClick={play}
        disabled={disabled}
        style={{
          backgroundColor: disabled ? undefined : 'green',
          borderColor: disabled ? undefined : 'green',
          color: disabled ? undefined : 'white',
        }}
      >
        Play
      </Button>
    </ModsContainer>
  )
}

export default observer(Mods)
