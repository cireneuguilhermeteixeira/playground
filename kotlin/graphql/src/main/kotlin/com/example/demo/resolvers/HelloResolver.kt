package com.example.demo.resolvers

import org.springframework.graphql.data.method.annotation.QueryMapping
import org.springframework.stereotype.Controller


@Controller
class HelloWorldResolver {
    @QueryMapping
    fun hello(): String {
        return "Hello, GraphQL with Kotlin and Spring Boot!"
    }
}