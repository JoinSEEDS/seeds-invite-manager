# SEEDS Invite Manager

In order to initalize for development make sure you have installed [npx](https://www.npmjs.com/package/npx) and [typescript](https://www.npmjs.com/package/typescript).

Initialize enviorment variables through creating the proper `.env` file in root (use [.env-template](.env-template) for reference).

That includes:
- Set up a new database on an [RavenDB](https://ravendb.net/) server. 
- Link to an [SEEDS Authenticator](https://github.com/seeds-passport/seeds-authenticator) app.

Current applicaiton is running at https://invites.joinseeds.earth

## Running

Install

`npm install`

Development + **watch**

`npm run dev`

Just Run

`npm start`

Test

`npm test`

## License
See the [LICENSE](LICENSE.md) file for license rights and limitations (MIT)