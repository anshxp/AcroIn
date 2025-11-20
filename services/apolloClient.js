// services/apolloClient.js
import { ApolloClient, InMemoryCache, createHttpLink, ApolloLink } from '@apollo/client';
import { setContext } from '@apollo/client/link/context';
import AsyncStorage from '@react-native-async-storage/async-storage';

const GRAPHQL_URL = process.env.EXPO_PUBLIC_API_URL || 'http://192.168.1.7:7852/graphql';

const httpLink = createHttpLink({ uri: GRAPHQL_URL });

const authLink = setContext(async (_, { headers }) => {
  const token = await AsyncStorage.getItem('token');
  return { headers: { ...headers, authorization: token ? `Bearer ${token}` : '' } };
});

const client = new ApolloClient({ link: ApolloLink.from([authLink, httpLink]), cache: new InMemoryCache() });
export default client;
