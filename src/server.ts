/* eslint-disable no-console */
// mostly copied from https://github.com/graphile/postgraphile/blob/v4/examples/servers/common.ts#L40
import { createServer } from 'http';
import { postgraphile } from 'postgraphile';

const conn = process.env.CONNECTION_STRING;
const port = Number(process.env.GRAPHQL_PORT);

const middleware = postgraphile(conn, ['main'], {
  // this cannot be specified by CLI configuration
  graphileBuildOptions: {
    // https://github.com/graphile-contrib/postgraphile-plugin-connection-filter#connectionfilterrelations
    connectionFilterRelations: true,
  },

  // my favorites from https://www.graphile.org/postgraphile/community-plugins/
  appendPlugins: [
    // eslint-disable-next-line global-require
    require('@fullstackio/postgraphile-upsert-plugin').PgMutationUpsertPlugin,
    ...[
      '@graphile-contrib/pg-many-to-many',
      '@graphile-contrib/pg-simplify-inflector',
      '@graphile/pg-aggregates',
      'postgraphile-plugin-connection-filter',
      'postgraphile-plugin-nested-mutations',
    ].map(require),
  ],

  watchPg: true,
  graphiql: true,
  enhanceGraphiql: true,
  subscriptions: true,
  dynamicJson: true,
  setofFunctionsContainNulls: false,
  ignoreRBAC: false,
  showErrorStack: 'json',
  extendedErrors: ['hint', 'detail', 'errcode'],
  allowExplain: true,
  legacyRelations: 'omit',
  // exportGqlSchemaPath: `${__dirname}/schema.graphql`,
  sortExport: true,
});

const server = createServer(middleware);
server.listen(port, () => {
  const address = server.address();
  if (address != null && typeof address !== 'string') {
    const href = `http://localhost:${address.port}/graphiql`;
    console.log(`PostGraphiQL available at ${href} 🚀`);
  } else {
    console.log(`PostGraphile listening on ${address} 🚀`);
  }
});
