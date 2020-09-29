package gov.ny.its.hs.maslow.author.service;

import gov.ny.its.hs.maslow.author.model.ServiceDocument;
import gov.ny.its.hs.maslow.author.model.SnapshotDocument;
import java.util.Arrays;
import java.util.List;
import java.util.stream.Collectors;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.annotation.Profile;
import org.springframework.data.mongodb.core.MongoOperations;
import org.springframework.data.mongodb.core.aggregation.Aggregation;
import org.springframework.data.mongodb.core.aggregation.TypedAggregation;
import org.springframework.data.mongodb.core.mapping.event.AbstractMongoEventListener;
import org.springframework.data.mongodb.core.mapping.event.AfterSaveEvent;
import org.springframework.stereotype.Service;

/**
 * Defines a service that creates services snapshots in the database anytime the singleton
 * ServiceDocument is saved.
 *
 * Note that this service is currently disabled for the `test` profile. Unfortunately, the embedded
 * MongoDB we use [has not been
 * updated](https://github.com/flapdoodle-oss/de.flapdoodle.embed.mongo/issues/314) in nearly two
 * years and [does not
 * support](https://github.com/flapdoodle-oss/de.flapdoodle.embed.mongo/issues/295) the version of
 * MongoDB we use (MongoDB v4.4), let alone the minimum MongoDB version this code requires (MongoDB
 * v4.2). Enabling this service causes *all* tests marked with @SpringBootTest to fail. So while
 * this code survives manually testing and seems to work fine, we are not currently able to write
 * automated tests for it.
 */
@Service
@Slf4j
@Profile("!test")
public class SnapshotAggregationService extends AbstractMongoEventListener<ServiceDocument> {
  /**
   * The array of aggregation operations that produces a snapshot. While it is theoretically
   * possible to translate these operations to more Java-like Spring Data operations, it is truly
   * painful to do so. Instead we feed each operation one-by-one into {@link JsonAggregationOperation}
   * which parses the text of the operation and returns an {@link Aggregation} object.
   */
  private static final List<String> AGGREGATION_OPERATIONS = Arrays.asList(
    "{ $match: { _id: \"0\" } }",
    "{ $project: { \"services\": { $objectToArray: \"$services\" } } }",
    "{ $unwind: \"$services\" }",
    "{ $sort: { \"services.v.rank\": 1 } }",
    "{ $unset: [ \"_id\", \"services.v._id\", \"services.v.modified\", \"services.v.resourceVersions\" ] }",
    "{ $facet: { " +
    "rank: [ { $group: { _id: 0, rank: { $push: \"$services.k\" } } } ], " +
    "services: [ { $unset: \"services.v.rank\" }, { $group: { _id: 0, services: { $push: \"$services\" } } }, { $project: { \"services\": { $arrayToObject: \"$services\" } } } ] " +
    "} }",
    "{ $project: { rank: { $first: \"$rank.rank\" }, services: { $first: \"$services.services\" } } }"
  );

  /** The configured MongoOperations for database operations */
  private final MongoOperations mongo;

  /**
   * Constructs the {@link SnapshotAggregationService} component.
   *
   * @param mongoOperations the MongoOperations for database operations; injected by Spring Boot.
   */
  public SnapshotAggregationService(MongoOperations mongoOperations) {
    super();
    this.mongo = mongoOperations;
  }

  /**
   * Registers an event handler that creates a snapshot anytime the singleton
   * {@link ServiceDocument} is saved.
   */
  @Override
  public void onAfterSave(AfterSaveEvent<ServiceDocument> event) {
    createSnapshot();
  }

  /**
   * Creates a snapshot.
   */
  public SnapshotDocument createSnapshot() {
    log.debug("createSnapshot");

    TypedAggregation<ServiceDocument> aggregation = Aggregation.newAggregation(
      ServiceDocument.class,
      AGGREGATION_OPERATIONS
        .stream()
        .map(o -> new JsonAggregationOperation(o))
        .collect(Collectors.toList())
    );

    SnapshotDocument snapshot = mongo
      .aggregate(aggregation, SnapshotDocument.class)
      .getUniqueMappedResult();

    SnapshotDocument document = mongo.save(snapshot);
    return document;
  }
}
