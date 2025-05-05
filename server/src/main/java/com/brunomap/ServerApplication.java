package com.brunomap;

import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.autoconfigure.jackson.Jackson2ObjectMapperBuilderCustomizer;
import org.springframework.context.annotation.Bean;

/**
 * Like Server.main() in Spark, which needs to be started manually where SprintBoot autoconfigures
 * the server
 */
@SpringBootApplication
public class ServerApplication {

  public static void main(String[] args) {
    SpringApplication.run(ServerApplication.class, args);
    System.out.println(
        "Server running on http://localhost:8080"); // spring boot auto runs on port 8080
  }

  @Bean
  public Jackson2ObjectMapperBuilderCustomizer addJavaTimeModule() {
    return builder -> builder.modules(new JavaTimeModule());
  }

  // @Bean
  // public Jackson2ObjectMapperBuilderCustomizer customizer() {
  // return builder -> builder.propertyNamingStrategy(PropertyNamingStrategies.SNAKE_CASE);
  // }

}
