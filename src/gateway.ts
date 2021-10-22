import { ApolloGateway, RemoteGraphQLDataSource } from '@apollo/gateway';
import getWaitGroup from './wait-group';
import { defaultSourceServices } from './sources';

export default function getGateway(sourceServices = defaultSourceServices) {
  const { cancel, done, promise } = getWaitGroup();

  const gateway = new ApolloGateway({
    serviceList: Object.keys(sourceServices).map((name) => ({ name, url: '-' })),
    buildService: ({ name }) => sourceServices[name],

    // A reliable way to detect successful schema building
    // since `gateway.onSchemaChange` doesn't run on first build.
    experimental_didUpdateComposition: done,
    experimental_didFailComposition: cancel,
  });

  return { gateway, promise };
}
