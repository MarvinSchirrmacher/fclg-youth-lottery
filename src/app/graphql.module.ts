import { NgModule } from '@angular/core';
import { ApolloClientOptions, ApolloLink, InMemoryCache } from '@apollo/client/core';
import { setContext } from '@apollo/client/link/context';
import { ApolloModule, APOLLO_OPTIONS } from 'apollo-angular';
import { HttpLink } from 'apollo-angular/http';
import { AuthService } from './auth.service';

const uri = 'https://eu-central-1.aws.realm.mongodb.com/api/client/v2.0/app/fclg-youth-lottery-nmhhi/graphql';
export function createApollo(httpLink: HttpLink, authService: AuthService): ApolloClientOptions<any> {
  console.log('create apollo');
  const basic = setContext((_operation, _context) => ({
    headers: { Accept: 'charset=utf-8' }
  }));

  const auth = setContext((_operation, _context) => {
    const token = authService.accessToken;
    return token === null
      ? {}
      : { headers: { Authorization: `JWT ${token}` }
    }
  });

  return {
    link: ApolloLink.from([basic, auth, httpLink.create({ uri })]),
    cache: new InMemoryCache()
  }
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
