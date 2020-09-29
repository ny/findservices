package gov.ny.its.hs.maslow.author.model;

import java.util.Map;
import lombok.Builder;
import lombok.Data;
import lombok.Singular;

/**
 * Represents a social service in the format appropriate for Maslow Access. This representation is
 * different than the one required by Maslow Author, but it is very similar to the representation in
 * {@link gov.ny.its.hs.maslow.shared.model.Service}. In fact, it could theoretically be merged with
 * that class, but this is currently out of scope.
 */
@Builder(toBuilder = true)
@Data
public class SnapshotService {
  /**
   * A flag that indicates whether the service is available for recommending to residents.
   */
  private Boolean enabled;

  /**
   * A spreadsheet-style formula that determines if the service should be recommended to residents.
   */
  private String formula;

  /**
   * The URL where residents can apply for the service.
   */
  private String applicationUrl;

  /**
   * The URL where residents can learn more about the service.
   */
  private String informationUrl;

  /**
   * A map of {@link ServiceResource} objects identified by {@link ServiceLocales}.
   */
  @Singular
  private Map<ServiceLocales, ServiceResource> resources;
}
