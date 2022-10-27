import axios from 'axios'
import { useEffect, useState } from 'react'
import './App.css'

const chunkSize = 10 * 1024

function App() {
  const [dropzoneActive, setDropzoneActive] = useState(false)
  const [files, setFiles] = useState([])
  const [currentFileIndex, setCurrentFileIndex] = useState(null) // file that is currently uploading
  const [lastUploadedFileIndex, setLastUploadedFileIndex] = useState(null)
  const [currentChunkIndex, setCurrentChunkIndex] = useState(0)

  const handleDrop = (e) => {
    e.preventDefault()
    setFiles([...files, ...e.dataTranfer.files])
  }

  const uploadChunk = (readerEvent) => {
    const file = files[currentFileIndex]
    const data = readerEvent.target.result

    const params = new URLSearchParams()
    params.set('name', file.name)
    params.set('size', file.size)
    params.set('currentChunkIndex', currentChunkIndex)
    params.set('totalChunks', Math.ceil(file.size / chunkSize))

    const headers = { 'Content-Type': 'application/octet-stream' }

    const url = `http://localhost:4000/upload?${params.toString()}`

    axios.post(url, data, {
      headers,
    }).then(response => {

    })
  }

  const readAndUploadCurrentChunk = () => {
    const reader = new FileReader()
    const file = files[currentFileIndex]

    if (!file) return null

    const from = currentChunkIndex * chunkSize
    const to = from + chunkSize

    const blob = file.slice(from, to)
    reader.onload = (e) => uploadChunk(e)
    reader.readAsDataURL(blob)
  }

  useEffect(() => {
    if (files.length > 0) {
      if (setCurrentFileIndex === null) {
        setCurrentFileIndex(
          lastUploadedFileIndex === null ? 0 : lastUploadedFileIndex + 1
        )
      }
    }
  }, [files.length])

  useEffect(() => {
    if (currentFileIndex !== null) {
      setCurrentChunkIndex(0)
    }
  }, [currentFileIndex])

  useEffect(() => {
    if (currentChunkIndex !== null) {
      readAndUploadCurrentChunk()
    }
  }, [currentChunkIndex])

  return (
    <div>
      <div
        onDragOver={(e) => {
          setDropzoneActive(true)
          e.preventDefault()
        }}
        onDragLeave={(e) => {
          setDropzoneActive(false)
          e.preventDefault()
        }}
        onDrop={(e) => handleDrop(e)}
        className={'dropzone' + (dropzoneActive ? ' active' : '')}
      >
        Drop your files
      </div>
    </div>
  )
}

export default App
