package br.com.exemplo.reflection;

import java.lang.reflect.Constructor;
import java.lang.reflect.Field;
import java.lang.reflect.Method;
import java.lang.reflect.Modifier;

public class ReflectionDemo {

    public static void main(String[] args) throws Exception {
        System.out.println("POC - Java Reflection API");
        System.out.println("========================");

        Class<Pessoa> pessoaClass = Pessoa.class;

        explicarConceito();
        inspecionarClasse(pessoaClass);
        criarInstanciaDinamicamente(pessoaClass);
        invocarMetodos(pessoaClass);
        modificarCamposPrivados(pessoaClass);
    }

    private static void explicarConceito() {
        System.out.println("\n1. O que eh Reflection API?");
        System.out.println("Reflection eh a capacidade de inspecionar e manipular classes, metodos, campos e construtores em tempo de execucao.");
        System.out.println("Em vez de depender apenas do codigo compilado de forma estatica, voce consegue descobrir detalhes da classe dinamicamente.");

        System.out.println("\n2. Em que contexto isso eh usado no Java?");
        System.out.println("- Frameworks como Spring, Hibernate e Jackson");
        System.out.println("- Injecao de dependencia");
        System.out.println("- Mapeamento objeto-relacional");
        System.out.println("- Serializacao e desserializacao");
        System.out.println("- Ferramentas de teste, proxies e plugins");
        System.out.println("Uso com cuidado: reflection reduz encapsulamento, pode ser mais lenta e dificulta manutencao quando usada em excesso.");
    }

    private static void inspecionarClasse(Class<Pessoa> pessoaClass) {
        System.out.println("\n3. Inspecao de metadados");
        System.out.println("Nome da classe: " + pessoaClass.getName());

        System.out.println("\nCampos declarados:");
        for (Field field : pessoaClass.getDeclaredFields()) {
            System.out.println("- " + field.getName() + " (" + field.getType().getSimpleName() + ")");
        }

        System.out.println("\nMetodos declarados:");
        for (Method method : pessoaClass.getDeclaredMethods()) {
            System.out.println("- " + method.getName() + " | modificadores: " + Modifier.toString(method.getModifiers()));
        }
    }

    private static void criarInstanciaDinamicamente(Class<Pessoa> pessoaClass) throws Exception {
        System.out.println("\n4. Criacao dinamica com Constructor");
        Constructor<Pessoa> constructor = pessoaClass.getConstructor(String.class, int.class);
        Pessoa pessoa = constructor.newInstance("Ana", 28);
        System.out.println("Instancia criada: " + pessoa.apresentar());
    }

    private static void invocarMetodos(Class<Pessoa> pessoaClass) throws Exception {
        System.out.println("\n5. Uso de invoke");
        Pessoa pessoa = new Pessoa("Bruno", 32);

        Method metodoPublico = pessoaClass.getMethod("apresentar");
        String retornoPublico = (String) metodoPublico.invoke(pessoa);
        System.out.println("invoke em metodo publico: " + retornoPublico);

        Method metodoPrivado = pessoaClass.getDeclaredMethod("mensagemPrivada", String.class);
        metodoPrivado.setAccessible(true);
        String retornoPrivado = (String) metodoPrivado.invoke(pessoa, "DEBUG");
        System.out.println("invoke em metodo privado: " + retornoPrivado);

        System.out.println("invoke executa um metodo dinamicamente em tempo de execucao.");
    }

    private static void modificarCamposPrivados(Class<Pessoa> pessoaClass) throws Exception {
        System.out.println("\n6. Modify: alterando campo privado");
        Pessoa pessoa = new Pessoa("Carla", 19);
        System.out.println("Antes da alteracao: " + pessoa.apresentar());

        Field fieldNome = pessoaClass.getDeclaredField("nome");
        fieldNome.setAccessible(true);
        fieldNome.set(pessoa, "Carla Atualizada");

        Field fieldIdade = pessoaClass.getDeclaredField("idade");
        fieldIdade.setAccessible(true);
        fieldIdade.setInt(pessoa, 20);

        System.out.println("Depois da alteracao: " + pessoa.apresentar());
        System.out.println("Field.set(...) e variantes como setInt(...) permitem modificar atributos dinamicamente.");
    }
}
