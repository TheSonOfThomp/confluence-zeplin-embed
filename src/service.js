const schedule = require("node-schedule")

const crawler = require("./crawler")
const getApiData = crawler.getApiData

let cache = {}

const clearCacheJob = schedule.scheduleJob("0 0 * * * *", () => {
    cache = {}
    console.log("Cache cleaned")
})

const getProjectData = async projectId => {
    let projectData = cache[projectId]

    if (!projectData) {
        console.info(`Retrieving API data for project ${projectId}`)
        projectData = await getApiData(projectId)
        cache[projectId] = projectData
    }

    console.log('projectData', projectData)


    return projectData
}

const getScreenUrl = async (projectId, screenId) => {
    let projectData = await getProjectData(projectId)
    console.log('projectData', projectData)

    if (!projectData) {
        return null
    }

    const screen = projectData.project.screens.find(
        screen => screen._id === screenId
    )

    if (!screen) {
        return null
    }

    return screen.latestVersion.snapshot.url
}

module.exports = {
    getProjectData,
    getScreenUrl
}
