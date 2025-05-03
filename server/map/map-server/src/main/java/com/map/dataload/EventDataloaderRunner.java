package com.map.dataload;

import org.mybatis.spring.annotation.MapperScan;
import org.springframework.boot.WebApplicationType;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.builder.SpringApplicationBuilder;
import org.springframework.context.ConfigurableApplicationContext;

@SpringBootApplication
@MapperScan("com.map.mapper") // Scan your mapper interfaces
public class EventDataloaderRunner {
  public static void main(String[] args) {
    // Start Spring in non-web mode
    ConfigurableApplicationContext context =
        new SpringApplicationBuilder(EventDataloaderRunner.class)
            .web(WebApplicationType.NONE)
            .run(args);

    // Run your loader
    EventDataloader loader = context.getBean(EventDataloader.class);
    loader.loadData();

    // Cleanup
    context.close();
  }
}