package gov.ny.its.hs.maslow.shared.model;

import javax.validation.constraints.NotBlank;

/**
 * Defines the resource bundle for text that needs to be translated for a section.
 */
public class SectionResources {
  @NotBlank
  private String title;

  /**
   * Gets the title of the section.
   */
  public String getTitle() {
    return title;
  }

  /**
   * Sets the value of {@link #getTitle()}
   */
  public void setTitle(String title) {
    this.title = title;
  }
}
