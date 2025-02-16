const dotenv = require ("dotenv")
dotenv.config()

if (!process.env.ZEPLIN_USERNAME || !process.env.ZEPLIN_PASSWORD) {
    throw new Error("You must define ZEPLIN_USERNAME and ZEPLIN_PASSWORD")
}

const config = {
    SERVER_PORT: process.env.PORT || 3000,
    ZEPLIN_USERNAME: process.env.ZEPLIN_USERNAME,
    ZEPLIN_PASSWORD: process.env.ZEPLIN_PASSWORD,
}

module.exports = config