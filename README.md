# Modelify Server

This repository contains the server of Modelify, a bespoke tool for job tracking and communication in the fashion industry.
The live version of the entire project can be found [here](https://modelify.agency).

## Getting started

To use the project, download it to your device.

Open the terminal of your choice and navigate to the root of the project and install the dependencies by executing:

```bash
npm i
```

To run the project, you need to have at least `mongo v4.0.3` installed on your device.

Before running any command, make a `dev.js` file inside the `config/env/` folder at the root of the project that contains the following:

```js
module.exports = {
  MONGODB_URI: 'mongodb://localhost:27017/modelify',
  JWT_SECRET: 'modelify',
};
```

Afterwards, run the following command in a terminal window:

```bash
mongod
```

Then open another terminal window or tab in the same location and run:

```bash
npm start
```

If the server runs, the terminal will log `Server running on port: 5656`. You can also navigate to [http://localhost:5656/](http://localhost:5656/) and see `{"message":"API IS UP!"}`

## Test

If you want to run the test suite, make sure the server is not running, but leave the `mongod` process running. Then execute:

```bash
npm test
```