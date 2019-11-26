const schedule = require("node-schedule")

const crawler = require("./crawler")
const getApiData = crawler.getApiData

let cache = {}

const clearCacheJob = schedule.scheduleJob("0 0 * * * *", () => {
  cache = {}
  console.log("Cache cleaned")
})

const getProjectData = async (groupID, isComponent = false) => {
  let projectData = cache[groupID]

  if (!projectData) {
    console.info(`Retrieving API data for ${isComponent ? 'styleguide' : 'project'} ${groupID}`)
    projectData = await getApiData(groupID, isComponent)
    cache[groupID] = projectData
  }
  return projectData
}

const getScreenData = async (groupID, imageID, isComponent = false) => {
  let groupData = await getProjectData(groupID, isComponent)

  if (!groupData) { return null }

  if (isComponent) {
    return findComponent(imageID, groupData.barrel) || null
  } else {
    const screen = groupData.project.screens.find(
      screen => screen._id === imageID
    )

    if (!screen) { return null }
    else return screen
  }
}

const findComponent = (componentID, componentSection) => {
  const subsections = componentSection.componentSections
  const components = componentSection.components

  if (!!components) {
    let foundComponent = components.find(c => c._id === componentID )
    if (!!foundComponent) {
      return foundComponent
    }
  } 
  if (!!subsections) {
    for(let subsection of subsections){
      foundComponent = findComponent(componentID, subsection)
      if (!!foundComponent) return foundComponent
    }
  }
}

const getScreenUrl = async (projectId, screenId, isComponent = false) => {
  let screenData = await getProjectData(projectId, screenId)
  if (!screenData) { return null }
  else return getUrlFromScreenData(screenData)
}

const getUrlFromScreenData = async screenData => {
  if (!screenData) { return null }
  else return screenData.latestVersion.snapshot.url
}



module.exports = {
    getProjectData,
    getScreenUrl,
    getScreenData,
    getUrlFromScreenData
}
