package gov.ny.its.hs.maslow.author.config;

import gov.ny.its.hs.maslow.author.model.ServiceDocument;
import java.math.BigInteger;
import java.time.Instant;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.core.Ordered;
import org.springframework.core.annotation.Order;
import org.springframework.data.mongodb.core.CollectionOptions;
import org.springframework.data.mongodb.core.MongoOperations;
import org.springframework.stereotype.Component;

@Component
@Order(Ordered.HIGHEST_PRECEDENCE)
@Slf4j
public class DatabaseInitializeRunner implements ApplicationRunner {
  /** The configured MongoOperations for database operations */
  private final MongoOperations mongo;

  public DatabaseInitializeRunner(MongoOperations mongoOperations) {
    super();
    this.mongo = mongoOperations;
  }

  @Override
  public void run(ApplicationArguments args) throws Exception {
    log.debug("Initializing database: FIND_SERVICES");

    // The FIND_SERVICES.services collection, initialized with the singleton ServiceDocument with
    // _id = 0, is required for the Maslow Author Services API to function.
    if (!mongo.collectionExists(ServiceDocument.class)) {
      // Create collection and singleton document
      ServiceDocument serviceDocument = ServiceDocument
        .builder()
        .id(BigInteger.ZERO)
        .modified(Instant.now())
        .build();
      mongo.save(serviceDocument);

      log.debug("Initialized collection: FIND_SERVICES.services");
    }

    // The FIND_SERVICES.servicesSnapshots collection, initialized as a capped collection with
    // finite size, is required for the Maslow Author Services API to function.
    if (!mongo.collectionExists("servicesSnapshots")) {
      // Create collection
      mongo.createCollection(
        "servicesSnapshots",
        CollectionOptions.empty().capped().size(1000000000).maxDocuments(10000)
      );

      log.debug("Initialized collection: FIND_SERVICES.servicesSnapshots");
    }

    log.info("Initialized database: FIND_SERVICES");
  }
}
