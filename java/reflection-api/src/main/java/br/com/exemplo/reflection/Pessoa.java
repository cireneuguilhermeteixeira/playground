package br.com.exemplo.reflection;

public class Pessoa {

    private String nome;
    private int idade;

    public Pessoa(String nome, int idade) {
        this.nome = nome;
        this.idade = idade;
    }

    public String apresentar() {
        return "Ola, meu nome eh " + nome + " e tenho " + idade + " anos.";
    }

    private String mensagemPrivada(String prefixo) {
        return prefixo + ": acesso a metodo privado via reflection";
    }
}
