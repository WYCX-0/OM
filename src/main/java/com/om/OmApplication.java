package com.om;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@EnableScheduling
@SpringBootApplication
public class OmApplication {

	public static void main(String[] args) {
		SpringApplication.run(OmApplication.class, args);
	}

}
