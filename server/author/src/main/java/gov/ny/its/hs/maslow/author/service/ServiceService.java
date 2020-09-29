package gov.ny.its.hs.maslow.author.service;

import com.google.common.base.Preconditions;
import gov.ny.its.hs.maslow.author.model.EntityTag;
import gov.ny.its.hs.maslow.author.model.Service;
import gov.ny.its.hs.maslow.author.model.ServiceDocument;
import gov.ny.its.hs.maslow.author.model.ServiceLocales;
import gov.ny.its.hs.maslow.author.model.ServiceRank;
import gov.ny.its.hs.maslow.author.model.ServiceResource;
import java.math.BigInteger;
import java.net.URI;
import java.util.Collection;
import javax.validation.Valid;
import lombok.extern.slf4j.Slf4j;
import org.springframework.dao.OptimisticLockingFailureException;
import org.springframework.data.mongodb.core.MongoOperations;
import org.springframework.http.CacheControl;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;

/**
 * Implements the REST controller for the Maslow Author Services API as a service.
 */
@org.springframework.stereotype.Service
@Slf4j
public class ServiceService {
  /** The configured MongoOperations for database operations */
  private final MongoOperations mongo;

  /**
   * Constructs the {@link ServiceService} component.
   *
   * @param mongoOperations the MongoOperations for database operations; injected by Spring Boot.
   */
  public ServiceService(MongoOperations mongoOperations) {
    super();
    this.mongo = mongoOperations;
  }

  /**
   * Returns the singleton {@link ServiceDocument} from the database and asserts that it exists.
   *
   * @return the singleton {@link ServiceDocument}
   */
  private ServiceDocument selectServiceDocument() {
    ServiceDocument document = mongo.findById(BigInteger.ZERO, ServiceDocument.class);

    if (document == null) {
      throw new ResponseStatusException(
        HttpStatus.INTERNAL_SERVER_ERROR,
        "DATA_UNAVAILABLE: Required database document for services not found."
      );
    }

    return document;
  }

  /**
   * Returns all services in the database.
   *
   * @return the services in the database as a {@link ResponseEntity}
   */
  public ResponseEntity<ServiceDocument> selectServices() {
    log.debug("selectServices");

    ServiceDocument document = selectServiceDocument();
    return ResponseEntity
      .ok()
      .cacheControl(CacheControl.noCache())
      .eTag(EntityTag.from(document))
      .lastModified(document.getModified())
      .body(document);
  }

  /**
   * Inserts a new service into the database. The key of the new service must be unique within the
   * database.
   *
   * @param service the new service to be inserted
   * @return the new service
   */
  public ResponseEntity<Service> insertService(Service service) {
    log.debug("insertService with {}", service);

    try {
      ServiceDocument document = selectServiceDocument();
      document.insertService(service);
      document = mongo.save(document);

      Service createdService = document.selectService(service.getKey());
      URI createdServiceUri = ServletUriComponentsBuilder
        .fromCurrentRequest()
        .pathSegment(createdService.getKey())
        .build()
        .toUri();

      return ResponseEntity
        .created(createdServiceUri)
        .cacheControl(CacheControl.noCache())
        .eTag(EntityTag.from(createdService))
        .lastModified(createdService.getModified())
        .body(createdService);
    } catch (IllegalArgumentException e) {
      throw new ResponseStatusException(HttpStatus.CONFLICT, e.getMessage(), e);
    } catch (OptimisticLockingFailureException e) {
      throw new ResponseStatusException(
        HttpStatus.CONFLICT,
        "CONCURRENT_EDIT: " + e.getMessage(),
        e
      );
    }
  }

  /**
   * Returns an existing service in the database identified by {@code key}.
   *
   * @param key the key of the service
   * @return the service as a {@link ResponseEntity}
   */
  public ResponseEntity<Service> selectService(String key) {
    log.debug("selectService for query(key={})", key);

    ServiceDocument document = selectServiceDocument();
    Service service = document.selectService(key);
    if (service != null) {
      return ResponseEntity
        .ok()
        .cacheControl(CacheControl.noCache())
        .eTag(EntityTag.from(service))
        .lastModified(service.getModified())
        .body(service);
    } else {
      throw new ResponseStatusException(
        HttpStatus.NOT_FOUND,
        "SERVICE_NOT_FOUND: Service not found."
      );
    }
  }

  /**
   * Updates an existing service in the database identified by {@code key}.
   *
   * @param key the key of the service
   * @param service the new value of the service
   * @return the updated service as a {@link ResponseEntity}
   */
  public ResponseEntity<Service> updateService(String key, String version, Service service) {
    log.debug("updateService for query(key={}) with {}", key, service);

    try {
      Preconditions.checkArgument(
        key.equals(service.getKey()),
        "SERVICE_NOT_VALID: Service could not be updated because the key in the request body did not match the key of the URL. Expected '%s', found '%s'.",
        key,
        service.getKey()
      );

      ServiceDocument document = selectServiceDocument();
      document.updateService(service, version);
      document = mongo.save(document);

      Service updatedService = document.selectService(key);
      if (updatedService != null) {
        return ResponseEntity
          .ok()
          .cacheControl(CacheControl.noCache())
          .eTag(EntityTag.from(updatedService))
          .lastModified(updatedService.getModified())
          .body(updatedService);
      } else {
        return ResponseEntity.notFound().build();
      }
    } catch (IllegalArgumentException e) {
      throw new ResponseStatusException(HttpStatus.BAD_REQUEST, e.getMessage(), e);
    }
  }

  /**
   * Returns the resources for a specific service identified by {@code key} and {@code lng}.
   *
   * @param key the key of the service
   * @param lng the locale of the service
   * @return the {@link ServiceResource} as a {@link ResponseEntity}
   */
  public ResponseEntity<ServiceResource> selectServiceResource(String key, ServiceLocales lng) {
    log.debug("selectServiceLocale for query(key={}, lng={})", key, lng);

    try {
      ServiceDocument document = selectServiceDocument();
      ServiceResource resource = document.selectServiceResource(key, lng);

      if (resource != null) {
        return ResponseEntity
          .ok()
          .cacheControl(CacheControl.noCache())
          .eTag(EntityTag.from(resource))
          .body(resource);
      } else {
        throw new ResponseStatusException(
          HttpStatus.NOT_FOUND,
          "RESOURCE_NOT_FOUND: Service resources for requested locale not found."
        );
      }
    } catch (IllegalArgumentException e) {
      throw new ResponseStatusException(HttpStatus.NOT_FOUND, e.getMessage(), e);
    }
  }

  /**
   * Upserts the resource for a specific service identified by {@code key} and {@code lng}.
   *
   * @param key the key of the service to update
   * @param lng the locale of the service to update
   * @param resource the new value of the resource
   * @return the updated {@link ServiceResource} as a {@link ResponseEntity}
   */
  public ResponseEntity<ServiceResource> upsertServiceResource(
    String key,
    ServiceLocales lng,
    String version,
    ServiceResource resource
  ) {
    log.debug("updateServiceLocale for query(key={}, lng={}) with {}", key, lng, resource);

    try {
      ServiceDocument document = selectServiceDocument();
      document.upsertServiceResource(key, lng, resource, version);
      document = mongo.save(document);

      ServiceResource updatedResource = document.selectServiceResource(key, lng);
      if (updatedResource != null) {
        return ResponseEntity
          .ok()
          .cacheControl(CacheControl.noCache())
          .eTag(EntityTag.from(updatedResource))
          .body(updatedResource);
      } else {
        return ResponseEntity.notFound().build();
      }
    } catch (IllegalArgumentException e) {
      throw new ResponseStatusException(HttpStatus.BAD_REQUEST, e.getMessage(), e);
    }
  }

  /**
   * Updates all resource versions for a service as up-to-date.
   * @param key the key of the service to update
   * @return the updated service
   */
  public ResponseEntity<Service> updateServiceResourceVersions(String key) {
    log.debug("updateServiceResourceVersions for key={}", key);

    ServiceDocument document = selectServiceDocument();
    document.updateServiceResourceVersions(key);
    document = mongo.save(document);

    Service updatedService = document.selectService(key);
    return ResponseEntity
      .ok()
      .cacheControl(CacheControl.noCache())
      .eTag(EntityTag.from(updatedService))
      .body(updatedService);
  }

  /**
   * Updates the ranks of existing services.
   *
   * @param serviceRanks the rank update requests
   * @return the updated singleton {@link ServiceDocument}
   */
  public ResponseEntity<ServiceDocument> updateServiceRanks(
    Collection<@Valid ServiceRank> serviceRanks
  ) {
    log.debug("updateServiceRanks with {}", serviceRanks);

    try {
      ServiceDocument document = selectServiceDocument();
      document.updateServiceRanks(serviceRanks);
      document = mongo.save(document);

      return ResponseEntity
        .ok()
        .cacheControl(CacheControl.noCache())
        .eTag(EntityTag.from(document))
        .lastModified(document.getModified())
        .body(document);
    } catch (IllegalArgumentException e) {
      throw new ResponseStatusException(HttpStatus.BAD_REQUEST, e.getMessage(), e);
    }
  }
}
