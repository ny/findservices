package gov.ny.its.hs.maslow.access.dto;

/**
 * Defines the question type. The type is used as an instruction to the question renderer.
 */
public enum QuestionTypeDto {
  /**
   * The question response must be a boolean (that is, yes/no, true/false).
   */
  BOOLEAN,

  /**
   * The question response must be a non-negative integer (that is, >= 0). The value will be
   * displayed as a currency in USD.
   */
  CURRENCY,

  /**
   * The question response must be a non-negative integer (that is, >= 0).
   */
  NUMBER,
}
