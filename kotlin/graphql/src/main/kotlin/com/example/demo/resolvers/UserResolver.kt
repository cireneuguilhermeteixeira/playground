package com.example.demo.resolvers

import com.example.demo.model.User
import org.springframework.cache.annotation.CacheEvict
import org.springframework.cache.annotation.CachePut
import org.springframework.cache.annotation.Cacheable
import org.springframework.cache.annotation.Caching
import org.springframework.graphql.data.method.annotation.Argument
import org.springframework.graphql.data.method.annotation.MutationMapping
import org.springframework.graphql.data.method.annotation.QueryMapping
import org.springframework.stereotype.Controller

@Controller
class UserResolver {
    private val users = mutableListOf<User>()  // List mutable of users
    private var idCounter = 1L  // Emulating incremental IDs

    // Return all users
    @QueryMapping
    @Cacheable("users")
    fun users(): List<User> = users

    // Return a specific user
    @QueryMapping
    @Cacheable(value = ["user"], key = "#id")
    fun user(id: Long): User? = users.find { it.id == id }

    // Create a new user
    @MutationMapping
    @CachePut(value = ["user"], key = "#result.id")
    @CacheEvict(value = ["users"], allEntries = true)
    fun createUser(@Argument name: String, @Argument email: String): User {
        val newUser = User(id = idCounter++, name = name, email = email)
        users.add(newUser)
        return newUser
    }

    // Update an existing user
    @MutationMapping
    @CachePut(value = ["user"], key = "#id")
    @CacheEvict(value = ["users"], allEntries = true)
    fun updateUser(@Argument id: Long, @Argument name: String?, @Argument email: String?): User? {
        val existingUser = users.find { it.id == id }

        existingUser?.apply {
            if (name != null) this.name = name
            if (email != null) this.email = email
        }

        return existingUser
    }

    // Delete an user
    @MutationMapping
    @Caching(
        evict = [
            CacheEvict(value = ["user"], key = "#id"),
            CacheEvict(value = ["users"], allEntries = true)
        ]
    )
    fun deleteUser(@Argument id: Long): Boolean = users.removeIf { it.id == id }
}