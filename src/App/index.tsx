import React, { useEffect } from 'react'
import { observer } from 'mobx-react'

import MainScreen from 'screens/Main'
import { useStore } from 'store'

const App = (): JSX.Element => {
  const { checkDirectory, setInstall } = useStore()

  const onMount = async (): Promise<void> => {
    await checkDirectory(
      'C:/Program Files (x86)/Steam/SteamApps/common/mordheim',
    )
    setInstall(false)
  }

  useEffect(() => {
    onMount()
  }, [])

  return <MainScreen />
}

export default observer(App)
