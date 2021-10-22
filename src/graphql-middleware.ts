import { ApolloServerPluginLandingPageGraphQLPlayground } from 'apollo-server-core';
import { ApolloServer } from 'apollo-server-express';
import type { NextFunction, Request, Response } from 'express';
import { postgraphile } from 'postgraphile';
import { PgMutationUpsertPlugin } from '@fullstackio/postgraphile-upsert-plugin';
import PgPluginManyToMany from '@graphile-contrib/pg-many-to-many';
import PgPluginSimplifyInflectors from '@graphile-contrib/pg-simplify-inflector';
import PgPluginAggregates from '@graphile/pg-aggregates';
import PgPluginConnectionFilter from 'postgraphile-plugin-connection-filter';
import PgPluginFederation from 'postgraphile-apollo-federation-plugin';
// @ts-expect-error -- no module type declaration
import PgPluginNestedMutations from 'postgraphile-plugin-nested-mutations';
import getGateway from './gateway';

const postgraphileMiddleware = postgraphile(process.env.CONNECTION_STRING, ['main'], {
  // this cannot be specified by CLI configuration
  graphileBuildOptions: {
    // https://github.com/graphile-contrib/postgraphile-plugin-connection-filter#connectionfilterrelations
    connectionFilterRelations: true,
  },

  appendPlugins: [
    PgPluginFederation,
    PgMutationUpsertPlugin,
    PgPluginAggregates,
    PgPluginConnectionFilter,
    PgPluginManyToMany,
    PgPluginSimplifyInflectors,
    PgPluginNestedMutations,
  ],

  watchPg: true,
  dynamicJson: true,
  graphqlRoute: '/postgraphile',

  // graphiql: true,
  // enhanceGraphiql: true,
  // graphiqlRoute: '/postgraphile/playground',

  subscriptions: true,
  setofFunctionsContainNulls: false,
  ignoreRBAC: false,
  showErrorStack: 'json',
  extendedErrors: ['hint', 'detail', 'errcode'],
  allowExplain: true,
  legacyRelations: 'omit',
  sortExport: true,
});

async function getApolloMiddleware() {
  const { gateway, promise } = getGateway();

  const server = new ApolloServer({
    gateway,
    plugins: [ApolloServerPluginLandingPageGraphQLPlayground()],
    context: (connection) => connection,
  });

  await Promise.all([server.start(), promise]);

  const apolloMiddleware = server.getMiddleware({
    path: '/graphql',
    cors: true,
    bodyParserConfig: {
      limit: '1mb',
    },
  });

  return apolloMiddleware;
}

const apolloMiddlewarePromise = getApolloMiddleware();

export default function graphqlMiddleware(req: Request, res: Response, next: NextFunction) {
  const [route] = req.path.split('/').slice(1);

  switch (route) {
    case '':
      res.redirect('/graphql');
      return;
    case 'graphql':
      apolloMiddlewarePromise.then(
        (handler) => handler(req, res, next),
        (error) => res.status(500).json({ error }),
      );
      return;
    case 'postgraphile':
      postgraphileMiddleware(req, res, next);
      return;
    default:
      next();
  }
}
