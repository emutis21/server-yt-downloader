import express from 'express'
import ytdl from 'ytdl-core'
import { asyncMiddleware } from './middlewares/asyncMiddleware'
import cors from 'cors'

const app = express()

const allowedOrigins = ['http://localhost:3000', 'http://localhost:8080', 'http://localhost:5173']

const options: cors.CorsOptions = {
  origin: allowedOrigins
}

app.use(cors(options))

const PORT = process.env.PORT ?? 3000

app.get(
  '/download',
  asyncMiddleware(async (req, res, next) => {
    try {
      const url = req.query.url
      const videoId = ytdl.getURLVideoID(url as string)
      const metaInfo = await ytdl.getInfo(url as string)

      const filteredFormats = metaInfo.formats.filter((format) => format.hasVideo && format.hasAudio)

      if (filteredFormats.length === 0) {
        res.status(500).send({ error: 'No hay formatos disponibles con video y audio.' })
        return
      }

      const data = {
        url: `https://www.youtube.com/embed/${videoId}`,
        info: filteredFormats
      }

      res.send(data)
    } catch (err) {
      next(err)

      console.log(err)
    }
  })
)

app.listen(PORT, () => {
  console.log(`Server is running on port http://localhost:${PORT}`)
})
