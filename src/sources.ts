import { buildSubgraphSchema } from '@apollo/federation';
import { LocalGraphQLDataSource, GraphQLDataSource, RemoteGraphQLDataSource } from '@apollo/gateway';
import { URL } from 'url';
import { gql } from 'postgraphile';
import axios from 'axios';
import type { Context } from './context';

export type ServiceSource = GraphQLDataSource<Context>
export type LocalServiceSource = Parameters<typeof buildSubgraphSchema>[0]

export function getLocalSource(source: LocalServiceSource) {
  const schema = buildSubgraphSchema(source);
  return new LocalGraphQLDataSource<Context>(schema);
}

export const defaultSourceServices: Record<string, ServiceSource> = {
  postgraphile: new RemoteGraphQLDataSource({
    url: `http://127.0.0.1:${process.env.GRAPHQL_PORT}/postgraphile`,
  }),

  custom: getLocalSource({
    typeDefs: gql`
    extend type User @key(fields: "id") {
      id: Int! @external
      alias: String! @external

      "Guess user age based on alias using agify.io"
      ageGuess: Int @requires(fields: "alias")
    }
    `,
    resolvers: {
      User: {
        ageGuess: async ({ alias }) => {
          const url = new URL('https://api.agify.io');
          url.searchParams.set('name', alias);
          const resp = await axios(url.href);
          const { age } = resp.data as { age: number | null };
          return age;
        },
      },
    },
  }),
};
