// Setup ZACS
const zacs = require("../zacs/service")

module.exports = function (app, addon) {
    // Root route. This route will serve the `atlassian-connect.json` unless the
    // documentation url inside `atlassian-connect.json` is set
    app.get('/', function (req, res) {
        res.format({
            // If the request content-type is text-html, it will decide which to serve up
            'text/html': function () {
                res.redirect('/atlassian-connect.json');
            },
            // This logic is here to make sure that the `atlassian-connect.json` is always
            // served up when requested by the host
            'application/json': function () {
                res.redirect('/atlassian-connect.json');
            }
        });
    });

    // get the projectID from the url
    app.get('/macro', addon.authenticate(), async function (req, res) {
      var zeplinUrl = req.query['zeplinUrl']

      let isComponent = false;
      let groupID, imageID; 
      // groupID is either project or styleGuide ID
      // imageID is either screen or component ID

      if (zeplinUrl.includes('project')) {
        groupID = zeplinUrl.substring(
          zeplinUrl.indexOf('project/') + 8,
          zeplinUrl.indexOf('screen/') - 1 
        )
        imageID = zeplinUrl.substring(
          zeplinUrl.indexOf('screen/') + 7,
          zeplinUrl.length
        )
      } else if (zeplinUrl.includes('styleguide')){
        isComponent = true;
        groupID = zeplinUrl.substring(
          zeplinUrl.indexOf('styleguide/') + 11,
          zeplinUrl.indexOf('components') - 1
        )
        imageID = zeplinUrl.substring(
          zeplinUrl.indexOf('coid=') + 5,
          zeplinUrl.length
        )
      }

      try {
        const screenData = await zacs.getScreenData(groupID, imageID, isComponent)
        const screenUrl = await zacs.getUrlFromScreenData(screenData)
        const screenName = screenData.name

        res.render('zeplin-embed', {
          projectID: groupID,
          screenID: imageID,
          zeplinUrl: zeplinUrl,
          screenName: screenName,
          imageSrc: screenUrl || null,
        });

      } catch (error) {
        console.error(error.message)
        res.render('40x-error', {
          zeplinUrl: zeplinUrl,
        })
      }
    });

    // Add any additional route handlers you need for views or REST resources here...
    
    // load any additional files you have in routes and apply those to the app
    {
        var fs = require('fs');
        var path = require('path');
        var files = fs.readdirSync("routes");
        for (var index in files) {
            var file = files[index];
            if (file === "index.js") continue;
            // skip non-javascript files
            if (path.extname(file) != ".js") continue;

            var routes = require("./" + path.basename(file));

            if (typeof routes === "function") {
                routes(app, addon);
            }
        }
    }
};
