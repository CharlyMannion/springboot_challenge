package com.charlymannion.ChitterJava;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

@Component
public class DatabaseLoader implements CommandLineRunner {

    private final PeepRepository repository;

    @Autowired
    public DatabaseLoader(PeepRepository repository) {
        this.repository = repository;
    }

    @Override
    public void run(String... strings) throws Exception {
        this.repository.save(new Peep("Peep peep peep"));
        this.repository.save(new Peep("Peep me some glitter mate"));
        this.repository.save(new Peep("Peep peep GLITTER"));

    }
}
