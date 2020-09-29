package gov.ny.its.hs.maslow.access.dto;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * Defines the catalog of questions and services that drive the business logic of the application.
 */
public class CatalogDto {
  private List<Map<String, List<String>>> survey = new ArrayList<>();

  private Map<String, QuestionDto> questions = new HashMap<>();

  private List<String> rank = new ArrayList<>();

  private Map<String, ServiceDto> services = new HashMap<>();

  /**
   * Gets the structure definition of the survey. A survey is comprised of one or more sections where
   * each section has one or more questions. See {@link gov.ny.its.hs.maslow.access.model.Catalog}
   * for more information.
   *
   * An example of how this data is represented in `application.yaml`:
   *
   * survey:
   * - SECTION_HOUSEHOLD:
   *   - HOUSEHOLD_SIZE
   *   - ADULTS_65_PLUS
   *   - CHILDREN_13_17
   *   - CHILDREN_06_12
   *   - CHILDREN_00_05
   * - SECTION_HOUSEHOLD_INCOME:
   *   - HOUSEHOLD_INCOME
   * - SECTION_EMPLOYMENT_STATUS:
   *   - IS_EMPLOYED
   * - SECTION_ADDITIONAL_CRITERIA:
   *   - IS_DISABLED
   *   - IS_MILITARY
   *   - IS_STUDENT
   *
   * An example of how this data is represented in a JSON response:
   *
   * "survey": [{
   *   "SECTION_HOUSEHOLD": [
   *     "HOUSEHOLD_SIZE",
   *     "ADULTS_65_PLUS",
   *     "CHILDREN_13_17",
   *     "CHILDREN_06_12",
   *     "CHILDREN_00_05"
   *   ]},{
   *   "SECTION_HOUSEHOLD_INCOME": [
   *     "HOUSEHOLD_INCOME"
   *   ]},{
   *   "SECTION_EMPLOYMENT_STATUS": [
   *     "IS_EMPLOYED"
   *   ]},{
   *   "SECTION_ADDITIONAL_CRITERIA": [
   *     "IS_DISABLED",
   *     "IS_MILITARY",
   *     "IS_STUDENT"
   *   ]}
   * ]
   */
  public List<Map<String, List<String>>> getSurvey() {
    return survey;
  }

  /**
   * Sets the value of {@link #getSurvey()}
   */
  public void setSurvey(List<Map<String, List<String>>> survey) {
    this.survey = survey;
  }

  /**
   * Gets the dictionary of questions that we ask residents in order to recommend relevant services.
   *
   * The dictionary maps a question key (such as "HOUSEHOLD_SIZE") to a {@link QuestionDto}.
   *
   * All keys must match the pattern /^[A-Z][A-Z0-9_]*$/.
   */
  public Map<String, QuestionDto> getQuestions() {
    return questions;
  }

  /**
   * Sets the value for {@link #getQuestions()}
   */
  public void setQuestions(Map<String, QuestionDto> questions) {
    this.questions = questions;
  }

  /**
   * Gets an array of service keys that represents the priority order for recommending services to
   * residents. Each key must reference a service returned by {@link #getServices()}.
   *
   * An example of how this data is represented in `application.yaml`:
   *
   * rank:
   * - DOL_PUA
   * - DOL_UA
   *
   * An example of how this data is represented in a JSON response:
   *
   * "rank": [
   *   "DOL_PUA",
   *   "DOL_UA"
   * ]
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
   * The dictionary maps a service key (such as "DOL_UI") to a {@link ServiceDto}.
   *
   * All keys must match the pattern /^[A-Z][A-Z0-9_]*$/.
   */
  public Map<String, ServiceDto> getServices() {
    return services;
  }

  /**
   * Sets the value for {@link #getServices()}
   */
  public void setServices(Map<String, ServiceDto> services) {
    this.services = services;
  }
}
