package gov.ny.its.hs.maslow.access.dto;

/**
 * Defines a service that can be recommended to a resident.
 */
public class ServiceDto {
  private Boolean enabled;
  private String formula;
  private String applicationUrl;
  private String informationUrl;

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
   * Sets the value of {@link #getApplicationUrl(String)}
   */
  public void setApplicationUrl(String applicationUrl) {
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
    this.informationUrl = informationUrl;
  }
}
