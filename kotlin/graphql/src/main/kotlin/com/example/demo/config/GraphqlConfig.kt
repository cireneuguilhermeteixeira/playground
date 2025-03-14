package com.example.demo.config

import graphql.analysis.MaxQueryComplexityInstrumentation
import graphql.analysis.MaxQueryDepthInstrumentation
import graphql.execution.instrumentation.Instrumentation
import org.springframework.context.annotation.Bean
import org.springframework.context.annotation.Configuration

@Configuration
class GraphQLConfig {

    @Bean
    fun queryComplexityInstrumentation(): Instrumentation {
        return MaxQueryComplexityInstrumentation(50)
    }

    @Bean
    fun queryDepthInstrumentation(): Instrumentation {
        return MaxQueryDepthInstrumentation(5)
    }
}