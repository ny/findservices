package gov.ny.its.hs.maslow.shared.model;

import com.fasterxml.jackson.annotation.JsonInclude;
import com.fasterxml.jackson.annotation.JsonInclude.Include;
import javax.validation.constraints.*;

/**
 * Defines the resource bundle for text that needs to be translated for a service.
 */
@JsonInclude(Include.NON_EMPTY) // Ensures only non-null fields are serialized to JSON.
public class ServiceResources {
  @NotBlank
  private String name;

  @NotBlank
  private String category;

  @NotBlank
  private String description;

  private String instructions;
  private String eligibility;
  private String preparation;

  /**
   * Gets the title of the service.
   */
  public String getName() {
    return name;
  }

  /**
   * Sets the value of {@link #getName()}
   */
  public void setName(String name) {
    this.name = name;
  }

  /**
   * Gets the category of the service (such as "Food" or "Education").
   */
  public String getCategory() {
    return category;
  }

  /**
   * Sets the value of {@link #getCategory()}
   */
  public void setCategory(String category) {
    this.category = category;
  }

  /**
   * Gets a short description of the service.
   */
  public String getDescription() {
    return description;
  }

  /**
   * Sets the value of {@link #getDescription()}
   */
  public void setDescription(String description) {
    this.description = description;
  }

  /**
   * Gets the application instructions of the service.
   */
  public String getInstructions() {
    return instructions;
  }

  /**
   * Sets the value of {@link #getInstructions()}
   */
  public void setInstructions(String instructions) {
    this.instructions = instructions;
  }

  /**
   * Gets the eligibility criteria of the service.
   */
  public String getEligibility() {
    return eligibility;
  }

  /**
   * Sets the value of {@link #getEligibility()}
   */
  public void setEligibility(String eligibility) {
    this.eligibility = eligibility;
  }

  /**
   * Gets the preparation instructions for the service application. For example, "You will need two
   * forms of identification and a recent paystub."
   */
  public String getPreparation() {
    return preparation;
  }

  /**
   * Sets the value of {@link #getPreparation()}
   */
  public void setPreparation(String preparation) {
    this.preparation = preparation;
  }
}
