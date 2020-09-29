package gov.ny.its.hs.maslow.access;

import org.junit.jupiter.api.Test;
import org.springframework.boot.test.autoconfigure.data.mongo.DataMongoTest;
import org.springframework.context.annotation.Import;

@DataMongoTest
@Import(MaslowAccessApplication.class)
class MaslowAccessApplicationTests {

  @Test
  void contextLoads() {}
}
