package gov.ny.its.hs.maslow.access.dto;

/**
 * Defines a question that is asked the resident. The question also defines a variable that can be
 * referenced by a formula in each service for matching service recommendations to residents.
 */
public class QuestionDto {
  private QuestionTypeDto type;

  /**
   * Gets the question type. The type is used to control rendering.
   */
  public QuestionTypeDto getType() {
    return type;
  }

  /**
   * Sets the value of {@link #getType()}
   */
  public void setType(QuestionTypeDto type) {
    this.type = type;
  }
}
