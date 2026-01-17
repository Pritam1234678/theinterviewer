package com.example.theinterviewer;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableAsync;

@SpringBootApplication
@EnableAsync
@org.springframework.scheduling.annotation.EnableScheduling
public class TheinterviewerApplication {

	public static void main(String[] args) {
		SpringApplication.run(TheinterviewerApplication.class, args);
	}

}
