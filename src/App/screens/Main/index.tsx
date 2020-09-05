import React from 'react'

import { MainContainer } from './style'
import Router from './Router'
import Background from './Background'
import TopMenu from './TopMenu'
import LeftMenu from './LeftMenu'

const MainScreen = (): JSX.Element => {
  return (
    <MainContainer>
      <Background />
      <TopMenu />
      <LeftMenu />
      <Router />
    </MainContainer>
  )
}

export default MainScreen
