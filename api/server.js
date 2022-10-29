import express, { request } from 'express'
import bodyParser from 'body-parser'
import cors from 'cors'
import fs from 'fs'
import md5 from 'md5'

const app = express()
app.use(bodyParser.raw({ type: 'application/octet-stream', limit: '100mb' }))
app.use(
  cors({
    origin: 'http://localhost:3000',
  })
)
app.use('/uploads', express.static('uploads'))

app.post('/upload', (req, res) => {
  const { name, currentChunkIndex, totalChunks } = req.query

  const firstChunk = parseInt(currentChunkIndex) === 0
  const lastChunk = parseInt(currentChunkIndex) === parseInt(totalChunks) - 1

  const ext = name.split('.').pop() // test.jpeg - will take only part after dot
  const data = req.body.toString().split(',')[1]

  const buffer = new Buffer(data, 'base64')
  const tempFileName = 'temp_' + md5(name + req.ip) + '.' + ext

  if (firstChunk && fs.existsSync('./uploads/' + tempFileName)) {
    fs.unlinkSync('./uploads/' + tempFileName)
  }
  fs.appendFileSync('./uploads/' + tempFileName, buffer)

  if (lastChunk) {
    const finalFileName = md5(Date.now()).substr(0, 6) + '.' + ext
    fs.renameSync('./uploads/' + tempFileName, './uploads/' + finalFileName)
    res.json({ finalFileName })
  } else {
    res.json('ok')
  }
})

app.listen(4001)
