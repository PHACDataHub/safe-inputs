import { makeExecutableSchema } from '@graphql-tools/schema';
import request from 'supertest'; // eslint-disable-line node/no-unpublished-import

import { App } from '../App.js';

// ----- TEST SET UP -----

// Construct a schema, using GraphQL schema language
const typeDefs = /* GraphQL */ `
  scalar JSON

  type Query {
    hello: String
  }

  type Mutation {
    verifyJsonFormat(sheetData: JSON!): JSON
  }
`;
const resolvers = {
  Query: {
    hello: () => {
      return 'world!';
    },
  },
  Mutation: {
    verifyJsonFormat(_parent, { sheetData }, _info) {
      return sheetData;
    },
  },
};

const schema = makeExecutableSchema({ typeDefs, resolvers });

// ----- TESTS -----

describe('App', () => {
  describe('given a schema and resolver', () => {
    it('returns an express app', async () => {
      const app = new App({ schema });

      const response = await request(app)
        .post('/graphql')
        .set('Accept', 'application/json')
        .send({
          query: '{hello}',
        });

      expect(response.body).toEqual({ data: { hello: 'world!' } });
    });
  });

  describe('given an overly complex query', () => {
    it('rejects it', async () => {
      const app = new App({ schema });
      const response = await request(app)
        .post('/graphql')
        .set('Accept', 'application/json')
        .send({
          query:
            '{a:hello, b:hello, c:hello, d:hello, e:hello, f:hello, g:hello, h:hello}',
        });
      const [err] = response.body.errors;

      expect(err.message).toMatch(
        'Syntax Error: Aliases limit of 4 exceeded, found 8',
      );
    });
  });

  describe('given a simple query', () => {
    it('executes it', async () => {
      const app = new App({ schema });
      const response = await request(app)
        .post('/graphql')
        .set('Accept', 'application/json')
        .send({
          query: '{hello}',
        });

      expect(response.body).not.toHaveProperty('errors');
    });
  });

  describe('given a mutation query', () => {
    it('executes it', async () => {
      const app = new App({ schema });

      const response = await request(app)
        .post('/graphql')
        .set('Accept', 'application/json')
        .send({
          query: `mutation {
                verifyJsonFormat(sheetData: "a")
             }`,
        });

      expect(response.body).not.toHaveProperty('errors');
    });
  });
});
