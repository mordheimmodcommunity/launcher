import React from 'react'
import { observer } from 'mobx-react'
import { useStore } from 'store'
import { Button } from '@material-ui/core'

const SearchMordheimFolder = (): JSX.Element => {
  const { searchDirectory, mordheimDirectory, searchError } = useStore()

  return (
    <div style={{ display: 'flex' }}>
      <Button
        onClick={(): void => {
          searchDirectory()
        }}
        variant='contained'
      >
        Select mordheim directory
      </Button>
      <div
        style={{
          color: (searchError && 'red') || undefined,
          paddingLeft: 20,
        }}
      >
        {mordheimDirectory}
      </div>
    </div>
  )
}

export default observer(SearchMordheimFolder)
