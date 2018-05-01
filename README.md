[knacksteem.org](http://knacksteem.org) Is meant for people with great skills to showcase them and earn reward while doing so :) . 
Forked from https://github.com/utopian-io/utopian.io, knacksteem uses the [STEEM Blockchain](https://steem.io) to reward contributors/authors in cryptocurrency.

See the website in action [here:](http://knacsteem.org)
  
## Contributing to this Project
Get in touch on Discord: https://discord.gg/XSqTRgz
For PRs and feature request, please fork https://github.com/knacksteem/knacksteem.org

## Roadmap
1. clean the code
2. Add suitable categories
3. connect to the backend (api server.)

### Clone and Install
git clone https://github.com/knacksteem/knacksteem knacksteem.org

cd knacksteem

npm install

### Generate and Export SSL Certificates
openssl req -x509 -sha512 -newkey rsa:4096 -keyout key.pem -out cert.pem -days 365 -nodes

export SERVER_SSL_CERT="/path/cert.pem"

export SERVER_SSL_KEY="/path/key.pem"

export NODE_TLS_REJECT_UNAUTHORIZED=0

Replace path with the path to the generated .pem files.
You may need to authorise your browser in using a self-signed SSL certificate


### Set SC Utopian App
Add the enviroment variable UTOPIAN_APP using the app name of your Steem Connect oauth application. You can create a SC app here https://v2.steemconnect.com/apps/create. The same app will have to be used and setup in the backend https://github.com/knacksteem/api.knacksteem forked from https://github.com/utopian-io/api.utopian.io.

### Run The Frontend
npm run dev-server


#### API Server
Our sister project [knacksteem/api.knacksteem](https://github.com/knacksteem/api.knacksteem) provides the back-end APIs for knacksteem. If you want to run knacksteem locally, you **do need**  to run that project, though you may want to check it out!


## License
GNU Public License v3.0. Copyright Utopian.io

Original source code licensed under MIT License. Copyright Busy 
