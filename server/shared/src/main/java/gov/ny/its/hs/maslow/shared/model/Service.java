package gov.ny.its.hs.maslow.shared.model;

import com.google.common.base.Preconditions;
import java.net.URI;
import java.util.HashMap;
import java.util.Map;
import javax.validation.constraints.NotBlank;
import javax.validation.constraints.NotEmpty;
import javax.validation.constraints.Pattern;

/**
 * Defines a service that can be recommended to a resident.
 */
public class Service implements ResourcesProvider<ServiceResources> {
  private Boolean enabled;

  @Pattern(regexp = "^(=.+)?$", message = "Formula must begin with an equals sign.")
  private String formula;

  private String applicationUrl;

  @NotBlank
  private String informationUrl;

  @NotEmpty
  private Map<String, ServiceResources> resources = new HashMap<>();

  /**
   * Gets whether or not this service is enabled for recommendation. A disabled service will not be
   * shown to residents.
   */
  public Boolean getEnabled() {
    return enabled;
  }

  /**
   * Sets the value of {@link #getEnabled()}
   */
  public void setEnabled(Boolean enabled) {
    this.enabled = enabled;
  }

  /**
   * Gets the formula that evaluates whether this service should be recommended to a resident. The
   * formula is defined in a subset of Google Sheet's formula language.
   */
  public String getFormula() {
    return formula;
  }

  /**
   * Sets the value of {@link #getFormula()}
   */
  public void setFormula(String formula) {
    this.formula = formula;
  }

  /**
   * Gets the application URL for this service.
   */
  public String getApplicationUrl() {
    return applicationUrl;
  }

  /**
   * Sets the value of {@link #getApplyUrl(String)}
   */
  public void setApplicationUrl(String applicationUrl) {
    if (applicationUrl != null) {
      Preconditions.checkArgument(URI.create(applicationUrl) != null);
    }
    this.applicationUrl = applicationUrl;
  }

  /**
   * Gets the information URL for this service.
   */
  public String getInformationUrl() {
    return informationUrl;
  }

  /**
   * Sets the value of {@link #getInformationUrl()}
   */
  public void setInformationUrl(String informationUrl) {
    Preconditions.checkArgument(URI.create(informationUrl) != null);
    this.informationUrl = informationUrl;
  }

  /**
   * Gets the resource bundle for text that needs to be translated for this service. Maps a locale
   * identifier (such as "en" or "es") to a {@link ServiceResources}.
   */
  public Map<String, ServiceResources> getResources() {
    return resources;
  }

  /**
   * Sets the value of {@link #getResources()}
   */
  public void setResources(Map<String, ServiceResources> resources) {
    this.resources = resources;
  }
}
