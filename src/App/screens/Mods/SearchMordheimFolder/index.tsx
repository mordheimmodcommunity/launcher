import React from 'react'

export interface SearchMordheimFolderProps {
  searchDirectory: () => void
  mordheimDirectory: string | null
  searchError: boolean
}

const SearchMordheimFolder = ({
  searchDirectory,
  mordheimDirectory,
  searchError,
}: SearchMordheimFolderProps): JSX.Element => {
  return (
    <div style={{ display: 'flex' }}>
      <button
        onClick={(): void => {
          searchDirectory()
        }}
      >
        Select mordheim directory
      </button>
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

export default SearchMordheimFolder
