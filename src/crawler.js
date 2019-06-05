const request = require("request-promise-native")

const config = require("./config")

const requestLogin = async () => {
    console.log('Logging in...\n' )
    console.log('config', config)
    const body = await request.post("https://api.zeplin.io/users/login", {
        form: {
            handle: config.ZEPLIN_USERNAME,
            password: config.ZEPLIN_PASSWORD,
        },
    })
    console.log('body', body)

    const auth = JSON.parse(body)
    if (!auth || !auth.token) {
        throw new Error("Error retrieving auth token")
    }
    return auth
}

const requestApiData = async (authToken, projectId) => {
    console.log('Requesting', authToken, projectId)

    const body = await request.get(
        `https://app.zeplin.io/project/${projectId}`,
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
            `API data for project '${projectId}' not found. Check if project exists and if the provided credentials have access to it.`
        )
    }

    const data = eval(res[1]) // TODO: DANGER

    if (!data || !data.project) {
        throw new Error(
            `API data for project '${projectId}' not found. Check if project exists and if the provided credentials have access to it.`
        )
    }

    return data
}

const getApiData = async projectId => {
    const auth = await requestLogin()
    const apiData = await requestApiData(auth.token, projectId)
    console.log('apiData', apiData)
    return apiData
}

module.exports = {
    getApiData
}
