# Dependencies
You'll need [`docker-compose`](https://docs.docker.com/compose/) and [`node`](https://nodejs.org/en/) installed.

# Install and Run
```sh
git clone git@github.com:mmmveggies/postgraphile-example-messenger.git
cd postgraphile-example-messenger

npm install

# ... in three separate terminals ...
npm run db      # dockerized postgres database 
npm run graphql # node application
npm run migrate # node application
```

With everything running successfully, you can reach the api's playground at http://localhost:5000/

# Examples
See [examples](./examples/index.graphql) for help getting started in the playground.

# Reading
* `postgraphile`  and [Smart Tags](https://www.graphile.org/postgraphile/smart-tags/)/[Comments](https://www.graphile.org/postgraphile/smart-comments/)
