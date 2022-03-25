import { NgModule } from '@angular/core'
import { ApolloClientOptions, ApolloLink, InMemoryCache } from '@apollo/client/core'
import { setContext } from '@apollo/client/link/context'
import { onError } from "@apollo/client/link/error";
import { ApolloModule, APOLLO_OPTIONS } from 'apollo-angular'
import { HttpLink } from 'apollo-angular/http'
import { AuthService } from './service/auth.service'

const uri = 'https://eu-central-1.aws.realm.mongodb.com/api/client/v2.0/app/fclg-youth-lottery-nmhhi/graphql'

export function createApollo(
    httpLink: HttpLink, authService: AuthService): ApolloClientOptions<any> {
  
  const basicLink = setContext(() => {
    return { headers: { Accept: 'charset=utf-8' } }
  })
  
  let tokenIsValid: boolean = false
  const withToken = setContext(() => {
    if (tokenIsValid)
      return createAuthorizationHeader(authService.accessToken)

    return authService.refreshAccessToken()
      .then(() => createAuthorizationHeader(authService.accessToken))
  })

  const resetToken = onError(({ networkError }) => {
    if (
      networkError &&
      networkError.name ==='HttpErrorResponse' // &&
      // networkError.status === 401
    ) {
      tokenIsValid = false
    }
  })

  const authFlowLink = withToken.concat(resetToken)

  return {
    link: ApolloLink.from([basicLink, authFlowLink, httpLink.create({ uri })]),
    cache: new InMemoryCache()
  }
}

function createAuthorizationHeader(token: string | null): any {
  return { headers: { authorization: token ? `Bearer ${token}` : '' } }
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
