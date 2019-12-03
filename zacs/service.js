const schedule = require("node-schedule")

const crawler = require("./crawler")
const {getApiData, getTrueURL} = crawler

let cache = {}

const clearCacheJob = schedule.scheduleJob("0 0 * * * *", () => {
  cache = {}
  console.log("Cache cleaned")
})

const getProjectData = async (zeplinUrl) => {
  let projectData;
  const groupID = getGroupId(zeplinUrl)
  const isComp = isComponent(zeplinUrl)
  projectData = cache[groupID]

  if (!projectData) {
    console.info(`Retrieving API data for ${isComp ? 'styleguide' : 'project'} ${groupID}`)
    projectData = await getApiData(groupID, isComp)
    cache[groupID] = projectData
  }
  return projectData
}

const getScreenDataFromID = async (groupID, imageID, isComponent = false) => {
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

const getUrlFromScreenData = screenData => {
  if (!screenData) { return null }
  else return screenData.latestVersion.snapshot.url
}

const getScreenData = async (zeplinUrl) => {
  if (!getGroupId(zeplinUrl)) {
    zeplinUrl = await getTrueURL(zeplinUrl)
  }
  let groupData = await getProjectData(zeplinUrl)
  if (!groupData) { return null }
  const groupID = getGroupId(zeplinUrl)
  const imageID = getImageId(zeplinUrl)

  let data;
  if (isComponent(zeplinUrl)) {
    data = findComponent(imageID, groupData.barrel) || null
  } else {
    data = groupData.project.screens.find(
      screen => screen._id === imageID
    )
  }
  if (!data) { return null }
  const screenData = {
    groupID,
    imageID,
    zeplinUrl,
    screenName: data.name,
    screenUrl: getUrlFromScreenData(data)
  }
  return screenData
}

const isComponent = (zeplinUrl) => {
  return !!zeplinUrl.includes('styleguide')
}
const isProject = (zeplinUrl) => {
  return !!zeplinUrl.includes('project')
}

const getGroupId = (zeplinUrl) => {
  if (isProject(zeplinUrl)) {
    return zeplinUrl.substring(
      zeplinUrl.indexOf('project/') + 8,
      zeplinUrl.indexOf('screen/') - 1
      )
    } else if (isComponent(zeplinUrl)) {
    return zeplinUrl.substring(
      zeplinUrl.indexOf('styleguide/') + 11,
      zeplinUrl.indexOf('components') - 1
    )
  } else {
    return 
  }
}

const getImageId = (zeplinUrl) => {
  if (isProject(zeplinUrl)) {
    return zeplinUrl.substring(
      zeplinUrl.indexOf('screen/') + 7,
      zeplinUrl.length
    )
  } else if (isComponent(zeplinUrl)) {
    return zeplinUrl.substring(
      zeplinUrl.indexOf('coid=') + 5,
      zeplinUrl.length
    )
  }
}



module.exports = {
    getProjectData,
    getScreenUrl,
    getScreenData,
    getUrlFromScreenData
}
