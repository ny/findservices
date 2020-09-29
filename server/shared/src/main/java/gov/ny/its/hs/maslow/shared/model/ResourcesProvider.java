package gov.ny.its.hs.maslow.shared.model;

import java.util.Map;

/**
 * Defines a generic interface for classes that return a resources object (that is, a map of
 * locale to translated strings).
 * @param <T> a resources class (such as {@link SectionResources}, {@link QuestionResources}, or
 * {@link ServicesResources})
 */
public interface ResourcesProvider<T> {
  /**
   * Gets the resources (that is, a map of locale to translated strings)
   */
  public Map<String, T> getResources();
}
