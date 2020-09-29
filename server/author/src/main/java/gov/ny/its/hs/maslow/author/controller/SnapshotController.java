package gov.ny.its.hs.maslow.author.controller;

import gov.ny.its.hs.maslow.author.model.SnapshotDocument;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Sort;
import org.springframework.data.domain.Sort.Direction;
import org.springframework.data.mongodb.core.MongoOperations;
import org.springframework.data.mongodb.core.query.Query;
import org.springframework.http.CacheControl;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

/**
 * Defines a REST controller for Maslow Author that returns the latest snapshot of services data.
 * This API is primarily used by Maslow Access to retrieve the edits made in Maslow Author.
 *
 * The API currently defines the following endpoint:
 * - /api/author/v1/snapshots
 *   - GET: returns the latest snapshot
 */
@RestController
@RequestMapping("api/author/v1/snapshots")
@Slf4j
public class SnapshotController {
  /** The configured MongoOperations for database operations */
  private final MongoOperations mongo;

  /**
   * Constructs the {@link ServiceController} component.
   *
   * @param mongoOperations the MongoOperations for database operations; injected by Spring Boot.
   */
  public SnapshotController(MongoOperations mongoOperations) {
    super();
    this.mongo = mongoOperations;
  }

  /**
   * Returns the latest snapshot of the database. The response format is a {@link SnapshotDocument},
   * which is a subset of {@link Catalog} and is compatible with what Maslow Access expects.
   */
  @GetMapping("latest")
  public ResponseEntity<SnapshotDocument> selectLatestSnapshot() {
    log.debug("Selecting the latest services snapshot...");

    // The maslow.servicesSnapshots collection is configured as a capped collection, meaning it is
    // effectively a fixed-size circular deque. We leverage this fact to efficiently query the tail
    // of the collection by "db.servicesSnapshots.find().sort({$natural: -1}).limit(1)".

    SnapshotDocument document = mongo.findOne(
      new Query().with(Sort.by(Direction.DESC, "$natural")),
      SnapshotDocument.class
    );

    if (document != null) {
      return ResponseEntity
        .ok()
        .cacheControl(CacheControl.noCache())
        .eTag(Integer.toHexString(document.hashCode()))
        .lastModified(document.getCreated())
        .body(document);
    } else {
      log.debug("Snapshot not found.");

      throw new ResponseStatusException(
        HttpStatus.NOT_FOUND,
        "SNAPSHOT_NOT_FOUND: No snapshot of services data was available."
      );
    }
  }
}
