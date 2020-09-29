package gov.ny.its.hs.maslow.shared.model;

import java.util.HashMap;
import java.util.Map;
import javax.validation.constraints.NotEmpty;

/**
 * Defines the section of a survey. Each survey is comprised of one or more sections. The sections may
 * be rendered as separate pages or survey groups.
 */
public class Section implements ResourcesProvider<SectionResources> {
  @NotEmpty
  private Map<String, SectionResources> resources = new HashMap<>();

  /**
   * Gets the resource bundle for text that needs to be translated for this section. Maps a locale
   * identifier (such as "en" or "es") to a {@link SectionResources}.
   */
  public Map<String, SectionResources> getResources() {
    return resources;
  }

  /**
   * Sets the value of {@link #getResources()}
   */
  public void setResources(Map<String, SectionResources> resources) {
    this.resources = resources;
  }
}
