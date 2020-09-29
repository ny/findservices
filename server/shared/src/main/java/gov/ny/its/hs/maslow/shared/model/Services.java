package gov.ny.its.hs.maslow.shared.model;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import javax.validation.constraints.NotEmpty;
import org.springframework.validation.annotation.Validated;

/**
 * Defines a subset of the catalog that defines services. This is used as a configuration object
 * when loading the services from an external JSON file.
 */
@Validated
public class Services {
  @NotEmpty
  private List<String> rank = new ArrayList<>();

  @NotEmpty
  private Map<String, Service> services = new HashMap<>();

  /**
   * Gets an array of service keys that represents the priority order for recommending services to
   * residents.
   */
  public List<String> getRank() {
    return rank;
  }

  /**
   * Sets the value for {@link #getRank()}
   */
  public void setRank(List<String> rank) {
    this.rank = rank;
  }

  /**
   * Gets the dictionary of all services that we can recommend to residents.
   *
   * The dictionary maps a service key (such as "DOL_UI") to a {@link Service}.
   *
   * All keys must match the pattern /^[A-Z][A-Z0-9_]+$/.
   */
  public Map<String, Service> getServices() {
    return services;
  }

  /**
   * Sets the value for {@link #getServices()}
   */
  public void setServices(Map<String, Service> services) {
    this.services = services;
  }
}
