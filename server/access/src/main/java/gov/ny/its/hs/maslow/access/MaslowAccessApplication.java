package gov.ny.its.hs.maslow.access;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

/**
 * Defines the application for Project Maslow and its entrypoint.
 */
@SpringBootApplication(scanBasePackages = { "gov.ny.its.hs.maslow" })
@EnableScheduling
public class MaslowAccessApplication {

  public static void main(String[] args) {
    SpringApplication.run(MaslowAccessApplication.class, args);
  }
}
