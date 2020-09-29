package gov.ny.its.hs.maslow.author.model;

import java.time.Instant;
import java.util.Map;
import javax.validation.Valid;
import javax.validation.constraints.Min;
import javax.validation.constraints.NotBlank;
import javax.validation.constraints.NotNull;
import javax.validation.constraints.Pattern;
import lombok.Builder;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.Singular;
import org.springframework.data.annotation.Id;
import org.springframework.validation.annotation.Validated;

/**
 * Represents a social service.
 */
@Builder(toBuilder = true)
@Data
@Validated
public class Service {
  static final String RE_KEY = "^[A-Z][A-Z0-9_]+$";
  static final String RE_FORMULA = "^(=[A-Z0-9_,.)(<=>+\\-*/^\\s]+)?$";
  static final String RE_URL = "^(https?://[^\\s$.?#].[^\\s]*)?$";

  /**
   * The key that uniquely identifies the service, such as "SNAP".
   */
  @Id
  @NotBlank
  @Pattern(regexp = RE_KEY)
  private String key;

  /**
   * The rank of the service, which defines the order in which the services are presented to
   * residents.
   *
   * While the stored rank will always be greater than 0, a request to rank a service allows two
   * special sentinel values:
   * -  0 means to insert the service at the head
   * - -1 means to append the service at the tail
   */
  @Min(-1)
  @NotNull
  private Integer rank;

  /**
   * The date when the service was last modified.
   */
  @EqualsAndHashCode.Exclude
  private Instant modified;

  /**
   * A flag that indicates whether the service is available for recommending to residents.
   */
  @NotNull
  private Boolean enabled;

  /**
   * A spreadsheet-style formula that determines if the service should be recommended to residents.
   */
  @Pattern(regexp = RE_FORMULA)
  private String formula;

  /**
   * The URL where residents can apply for the service.
   */
  @Pattern(regexp = RE_URL)
  private String applicationUrl;

  /**
   * The URL where residents can learn more about the service.
   */
  @NotBlank
  @Pattern(regexp = RE_URL)
  private String informationUrl;

  /**
   * A map of {@link ServiceResource} objects identified by {@link ServiceLocales}.
   */
  @NotNull
  @Singular
  private Map<ServiceLocales, @Valid ServiceResource> resources;

  /**
   * A map of resource versions (effectively hashes) identified by {@link ServiceLocales}.
   */
  @Singular
  private Map<ServiceLocales, String> resourceVersions;
}
