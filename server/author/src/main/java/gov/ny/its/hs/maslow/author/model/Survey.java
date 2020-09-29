package gov.ny.its.hs.maslow.author.model;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import javax.validation.constraints.NotEmpty;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;
import org.springframework.validation.annotation.Validated;

/**
 * Defines the survey section of the catalog that drives the business logic of the application.
 * This includes the ordering of the sections and questions in the survey. This is currently loaded
 * as configuration from application.yaml, but it could also be loaded from MongoDB.
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
public class Survey {
  @NotEmpty
  private List<Map<String, List<String>>> survey = new ArrayList<>();

  /**
   * Gets the structure definition of the survey. A survey is comprised of one or more sections where
   * each section has one or more questions. The survey structure is defined by reference, not by
   * value. That is, it is defined with section and question keys.
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
}
