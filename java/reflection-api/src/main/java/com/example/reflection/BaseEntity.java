package com.example.reflection;

public abstract class BaseEntity {

    protected Long id;

    protected BaseEntity() {
        this.id = 0L;
    }

    protected BaseEntity(Long id) {
        this.id = id;
    }

    public Long getId() {
        return id;
    }
}
