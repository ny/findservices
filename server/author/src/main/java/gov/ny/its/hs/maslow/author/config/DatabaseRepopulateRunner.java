package gov.ny.its.hs.maslow.author.config;

import com.fasterxml.jackson.databind.ObjectMapper;
import gov.ny.its.hs.maslow.author.model.ServiceDocument;
import java.io.InputStream;
import java.math.BigInteger;
import java.time.Instant;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.context.annotation.Profile;
import org.springframework.data.mongodb.core.MongoOperations;
import org.springframework.stereotype.Component;

@Component
@Profile("repopulate")
@Slf4j
public class DatabaseRepopulateRunner implements ApplicationRunner {
  /** The resource location of the JSON used to repopulate the database */
  private static final String SERVICE_DOCUMENT_JSON_RESOURCE = "ServiceDocument.json";

  /** The configured MongoOperations for database operations */
  private final MongoOperations mongo;

  /** The configured ObjectMapper for loading JSON from a file */
  private final ObjectMapper mapper;

  public DatabaseRepopulateRunner(MongoOperations mongoOperations, ObjectMapper objectMapper) {
    super();
    this.mongo = mongoOperations;
    this.mapper = objectMapper;
  }

  @Override
  public void run(ApplicationArguments args) throws Exception {
    log.debug("Repopulating database: FIND_SERVICES");

    InputStream jsonStream = getClass()
      .getClassLoader()
      .getResourceAsStream(SERVICE_DOCUMENT_JSON_RESOURCE);
    ServiceDocument serviceDocument = mapper.readValue(jsonStream, ServiceDocument.class);
    serviceDocument.normalizeServiceRanks();
    serviceDocument.setId(BigInteger.ZERO);
    serviceDocument.setModified(Instant.now());
    serviceDocument.resetServiceResourceVersions();

    mongo.dropCollection(ServiceDocument.class);
    mongo.save(serviceDocument);

    log.debug("Repopulated collection: FIND_SERVICES.services");

    // TODO(marcja): update servicesSnapshot too

    log.info("Repopulated database: FIND_SERVICES");
  }
}
