const request = require("request-promise-native")
const axios = require("axios");

const config = require("./config")

const requestLogin = async () => {
  console.log('Logging in...\n' )
  const body = await request.post("https://api.zeplin.io/users/login", {
    form: {
      handle: config.ZEPLIN_USERNAME,
      password: config.ZEPLIN_PASSWORD,
    },
  })

  const auth = JSON.parse(body)
  if (!auth || !auth.token) {
    throw new Error("Error retrieving auth token")
  }
  return auth
}

const requestApiData = async (authToken, groupID, isComponent = false) => {
  
  const groupType = isComponent ? 'styleguide' : 'project';
  console.log('Requesting', authToken, `for ${groupType}`, groupID, `\n`)

  const body = await request.get(
    `https://app.zeplin.io/${groupType}/${groupID}`,
    {
      headers: {
        Cookie: request.cookie(`userToken=${authToken}`),
      },
    }
  )

  const regex = /window\.Zeplin\[\"apiData\"\] = (.*)<\/script>/g
  const res = regex.exec(body)

  if (!res || !res[1]) {
    throw new Error(
      `No response for ${groupType} '${groupID}'. Check if project exists and if the provided credentials have access to it.`
    )
  }

  const data = eval(res[1]) // TODO: DANGER

  if (!data) {
    throw new Error(
      `API data for ${groupType} '${groupID}' not found. Check if project exists and if the provided credentials have access to it.`
    )
  }

  return data
}

const getApiData = async (groupID, isComponent = false) => {
  const auth = await requestLogin()
  const apiData = await requestApiData(auth.token, groupID, isComponent)
  return apiData
}

const getTrueURL = async (zeplinUrl) => {
  const auth = await requestLogin()

  const resp = await axios.get(
    zeplinUrl,
      {
      headers: {
        Cookie: request.cookie(`userToken=${auth.token}`),
      },
    }
  )
  const path = decodeURIComponent(resp.request.path)
  const trueUrl = `https://app.zeplin.io/${path.slice(path.indexOf('redirect=') + 10)}`
  return trueUrl
}

module.exports = {
  getTrueURL,
  getApiData
}
