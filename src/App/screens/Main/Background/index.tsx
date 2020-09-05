import React from 'react'

const Background = (): JSX.Element => {
  return (
    <img
      style={{
        position: 'absolute',
        width: '100%',
        height: '100%',
        objectFit: 'cover',
        zIndex: -10,
      }}
      src='images/launcher_background.jpg'
    />
  )
}

export default Background
