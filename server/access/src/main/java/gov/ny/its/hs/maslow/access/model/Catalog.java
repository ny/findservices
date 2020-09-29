package gov.ny.its.hs.maslow.access.model;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import gov.ny.its.hs.maslow.shared.model.Question;
import gov.ny.its.hs.maslow.shared.model.Section;
import gov.ny.its.hs.maslow.shared.model.Service;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import javax.validation.constraints.NotEmpty;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;
import org.springframework.validation.annotation.Validated;

/**
 * Defines the catalog of questions and services that drive the business logic of application. The
 * catalog is currently loaded as configuration from application.yaml, but it could also be loaded
 * from MongoDB.
 */
@Component
@ConfigurationProperties("maslow.catalog")
@Validated
@JsonIgnoreProperties(
  {
    "targetClass",
    "targetSource",
    "targetObject",
    "advisors",
    "frozen",
    "exposeProxy",
    "preFiltered",
    "proxiedInterfaces",
    "proxyTargetClass",
  }
)
public class Catalog {
  @NotEmpty
  private List<Map<String, List<String>>> survey = new ArrayList<>();

  @NotEmpty
  private Map<String, Section> sections = new HashMap<>();

  @NotEmpty
  private Map<String, Question> questions = new HashMap<>();

  @NotEmpty
  private List<String> rank = new ArrayList<>();

  @NotEmpty
  private Map<String, Service> services = new HashMap<>();

  /**
   * Gets the structure definition of the survey. A survey is comprised of one or more sections where
   * each section has one or more questions. The survey structure is defined by reference, not by
   * value. That is, it is defined with section and question keys, which are in turn used to lookup
   * section and question data from {@link #getSections()} and {@link #getQuestions()} respectively.
   *
   * An example of how this data is represented in `application-survey.yaml`:
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
   *  ]},{
   *   "SECTION_HOUSEHOLD_INCOME": [
   *     "HOUSEHOLD_INCOME"
   *   ]},{
   *   "SECTION_EMPLOYMENT_STATUS": [
   *     "IS_EMPLOYED"
   *   ]},{
   *   "SECTION_ADDITIONAL_CRITERIA": [
   *    "IS_DISABLED",
   *    "IS_MILITARY",
   *    "IS_STUDENT"
   *   ]}
   * ]
   *
   * Each string, such as "SECTION_HOUSEHOLD" or "HOUSEHOLD_SIZE", is a key into its respective
   * dictionary ({@link #getSections()} and {@link #getQuestions()}, respectively.)
   *
   * All keys must match the pattern /^[A-Z][A-Z0-9_]*$/.
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
   * Gets the dictionary of sections that defines the metadata and resources that describes a
   * {@link Section}. A section is a logical grouping of questions.
   *
   * The dictionary maps a section key (such as "SECTION_HOUSEHOLD") to a {@link Section}.
   *
   * All keys must match the pattern /^[A-Z][A-Z0-9_]*$/.
   */
  public Map<String, Section> getSections() {
    return sections;
  }

  /**
   * Sets the value of {@link #getSections()}
   */
  public void setSections(Map<String, Section> sections) {
    this.sections = sections;
  }

  /**
   * Gets the dictionary of questions that we ask residents in order to recommend relevant services.
   *
   * The dictionary maps a question key (such as "HOUSEHOLD_SIZE") to a {@link Question}.
   *
   * All keys must match the pattern /^[A-Z][A-Z0-9_]*$/.
   */
  public Map<String, Question> getQuestions() {
    return questions;
  }

  /**
   * Sets the value for {@link #getQuestions()}
   */
  public void setQuestions(Map<String, Question> questions) {
    this.questions = questions;
  }

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
   * All keys must match the pattern /^[A-Z][A-Z0-9_]*$/.
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
