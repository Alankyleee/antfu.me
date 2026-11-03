export interface PhotoMate {
  text?: string
  lang?: string
  blurhash?: string
}

export interface Photo extends PhotoMate {
  name: string
  url: string
}

const photos: Photo[] = []

export default photos
