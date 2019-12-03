# Zeplin Embed 

Embed Zeplin files in Confluence with confidence!

![Logo](assets/addon-icon.png)


# Development
1. Add your Zeplin login credentials in an `.env` file
2. Add your Confluence credentials in `credentials.json`. (Confluence password is actually an [API Key](https://confluence.atlassian.com/x/Vo71Nw?_ga=2.73540242.1265157353.1559581961-1384803140.1559251930))
  - You can add multiple hosts

3. In the `atlassian-connect.json` file, change the `key` and `name` properties to something unique (they can't be the same in development as in production)
4. Run `npm start` to start the server
5. You should be able to see the addon in Confluence (at the domain(s) you specified) in `credentials.json`
  
  - Note: If you already have a production version of `zeplin-embed` in the workspace, you'll have to uninstall that to run the development version

### ENV keys
```
ZEPLIN_USERNAME=<zeplin-username>
ZEPLIN_PASSWORD=<zeplin-password>
NODE_ENV=development
```


# To Deploy
## AWS Elastic Beanstalk
### Basic setup
- Install the `eb` cli tool, and run `eb init` and `eb deploy`
- From the AWS Console (or the cli if you're a wizard), set up a new EB environment as `t2.micro`, with 1-2 instances, and _with load balancing_
- Add your `ZEPLIN_USERNAME` and `ZEPLIN_PASSWORD` environment variables, as well as `NODE_ENV = production`
- Make sure your `Node command` is set to `npm start` (In `Configuration > Software`)

### SSL certificate
- Pick the domain you want to use (`addon.my-domain.com`), and set the `CNAME` of your domain as an alias to your `***.elasticbeanstalk.com` url
- Get an SSL Cert for that domain (using AWS Certificate Manager)
  - From the console, click `Services` and search for `Certificate Manager`
  - Follow the instructions to `Request a certificate`
- Once you get the cert, find the ARN for your cert (in `Details > ARN`), and add that to your EB options
  - `eb config` and then paste this into the config file:
  ```
    aws:elb:listener:443:
      InstancePort: '80'
      InstanceProtocol: HTTP
      ListenerProtocol: HTTPS
      SSLCertificateId: <YOUR-ARN-NUMBER>
    ```
- Save that file (`^X, Y, enter`).

Your environment should update to allow `https`

### Deploy
- In this project, edit the file `config.json`, and set your `https://addon.my-domain.com` as the `localBaseUrl`
  - If you've changed the `key` & `name` props in `atlassian-connect.json` for development, change them back for production
- Run `eb deploy` to deploy to your Beanstalk with the updated url
- Check that you can go to `https://addon.my-domain.com` (should load to your `atlassian-connect.json` file)

## Atlassian Marketplace
### Create an app
- Go to `marketplace.atlassian.com`
- Click your profile picture (top right) and select `Publish a new app`
- Select your vendor & `Provide an Installation URL`
- Click `Enter URL` and paste your new url: `https://addon.my-domain.com/atlassian-connect.json`
- Select `Save as private`

### Update an app 
- Go to `marketplace.atlassian.com`
- Click your profile picture (top right) and select `Manage Vendor account`
- Select your app from the list, then click `Create Version`
- Select your vendor & `Provide an Installation URL`
- Click `Enter URL` and paste your new url: `https://addon.my-domain.com/atlassian-connect.json`
- Select `Save as private`
  
### Share the app
- Select `Private listings` tab
- Click `Create a token` (we'll use this later)
- Find the hyperlink that says `installation URL` (or click the token once it's been created), and copy that url (should be `marketplace.atlassian.com/.../atlassian-connect.json`)

## Confluence
- In a new tab, go to `<my-org>.atlassian.net`
- Go to `Big X logo > Settings > Manage Apps`
- Click `Upload app`
- Paste the installation URL you just copied
- Once that loads, paste the `Access token` you created above

You should now be able to use the addon
