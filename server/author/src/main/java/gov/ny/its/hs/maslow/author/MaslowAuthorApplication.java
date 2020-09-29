package gov.ny.its.hs.maslow.author;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.data.mongodb.config.EnableMongoAuditing;

@SpringBootApplication(scanBasePackages = "gov.ny.its.hs.maslow")
@EnableMongoAuditing
public class MaslowAuthorApplication {

  public static void main(String[] args) {
    SpringApplication.run(MaslowAuthorApplication.class, args);
  }
}
