# POC Java Reflection API

Esta POC mostra, de forma simples, o que eh a Reflection API no Java e como ela funciona na pratica.

## O que eh Reflection API

Reflection eh um recurso do Java que permite inspecionar e manipular classes em tempo de execucao. Com ela, eh possivel descobrir:

- nome da classe
- campos
- metodos
- construtores
- anotacoes
- modificadores de acesso

Tambem eh possivel executar metodos dinamicamente e alterar valores de campos, inclusive privados, quando o codigo usa `setAccessible(true)`.

## Em que contexto isso eh usado

Reflection aparece bastante em bibliotecas e frameworks, por exemplo:

- `Spring`: injecao de dependencia e descoberta de componentes
- `Hibernate`: mapeamento entre objetos Java e tabelas
- `Jackson`: serializacao e desserializacao de objetos
- frameworks de teste: descoberta automatica de classes e metodos
- sistemas de plugin/proxy: carga dinamica de comportamento

## Conceitos principais

### 1. Inspecao

Voce pode obter informacoes da classe usando `Class`, `Field`, `Method` e `Constructor`.

### 2. Invoke

`Method.invoke(...)` permite chamar um metodo dinamicamente.

Exemplos no projeto:

- chamar um metodo publico: `apresentar()`
- chamar um metodo privado: `mensagemPrivada(String)`

### 3. Modify

Para alterar atributos dinamicamente, use `Field`.

Exemplos no projeto:

- `field.set(...)`
- `field.setInt(...)`

Isso modifica o estado do objeto mesmo sem acessar o atributo diretamente pelo codigo normal.

## Estrutura

- `src/main/java/br/com/exemplo/reflection/Pessoa.java`
- `src/main/java/br/com/exemplo/reflection/ReflectionDemo.java`

## Como executar

Se o Maven estiver instalado:

```bash
mvn compile exec:java
```

## O que a demo faz

1. Explica o conceito de reflection
2. Lista campos e metodos da classe `Pessoa`
3. Cria um objeto dinamicamente via construtor
4. Executa metodos com `invoke`
5. Modifica campos privados com `Field.set`

## Observacao importante

Reflection eh poderosa, mas deve ser usada com criterio:

- reduz encapsulamento
- pode ter custo de performance
- pode deixar o codigo mais dificil de entender e manter

Em geral, o uso direto em regra de negocio comum deve ser evitado. Ela faz mais sentido em frameworks, infraestrutura e bibliotecas.
