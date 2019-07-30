const { PubSub, withFilter } = require("apollo-server");
const channels = require("./data");

let nextId = 3;
let nextMessageId = 5;

const CHANNEL_ADDED = "CHANNEL_ADDED";

const pubsub = new PubSub();

const resolvers = {
  Query: {
    channels: () => {
      return channels;
    },
    channel: (root, { id }) => {
      return channels.find(channel => channel.id === id);
    },
    getUsers: async (_source, _args, { dataSources }) => {
      return dataSources.usersAPI.getUsers();
    }
  },
  Mutation: {
    addChannel: (root, args) => {
      const newChannel = {
        id: String(nextId++),
        messages: [],
        name: args.name
      };
      newChannel.channelB = "test";
      console.log("this is a new channel", newChannel);
      channels.push(newChannel);

      pubsub.publish(CHANNEL_ADDED, { channelAdded: newChannel });
      return newChannel;
    },
    addMessage: (root, { message }) => {
      const channel = channels.find(
        channel => channel.id === message.channelId
      );
      if (!channel) throw new Error("Channel does not exist");

      const newMessage = { id: String(nextMessageId++), text: message.text };
      channel.messages.push(newMessage);

      pubsub.publish("messageAdded", {
        messageAdded: newMessage,
        channelId: message.channelId
      });

      return newMessage;
    }
  },
  Subscription: {
    messageAdded: {
      subscribe: withFilter(
        () => pubsub.asyncIterator("messageAdded"),
        (payload, variables) => {
          // The `messageAdded` channel includes events for all channels, so we filter to only
          // pass through events for the channel specified in the query
          return payload.channelId === variables.channelId;
        }
      )
    },
    channelAdded: {
      subscribe: () => pubsub.asyncIterator([CHANNEL_ADDED])
    },
    channelInterfaceAdded: {
      subscribe: () => pubsub.asyncIterator([CHANNEL_ADDED]),
      resolve: async obj => {
        console.log("this is ob", { obj });
        // filter doesn't return parsed value so need to parse again
        return obj.channelAdded;
      }
    }
  },
  ChannelInterface: {
    __resolveType: root => {
      console.log({ root });
      return root.channelA ? "ChannelA" : "ChannelB";
    }
  }
};

module.exports = resolvers;
