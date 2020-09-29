package gov.ny.its.hs.maslow.access.event;

import java.nio.file.attribute.FileTime;
import org.springframework.context.ApplicationEvent;

/**
 * An application event that is raised when the {@link CatalogService} successfully refreshes the
 * state of the {@link Catalog}.
 */
public class CatalogUpdatedEvent extends ApplicationEvent {
  private static final long serialVersionUID = 1L;

  private final FileTime lastModifiedTime;

  /**
   * Constructs a CatalogUpdatedEvent instance.
   * @param source the object that published the event
   * @param lastModifiedTime the last modified time of the JSON file that updated the catalog
   */
  public CatalogUpdatedEvent(Object source, FileTime lastModifiedTime) {
    super(source);
    this.lastModifiedTime = lastModifiedTime;
  }

  /**
   * Returns the last modified time of the JSON file that updated the catalog
   */
  public FileTime getLastModifiedTime() {
    return this.lastModifiedTime;
  }
}
