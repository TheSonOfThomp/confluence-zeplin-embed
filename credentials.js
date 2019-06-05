const dotenv = require("dotenv")
dotenv.config()
const fs = require('fs')

fs.writeFile('credentials.json', 
`{
  "hosts": {
    "${process.env.CONFLUENCE_URL}": {
      "product" : "confluence",
      "username": "${process.env.CONFLUENCE_USERNAME}",
      "password": "${process.env.CONFLUENCE_API_KEY}"
    }
  }
}
`,
(err) => {
  if (err) console.error(err)
  else console.log('Credentials OK')
}
)