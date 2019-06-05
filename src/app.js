const express = require("express")

const { getScreenUrl, getProjectData } = require("./service")
const logger = require("./logger")

const app = express()
module.exports = app

app.get("/api/:projectId", async (req, res) => {
    const { projectId } = req.params

    try {
        const apiData = await getProjectData(projectId)
        res.json(apiData)
    } catch (err) {
        logger.error(err.message)
        res.status(400).send(err)
    }
})

app.get("/:projectId/:screenId.png", async (req, res) => {
    const { projectId, screenId } = req.params

    try {
        const screenUrl = await getScreenUrl(projectId, screenId)

        if (!screenUrl) {
            res.status(404).send()
        } else {
            res.redirect(screenUrl)
        }
    } catch (err) {
        logger.error(err.message)
        res.status(400).send(err)
    }
})

app.get("*", (req, res) => {
    res.status(404).send()
})
