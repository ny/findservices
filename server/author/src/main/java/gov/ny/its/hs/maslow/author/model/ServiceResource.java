package gov.ny.its.hs.maslow.author.model;

import javax.validation.constraints.NotBlank;
import lombok.Builder;
import lombok.Data;
import org.springframework.validation.annotation.Validated;

/**
 * Represents the localizable resources of a {@link Service}.
 */
@Builder(toBuilder = true)
@Data
@Validated
public class ServiceResource {
  /**
   * The name of the service.
   */
  @NotBlank
  private String name;

  /**
   * The category of the service.
   */
  @NotBlank
  private String category;

  /**
   * The description of the service.
   */
  @NotBlank
  private String description;

  /**
   * The instructions for applying for the service.
   */
  private String instructions;

  /**
   * The eligibility information for the service.
   */
  private String eligibility;

  /**
   * The preparation that may be required for apply for the service.
   */
  private String preparation;

  /**
   * Returns the version of this resource, in the format of a hexidecimal hash string.
   */
  public String version() {
    return String.format("%08x", this.hashCode());
  }
}
