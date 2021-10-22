import cors from 'cors';
import express from 'express';
import { graphqlUploadExpress } from 'graphql-upload';
import graphqlMiddleware from './graphql-middleware';

const port = Number(process.env.GRAPHQL_PORT);

export default function serve() {
  const app = express();
  app.use(cors());
  app.use(express.json());
  app.use(graphqlUploadExpress());
  app.use(graphqlMiddleware);

  app.listen({ port }, () => {
    // eslint-disable-next-line no-console
    console.log({ playground: `http://localhost:${port}/graphql` });
  });
}

serve();
