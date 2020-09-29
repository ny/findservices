package gov.ny.its.hs.maslow.author.controller;

import gov.ny.its.hs.maslow.author.model.Survey;
import java.util.ArrayList;
import java.util.Collection;
import java.util.List;
import java.util.Map;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * Defines the REST controller for static data lookups used by Maslow Author.
 */
@RestController
@RequestMapping("api/author/v1/lookup")
@Slf4j
public class LookupController {
  @Autowired
  private Survey survey;

  /**
   * Returns the collection of question keys configured by Maslow Access. The question keys are
   * pulled from application.yaml.
   */
  @GetMapping("questions")
  public Collection<String> selectQuestionKeys() {
    log.debug("selecting question keys");

    List<String> questionKeys = new ArrayList<>();

    for (Map<String, List<String>> section : survey.getSurvey()) {
      Collection<String> values = section.values().iterator().next();
      questionKeys.addAll(values);
    }

    return questionKeys;
  }
}
