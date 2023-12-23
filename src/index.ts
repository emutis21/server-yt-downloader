import ytdl from 'ytdl-core'
import { asyncMiddleware } from './middlewares/asyncMiddleware'
import cors from 'cors'
import express, { Request, Response } from 'express'

const app = express()

const allowedOrigins = [
  'http://localhost:3000',
  'http://localhost:8080',
  'http://localhost:5173',
  'https://yt-downloader-xi.vercel.app'
]

const options: cors.CorsOptions = {
  origin: allowedOrigins
}

app.use(cors(options))

const PORT = process.env.PORT ?? 3000

app.get(
  '/download',
  asyncMiddleware(async (req: Request, res: Response) => {
    try {
      const url: string = req.query.url as string

      if (url === undefined || url === null || url.trim() === '') {
        res.status(400).send({ error: 'URL parameter is missing.' })
        return
      }

      const videoId = ytdl.getURLVideoID(url)

      try {
        const metaInfo = await ytdl.getInfo(url)
        const title = metaInfo.videoDetails.title.replace(/[^a-zA-Z0-9 áéíóúÁÉÍÓÚÑñ]/g, '')

        const filteredFormats = metaInfo.formats.filter((format) => format.hasVideo && format.hasAudio)

        if (filteredFormats.length === 0) {
          res.status(500).send({ error: 'No hay formatos disponibles con video y audio.' })
          return
        }

        const data = {
          url: `https://www.youtube.com/embed/${videoId}`,
          info: filteredFormats,
          title
        }

        res.send(data)
      } catch (err) {
        console.error('Error fetching video info from YouTube:', err)
        res.status(500).send({ error: 'Error fetching video info from YouTube.' })
      }
    } catch (err) {
      console.error(err)
      res.status(500).send({ error: 'Internal Server Error' })
    }
  })
)

app.listen(PORT, () => {
  console.log(`Server is running on port http://localhost:${PORT}, http://192.168.1.55:${PORT}`)
})
