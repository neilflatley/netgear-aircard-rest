# netgear-aircard-api

A simple REST api to fetch status data and trigger a restart / reboot of the router. Written in Node.js using TypeScript and compiling to ES Modules.

Tested with Netgear AirCard 785S (NTG9X25A_02.14.04.13 firmware) works if the router is connected to the server via WiFi or USB interface.

## Start the server

- run `npm i`
- run `npm run src` to run using TypeScript source files
  - or run `npm run build` and `node .` to run using transpiled ES Module JavaScript

## Router discovery

A discovery attempt is made during server start and if a router is found we will set this host as the netgear router to manage.

Manually set the router host/ip in `process.env.NETGEAR_HOST` or edit the line `private host = "netgear.aircard";` in `src/controller.ts` file.

## Endpoints

### GET http://{host}:3000/info

No password is required and all the available router data is returned as JSON

### GET http://{host}:3000/login

Set the router admin password in `process.env.NETGEAR_PASSWORD` or edit the line `private password = "MyPassword";` in `src/controller.ts` file.

Returns the available router data as JSON for the logged in user (or Guest if login has failed)

Check the console logs for failure details 

### GET http://{host}:3000/reboot

The admin password is required (as above) to reboot the router. You do not need to call the /login endpoint first.