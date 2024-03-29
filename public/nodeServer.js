const http = require('http')
const fs = require('fs')
const httpPort = 8080
http.createServer((req, res) => {
  let fileToRead = 'index.html'

  if (req.url !== '/' && fs.existsSync(`./${req.url}`)) {
    fileToRead = `./${req.url}`
  }

  fs.readFile(fileToRead, 'utf-8', (err, content) => {
    if (err) {
      console.log(`Unable to open ${fileToRead} file.`)
      let data = 'Unable to open ${fileToRead} file.'
       fs.writeFile('Output.txt', data, (err) => { if (err) throw err;})
    }
    res.end(content)
  })
}).listen(httpPort)
