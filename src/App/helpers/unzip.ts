import { unpack } from '7zip-min'

const unzip = async (source: string, destination: string): Promise<void> => {
  const promise: Promise<void> = new Promise((resolve, reject) => {
    const unzipTimeout = setTimeout(
      () =>
        reject(
          new Error(
            'unzip timeout, unzipping mods folder took too long, mods may not be installed correctly',
          ),
        ),
      10000,
    )
    unpack(source, destination, (err: Error) => {
      if (err) {
        clearTimeout(unzipTimeout)
        reject(err)
      }
      clearTimeout(unzipTimeout)
      resolve()
    })
  })
  return promise
}

export default unzip
