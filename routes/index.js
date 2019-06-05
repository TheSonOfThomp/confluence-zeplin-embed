// Setup ZACS
const service = require("../zacs/service")
const getScreenUrl = service.getScreenUrl

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

    // Render the macro by returning html generated from the hello-world template.
    // The hello-world template is defined in /views/hello-world.hbs.
    app.get('/macro', addon.authenticate(), async function (req, res) {
      var zeplinUrl = req.query['zeplinUrl']

      const projectID = zeplinUrl.substring(
        zeplinUrl.indexOf('project/') + 8,
        zeplinUrl.indexOf('screen/') - 1 
      )
      const screenID = zeplinUrl.substring(
        zeplinUrl.indexOf('screen/') + 7,
        zeplinUrl.length
      )

      // const jsonUrl = `http://ux.sysdaar.org/zeplin/${projectID}.json`

      try {
        const screenUrl = await getScreenUrl(projectID, screenID)
        console.log('screenUrl', screenUrl)

        res.render('zeplin-embed', {
          title: 'Atlassian Connect',
          projectID: projectID,
          screenID: screenID,
          zeplinUrl: zeplinUrl,
          // screenName: screenName,
          imageSrc: screenUrl || null,
        });

      } catch (error) {
        console.error(error.message)
        res.status(400).send(error)
      }

      // axios.get(jsonUrl).then(response => {
      //   const screen = response.data.project.screens.find(screen => screen._id === screenID)
      //   const imageSrc = screen.latestVersion.snapshot.url
      //   const screenName = screen.name

      //   // console.log(imageSrc, screenName)

      //   res.render('zeplin-embed', {
      //     title: 'Atlassian Connect',
      //     projectID: projectID,
      //     screenID: screenID,
      //     zeplinUrl: zeplinUrl,
      //     screenName: screenName,
      //     imageSrc: imageSrc,//'https://cdn.zeplin.io/5c9bef7cbe520e781e8ce7bb/screens/907B211B-5946-4A36-94AE-33A9FA463FC4.png',
      //   });

      // }).catch(e => {
      //   console.error(e)
      // })
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
