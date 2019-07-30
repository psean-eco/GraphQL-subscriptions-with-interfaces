const { ApolloServer } = require("apollo-server");

const UserAPI = require("./data/datasource");
const typeDefs = require("./data/schema");
const resolvers = require("./data/resolvers");

const server = new ApolloServer({
  typeDefs,
  resolvers,
  dataSources: () => ({ usersAPI: new UserAPI() })
});

server.listen().then(({ url }) => {
  console.log(`🚀 Server ready at ${url}`);
});
