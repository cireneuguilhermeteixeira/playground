package com.example.demo.config

import com.example.demo.exception.UserNotFoundException
import com.example.demo.exception.InvalidInputException
import graphql.GraphQLError
import graphql.GraphqlErrorBuilder
import graphql.schema.DataFetchingEnvironment
import org.springframework.graphql.execution.DataFetcherExceptionResolverAdapter
import org.springframework.stereotype.Component

@Component
class GraphQLExceptionHandler : DataFetcherExceptionResolverAdapter() {

    override fun resolveToSingleError(ex: Throwable, env: DataFetchingEnvironment): GraphQLError {
        return when (ex) {
            is UserNotFoundException -> GraphqlErrorBuilder.newError()
                .message(ex.message ?: "User not found")
                .path(env.executionStepInfo.path)
                .extensions(mapOf("code" to "USER_NOT_FOUND"))
                .build()

            is InvalidInputException -> GraphqlErrorBuilder.newError()
                .message(ex.message ?: "Invalid input provided")
                .path(env.executionStepInfo.path)
                .extensions(mapOf("code" to "INVALID_INPUT"))
                .build()

            else -> GraphqlErrorBuilder.newError()
                .message("Internal server error")
                .path(env.executionStepInfo.path)
                .extensions(mapOf("code" to "INTERNAL_SERVER_ERROR"))
                .build()
        }
    }
}
