# Foodmap

A map project built with React (for the client side) and SpacetimeDB (for the backend and database).

## Running the Project Locally

### Setup the backend/database

- Download and setup the spacetime CLI: https://spacetimedb.com/install
- Publish the database to the local server with: `spacetime publish --server local --module-path spacetimedb foodmap-db`
- Start the SpacetimeDB local server: `spacetime start`

### Setup the client side

- Download the `npm` CLI: https://docs.npmjs.com/downloading-and-installing-node-js-and-npm
- Install the dependencies: `npm install`
- Run the React app: `npm run dev`
