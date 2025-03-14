package com.example.demo.resolvers

import com.example.demo.model.User
import com.example.demo.exception.UserNotFoundException // Importação da exceção personalizada
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
    private val users = mutableListOf<User>()  // Lista mutável de usuários
    private var idCounter = 1L  // Simulação de IDs incrementais

    // Retorna todos os usuários
    @QueryMapping
    @Cacheable("users")
    fun users(): List<User> = users

    // Retorna um usuário específico ou lança um erro caso não exista
    @QueryMapping
    @Cacheable(value = ["user"], key = "#id")
    fun user(@Argument id: Long): User {
        return users.find { it.id == id }
            ?: throw UserNotFoundException("User with ID $id not found") // Lançando exceção personalizada
    }

    // Cria um novo usuário
    @MutationMapping
    @CachePut(value = ["user"], key = "#result.id")
    @CacheEvict(value = ["users"], allEntries = true)
    fun createUser(@Argument name: String, @Argument email: String): User {
        val newUser = User(id = idCounter++, name = name, email = email)
        users.add(newUser)
        return newUser
    }

    // Atualiza um usuário existente
    @MutationMapping
    @CachePut(value = ["user"], key = "#id")
    @CacheEvict(value = ["users"], allEntries = true)
    fun updateUser(@Argument id: Long, @Argument name: String?, @Argument email: String?): User? {
        val existingUser = users.find { it.id == id }
            ?: throw UserNotFoundException("User with ID $id not found") // Exceção se o usuário não existir

        existingUser.apply {
            if (name != null) this.name = name
            if (email != null) this.email = email
        }

        return existingUser
    }

    // Deleta um usuário
    @MutationMapping
    @Caching(
        evict = [
            CacheEvict(value = ["user"], key = "#id"),
            CacheEvict(value = ["users"], allEntries = true)
        ]
    )
    fun deleteUser(@Argument id: Long): Boolean {
        val userExists = users.removeIf { it.id == id }
        if (!userExists) throw UserNotFoundException("User with ID $id not found") // Exceção se não encontrar
        return true
    }
}
