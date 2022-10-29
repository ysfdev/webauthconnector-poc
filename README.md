# WebAuthConnector POC

This is sample POC demonstrating the usage of different authentication standards into a single authentication tool (WebAuthConnector).  

- FIDO2 (WebAuthn) login
- Web3 Wallet Connector (TODO)
- Web OAuth2 (TODO)

## Start Project

### Install Dependencies

```sh
npm install
```

### Start app

The app starts a backend HTTP server localhost port `3000` and serve a simple HTML based client application. 

```sh
npm start
```

Optionally, for FIDO2 login, a custom Reply Party host name can specify via env. variable `RP_ID`

```sh
export RP_ID=mycustomdomain.com
npm start
```
