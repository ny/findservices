package gov.ny.its.hs.maslow.author.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import java.time.Instant;
import java.util.List;
import java.util.Map;
import lombok.Builder;
import lombok.Data;
import lombok.Singular;
import org.bson.types.ObjectId;
import org.springframework.data.annotation.Id;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.mongodb.core.mapping.Document;

/**
 * Represents a collection of services as an array of ranked service keys and a map of services.
 * This is the format that is used by Maslow Access. Each time an edit is made in Maslow Author, a
 * snapshot in this format is created in the FIND_SERVICES.servicesSnapshots collection. That
 * collection maintains a history of all edits in a MongoDB capped collection. These snapshots are
 * never modified and are effectively immutable.
 */
@Builder(toBuilder = true)
@Data
@Document("servicesSnapshots")
public class SnapshotDocument {
  @Id
  @JsonIgnore
  private final ObjectId id;

  /**
   * The date when the snapshot was created.
   */
  @Builder.Default
  @LastModifiedDate
  private Instant created = Instant.now();

  /**
   * An array of service keys in order of their rank.
   */
  @Singular("rankEntry")
  private List<String> rank;

  /**
   * A map of {@link SnapshotService} objects indexed by their key.
   */
  @Singular
  private Map<String, SnapshotService> services;
}
