package com.map;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

/**
 * Application entry point.
 * @EnableScheduling activates Spring's cron/fixed-rate task infrastructure,
 * so @Scheduled methods (e.g. trending recalculation) actually run.
 */
@SpringBootApplication
@EnableScheduling
public class App
{
    public static void main( String[] args )
    {
        SpringApplication.run(App.class, args);
        System.out.printf("server started...");
    }
}
