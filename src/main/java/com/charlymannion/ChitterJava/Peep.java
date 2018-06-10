package com.charlymannion.ChitterJava;

import lombok.Data;

import javax.persistence.Entity;
import javax.persistence.GeneratedValue;
import javax.persistence.Id;

@Data
@Entity

public class Peep {
    private @Id @GeneratedValue Long id;
    private String content;

    private Peep() {}

    public Peep(String content) {
        this.content = content;
    }
}
