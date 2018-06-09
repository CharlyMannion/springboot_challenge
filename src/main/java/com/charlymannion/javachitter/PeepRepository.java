package com.charlymannion.javachitter;

import com.charlymannion.javachitter.Peep;
import org.springframework.data.repository.CrudRepository;

public interface PeepRepository extends CrudRepository<Peep, Long> {

}