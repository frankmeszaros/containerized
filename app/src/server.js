import App from './App';
import React from 'react';
import { StaticRouter } from 'react-router-dom';
import express from 'express';
import fetch from 'node-fetch';
import { renderToString } from 'react-dom/server';

import { ApolloProvider, ApolloClient, createHttpLink, InMemoryCache } from '@apollo/client';
import { buildFederatedSchema } from '@apollo/federation';

import { ApolloServer, gql } from 'apollo-server-express';

import { ApolloGateway, LocalGraphQLDataSource, RemoteGraphQLDataSource } from '@apollo/gateway';

const LOCAL = 'local';

const typeDefs = gql`
	# Comments in GraphQL strings (such as this one) start with the hash (#) symbol.

	# This "Book" type defines the queryable fields for every book in our data source.
	type Book {
		title: String
		author: String
	}

	# The "Query" type is special: it lists all of the available queries that
	# clients can execute, along with the return type for each. In this
	# case, the "books" query returns an array of zero or more Books (defined above).
	type Query {
		books: [Book]
	}
`;

const books = [
	{
		title: 'The Awakening',
		author: 'Kate Chopin',
	},
	{
		title: 'City of Glass',
		author: 'Paul Auster',
	},
];

// Resolvers define the technique for fetching the types defined in the
// schema. This resolver retrieves books from the "books" array above.
const resolvers = {
	Query: {
		books: () => books,
	},
};

const schema = buildFederatedSchema({ typeDefs, resolvers });

// Initialize an ApolloGateway instance and pass it an array of
// your implementing service names and URLs
const gateway = new ApolloGateway({
	serviceList: [
		{ name: LOCAL, url: LOCAL },
		{ name: 'django-backend2', url: 'http://backend:8000/graphql' },
	],
	buildService: ({ url, name }) =>
		console.log(url) || name === LOCAL
			? new LocalGraphQLDataSource(schema)
			: new RemoteGraphQLDataSource({ name, url }),
});

// The ApolloServer constructor requires two parameters: your schema
// definition and your set of resolvers.
const graphqlServer = new ApolloServer({
	gateway,
	subscriptions: false,
});

const assets = require(process.env.RAZZLE_ASSETS_MANIFEST);

const server = express();

graphqlServer.applyMiddleware({ app: server, path: '/api' });

server
	.disable('x-powered-by')
	.use(express.static(process.env.RAZZLE_PUBLIC_DIR))
	.get('/*', (req, res) => {
		const client = new ApolloClient({
			ssrMode: true,
			// Remember that this is the interface the SSR server will use to connect to the
			// API server, so we need to ensure it isn't firewalled, etc
			link: createHttpLink({
				uri: 'http://localhost:3000',
				fetch,
				credentials: 'same-origin',
				headers: {
					cookie: req.header('Cookie'),
				},
			}),
			cache: new InMemoryCache(),
		});

		const context = {};
		const markup = renderToString(
			<ApolloProvider client={client}>
				<StaticRouter context={context} location={req.url}>
					<App />
				</StaticRouter>
			</ApolloProvider>
		);

		if (context.url) {
			res.redirect(context.url);
		} else {
			res.status(200).send(
				`<!doctype html>
    <html lang="">
    <head>
        <meta http-equiv="X-UA-Compatible" content="IE=edge" />
        <meta charset="utf-8" />
        <title>Welcome to Razzle</title>
        <meta name="viewport" content="width=device-width, initial-scale=1">
        ${assets.client.css ? `<link rel="stylesheet" href="${assets.client.css}">` : ''}
        ${
			process.env.NODE_ENV === 'production'
				? `<script src="${assets.client.js}" defer></script>`
				: `<script src="${assets.client.js}" defer crossorigin></script>`
		}
		<script>
  		window.__APOLLO_STATE__ = ${JSON.stringify(client.extract())};
		</script>

    </head>
    <body>
        <div id="root">${markup}</div>
    </body>
</html>`
			);
		}
	});

export default server;
