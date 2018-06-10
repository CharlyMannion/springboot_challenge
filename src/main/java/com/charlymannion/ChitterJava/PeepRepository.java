package com.charlymannion.ChitterJava;

import com.charlymannion.ChitterJava.Peep;
import org.springframework.data.repository.CrudRepository;
import org.springframework.data.repository.PagingAndSortingRepository;

public interface PeepRepository extends PagingAndSortingRepository<Peep, Long> {

}