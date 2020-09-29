package gov.ny.its.hs.maslow.access.controller;

import com.google.common.collect.Maps;
import gov.ny.its.hs.maslow.access.model.Catalog;
import gov.ny.its.hs.maslow.access.service.CatalogService;
import gov.ny.its.hs.maslow.shared.model.QuestionResources;
import gov.ny.its.hs.maslow.shared.model.SectionResources;
import gov.ny.its.hs.maslow.shared.model.ServiceResources;
import java.util.HashMap;
import java.util.Map;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RestController;

/**
 * Provides a REST endpoint to retrieve localized translations of text in the {@link Catalog} in a
 * JSON format compatible with <a href="https://www.i18next.com/">i18next</a>.
 * @see <a href="https://www.i18next.com/misc/json-format">i18next JSON Format</a>
 */
@RestController
public class LocalesController {
  private final CatalogService catalogService;

  /**
   * Constructs an instance of the LocalesController.
   * @param catalogService an instance of {@link CatalogService}
   */
  public LocalesController(CatalogService catalogService) {
    super();
    this.catalogService = catalogService;
  }

  /**
   * Gets the concatenated localized translations of text for the entire catalog
   * @param language the locale (such as "en" or "es")
   */
  @GetMapping("/api/explore/v1/locales/{language}/catalog.json")
  public Map<String, Object> getCatalogResources(@PathVariable String language) {
    Map<String, Object> catalog = new HashMap<>();
    catalog.putAll(getSectionResources(language));
    catalog.putAll(getQuestionResources(language));
    catalog.putAll(getServiceResources(language));
    return catalog;
  }

  /**
   * Gets the localized translations of text for sections
   * @param language the locale (such as "en" or "es")
   */
  @GetMapping("/api/explore/v1/locales/{language}/sections.json")
  public Map<String, SectionResources> getSectionResources(@PathVariable String language) {
    Catalog catalog = catalogService.getCatalog();
    return Maps.transformValues(catalog.getSections(), item -> item.getResources().get(language));
  }

  /**
   * Gets the localized translations of text for questions
   * @param language the locale (such as "en" or "es")
   */
  @GetMapping("/api/explore/v1/locales/{language}/questions.json")
  public Map<String, QuestionResources> getQuestionResources(@PathVariable String language) {
    Catalog catalog = catalogService.getCatalog();
    return Maps.transformValues(catalog.getQuestions(), item -> item.getResources().get(language));
  }

  /**
   * Gets the localized translations of text for services
   * @param language the locale (such as "en" or "es")
   */
  @GetMapping("/api/explore/v1/locales/{language}/services.json")
  public Map<String, ServiceResources> getServiceResources(@PathVariable String language) {
    Catalog catalog = catalogService.getCatalog();
    return Maps.transformValues(catalog.getServices(), item -> item.getResources().get(language));
  }
}
