package gov.ny.its.hs.maslow.access.service;

import com.fasterxml.jackson.databind.DeserializationFeature;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.google.common.base.Strings;
import gov.ny.its.hs.maslow.access.event.CatalogUpdatedEvent;
import gov.ny.its.hs.maslow.access.model.Catalog;
import gov.ny.its.hs.maslow.shared.model.Services;
import java.io.FileInputStream;
import java.io.FileOutputStream;
import java.io.IOException;
import java.net.MalformedURLException;
import java.net.URI;
import java.net.URISyntaxException;
import java.net.URL;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.attribute.FileTime;
import java.time.Instant;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.ApplicationEvent;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.context.annotation.Bean;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.ResponseEntity;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.web.client.ResourceAccessException;
import org.springframework.web.client.RestOperations;
import org.springframework.web.client.RestTemplate;

/**
 * A service that manages the state of the catalog. The default state of the catalog is loaded from
 * configuration, specifically the value of the `maslow.catalog` object in `application.yaml`.
 *
 * The service can also refresh a subset of the catalog (rank and services) from an external JSON
 * file. The service will attempt to refresh the catalog upon application start as well as upon
 * request via {@link #refreshServices()}. The location of the services file is configured using the
 * `maslow.access.services-location` property. If the file does not exist or is not readable,
 * refresh will be skipped -- it is not an error. If the file does exist, it will be mapped to the
 * {@link Service} configuration object and will replace any existing values in {@link Catalog}.
 *
 * In effect, the CatalogService will return a catalog updated with the latest service if the
 * external JSON exists and is readable, otherwise it will fallback to the default state loaded from
 * configuration.
 *
 * The service publishes an {@link ApplicationEvent} of type {@link CatalogUpdatedEvent} when the
 * catalog is updated.
 */
@Service
public class CatalogService {
  private static final Logger log = LoggerFactory.getLogger(CatalogService.class);

  private ApplicationEventPublisher publisher;
  private Catalog catalog;
  private RestOperations restapi;
  private Path servicesPath;
  private URI snapshotFetchUri;
  private FileTime lastModifiedTime = FileTime.fromMillis(0);
  private FileTime nextModifiedTime = FileTime.fromMillis(0);
  private long snapshotLastModified = 0L;

  /**
   * Constructs an instance of CatalogService.
   *
   * @param publisher an ApplicationEventPublisher used to publish the CatalogUpdatedEvent
   * @param catalog the default state of the catalog loaded from configuration
   * @param servicesLocation the path to the external JSON file that contains service data
   */
  public CatalogService(
    ApplicationEventPublisher publisher,
    Catalog catalog,
    RestOperations restOperations,
    @Value("${maslow.access.services-location}") final String servicesLocation,
    @Value("${maslow.access.snapshot-fetch-uri}") final String snapshotFetchUriString
  ) {
    super();
    this.publisher = publisher;
    this.catalog = catalog;
    this.restapi = restOperations;
    this.servicesPath = Paths.get(servicesLocation);

    try {
      this.snapshotFetchUri = new URL(snapshotFetchUriString).toURI();
    } catch (MalformedURLException | URISyntaxException e) {
      log.warn(
        "Invalid URI provided from maslow.access.snapshot-fetch-uri: {}",
        Strings.nullToEmpty(snapshotFetchUriString)
      );
    }
  }

  /**
   * Returns a configured implementation of the RestOperations interface for dependency injection.
   */
  @Bean
  static RestOperations restOperations() {
    return new RestTemplate();
  }

  /**
   * Returns the current state of the {@link Catalog}
   */
  public Catalog getCatalog() {
    return catalog;
  }

  /**
   * Attempts to refresh the services subset of {@link Catalog} from an external JSON file
   * @return true if services were updated, false if not
   */
  public boolean refreshServices() {
    log.info("Refreshing services from file: {}", servicesPath);

    try {
      if (!Files.exists(servicesPath)) {
        log.warn("Refresh failed because file not found: {}", servicesPath);
        return false;
      }

      if (!Files.isReadable(servicesPath)) {
        log.warn("Refresh failed because file not readable: {}", servicesPath);
        return false;
      }

      // We read the lastModifiedTime of the external JSON file and only update the catalog if the
      // file has been modified since the last time we updated the catalog.
      nextModifiedTime = Files.getLastModifiedTime(servicesPath);
      if (nextModifiedTime.compareTo(lastModifiedTime) <= 0) {
        log.debug("Refresh skipped because file not modified: {}", servicesPath);
        return false;
      }
    } catch (IOException e) {
      log.error("Refresh failed because file not accessible: {}", e.getMessage());
      return false;
    }

    try (FileInputStream stream = new FileInputStream(servicesPath.toFile())) {
      // We create a shared read lock on the external JSON file. Any process that writes to that
      // file should create an exclusive write lock on the file to ensure consistent behavior.
      stream.getChannel().lock(0, Long.MAX_VALUE, true);

      // Note that we configured the {@code ObjectMapper} to ignore unknown fields. The data fetched
      // from Maslow Author currently has an extra field {@code created}. To make this code less
      // brittle, we simply ignore this extra field and any others that might crop up. If a new
      // field is needed, it should be added to {@link Services}.

      ObjectMapper objectMapper = new ObjectMapper();
      objectMapper.configure(DeserializationFeature.FAIL_ON_UNKNOWN_PROPERTIES, false);
      Services services = objectMapper.readValue(stream, Services.class);

      catalog.setRank(services.getRank());
      catalog.setServices(services.getServices());
      lastModifiedTime = nextModifiedTime;

      // We publish a CatalogUpdatedEvent in case any listener within the application would like to
      // act upon this event.
      publisher.publishEvent(new CatalogUpdatedEvent(this, lastModifiedTime));

      log.info("Refresh succeeded from file modified on {}", lastModifiedTime);
    } catch (IOException e) {
      log.error("Refresh failed with exception", e.getMessage());
      return false;
    }

    return true;
  }

  /**
   * Fetches the latest services snapshot from Maslow Author and writes it to a file. This file is
   * subsequently read by {@link #refreshServices()}. If there are any issues fetching the latest
   * data, this method simply returns false and Maslow Access soldiers on using either previously
   * fetched data or the data embedded into the binary in {@code application.yaml}.
   *
   * This functionality is configured via application properties:
   *
   * - This method is scheduled to repeat after a fixed delay. The delay (measured in milliseconds)
   *   is configured with the property {@code maslow.access.snapshot-fetch-rate-ms}.
   * - The URL that will be fetched is configured with the property
   *   {@code maslow.access.snapshot-fetch-uri}.
   * - The file that will be written to and read by {@link #refreshServices()} is configured with
   *   the property {@maslow.access.services-location}.
   *
   * @return true if data was fetched and services refreshed, otherwise false
   */
  @Scheduled(fixedDelayString = "${maslow.access.snapshot-fetch-rate-ms}")
  public boolean fetchServicesSnapshot() {
    log.info("Fetching latest services snapshot from URL: {}", snapshotFetchUri);

    if (snapshotFetchUri == null) {
      log.warn("Fetch skipped because of invalid URI.");
      return false;
    }

    try {
      HttpHeaders headers = new HttpHeaders();
      headers.setIfModifiedSince(snapshotLastModified);

      log.debug(
        "Fetch request (If-Modified-Since: {})",
        Instant.ofEpochMilli(snapshotLastModified).toString()
      );

      ResponseEntity<Services> entity = restapi.exchange(
        snapshotFetchUri,
        HttpMethod.GET,
        new HttpEntity<Object>(headers),
        Services.class
      );

      log.debug(
        "Fetch response (Status: {}, Last-Modified: {})",
        entity.getStatusCodeValue(),
        Instant.ofEpochMilli(entity.getHeaders().getLastModified()).toString()
      );

      switch (entity.getStatusCode()) {
        case OK:
          log.info("Writing services snapshot to file: {}", servicesPath);

          try (FileOutputStream stream = new FileOutputStream(servicesPath.toFile())) {
            stream.getChannel().lock();

            ObjectMapper objectMapper = new ObjectMapper();
            objectMapper.writeValue(stream, entity.getBody());

            snapshotLastModified = entity.getHeaders().getLastModified();
          } catch (IOException e) {
            log.warn("Write to file failed: {}", e.getMessage());
            return false;
          }
          break;
        case NOT_MODIFIED:
          log.info(
            "Fetch skipped because services snapshot has not been modified since {}",
            Instant.ofEpochMilli(snapshotLastModified).toString()
          );
          return false;
        default:
          log.warn("Fetch failed with status: {}", entity.getStatusCode());
          return false;
      }

      return refreshServices();
    } catch (ResourceAccessException e) {
      log.warn("Fetch failed with exception: {}", e.getMessage());
      return false;
    }
  }
}
