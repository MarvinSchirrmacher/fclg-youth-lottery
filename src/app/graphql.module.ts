import {NgModule} from '@angular/core';
import {ApolloModule, APOLLO_OPTIONS} from 'apollo-angular';
import {ApolloClientOptions, InMemoryCache} from '@apollo/client/core';
import {HttpLink} from 'apollo-angular/http';
import { AuthService } from './auth.service';

const uri = 'https://eu-central-1.aws.realm.mongodb.com/api/client/v2.0/app/fclg-youth-lottery-nmhhi/graphql'; // <-- add the URL of the GraphQL server here
export function createApollo(httpLink: HttpLink, authService: AuthService): ApolloClientOptions<any> {
  return {
    link: httpLink.create({
      uri: uri,
      withCredentials: true
    }),
    cache: new InMemoryCache(),
    headers: {
      Authorization: `Bearer ${authService.getAccessToken()}`
    }
  };
}

@NgModule({
  exports: [ApolloModule],
  providers: [
    {
      provide: APOLLO_OPTIONS,
      useFactory: createApollo,
      deps: [HttpLink, AuthService],
    },
  ],
})
export class GraphQLModule {}
