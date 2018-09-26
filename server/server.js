import webpack from 'webpack';
import webpackMiddleware from 'webpack-dev-middleware';
import webpackConfig from '../webpack.config.js';
import express from 'express';
import graphqlHTTP from 'express-graphql';
import schema from './schema';

const app = express();
app.use(webpackMiddleware(webpack(webpackConfig)));

app.use('/graphql', graphqlHTTP({ schema: schema, graphiql: true }));

app.listen(4000, () => {
  console.log('Started on localhost:4000');
});