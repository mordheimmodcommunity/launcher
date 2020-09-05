import React from 'react'
import { BrowserRouter, Switch, Route } from 'react-router-dom'
import Mods from 'screens/Mods'

const Router = (): JSX.Element => {
  return (
    <BrowserRouter>
      <Switch>
        <Route exact path='/'>
          <Mods />
        </Route>
      </Switch>
    </BrowserRouter>
  )
}

export default Router
