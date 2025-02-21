# Graphql with Kotlin

POC with the aim of studying how graphql works and its functionalities. The kotlin language was used.

Creating a user
```
mutation {
  createUser(name: "Alice", email: "alice@example.com") {
    id
    name
    email
  }
}
```

![image](https://github.com/user-attachments/assets/8707b73e-3377-4e76-a4fb-ef600decca5f)


Getting all users, in this case, we can specify which parameters we want to receive. 
```
query {
  users {
    id
    name
    email
  }
}
```
![image](https://github.com/user-attachments/assets/eafa234c-cd56-41b8-a972-50ce5c5967fb)
![image](https://github.com/user-attachments/assets/7213139d-fd0c-4ecf-ac2a-4a8abee71f65)


Updating a user
```
mutation {
  updateUser(id: "1", name: "Alice Updated") {
    id
    name
    email
  }
}
```
![image](https://github.com/user-attachments/assets/3c0d0b42-bb82-4b07-8bec-c59506c22e80)

Delete user
```
mutation {
  deleteUser(id: "1")
}
```

![image](https://github.com/user-attachments/assets/f2767dc2-9a80-452c-9ca2-670811987eb8)



