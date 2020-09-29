package gov.ny.its.hs.maslow.shared.model;

import java.util.HashMap;
import java.util.Map;
import javax.validation.constraints.NotEmpty;
import javax.validation.constraints.NotNull;

/**
 * Defines a question that is asked the resident. The question also defines a variable that can be
 * referenced by a formula in each service for matching service recommendations to residents.
 */
public class Question implements ResourcesProvider<QuestionResources> {
  @NotNull
  private QuestionType type;

  @NotEmpty
  private Map<String, QuestionResources> resources = new HashMap<>();

  /**
   * Gets the question type. The type is used to control rendering.
   */
  public QuestionType getType() {
    return type;
  }

  /**
   * Sets the value of {@link #getType()}
   */
  public void setType(QuestionType type) {
    this.type = type;
  }

  /**
   * Gets the resource bundle for text that needs to be translated for this
   * question. Maps a locale identifier (such as "en" or "es") to a
   * {@link QuestionResources}.
   */
  public Map<String, QuestionResources> getResources() {
    return resources;
  }

  /**
   * Sets the value of {@link #getResources()}
   */
  public void setResources(Map<String, QuestionResources> resources) {
    this.resources = resources;
  }
}
