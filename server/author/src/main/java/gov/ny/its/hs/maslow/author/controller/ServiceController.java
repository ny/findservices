package gov.ny.its.hs.maslow.author.controller;

import gov.ny.its.hs.maslow.author.model.Service;
import gov.ny.its.hs.maslow.author.model.ServiceDocument;
import gov.ny.its.hs.maslow.author.model.ServiceLocales;
import gov.ny.its.hs.maslow.author.model.ServiceRank;
import gov.ny.its.hs.maslow.author.model.ServiceResource;
import gov.ny.its.hs.maslow.author.service.ServiceService;
import java.util.Collection;
import javax.validation.Valid;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import org.springframework.security.access.prepost.PreAuthorize;

/**
 * Defines the REST controller for the Maslow Author Services API.
 *
 * The API currently defines the following endpoints:
 * - /api/author/v1/services
 *   - GET: returns all services
 *   - POST: inserts a new services
 * - /api/author/v1/services/{key}
 *   - GET: returns a specific service identified by {@code key}
 *   - PUT: updates a specific service identified by {@code key}
 * - /api/author/v1/services/{key}/locales/{lng}
 *   - GET: returns the resources for a specific service identified by {@code key} and {@code lng}
 *   - PUT: upserts the resources for a specific service identified by {@code key} and {@code lng}
 * - /api/author/v1/services:rank
 *   - POST: updates the ranks of existing services
 */
@RestController
@RequestMapping("api/author/v1")
@PreAuthorize(
		"hasAuthority('FindServicesAuthor')"
)
public class ServiceController {
  private final ServiceService impl;

  /**
   * Constructs the {@link ServiceController} component.
   */
  public ServiceController(ServiceService impl) {
    super();
    this.impl = impl;
  }

  /**
   * Returns all services in the database.
   *
   * @return the services in the database as a {@link ResponseEntity}
   */
  @GetMapping("services")
  public ResponseEntity<ServiceDocument> selectServices() {
    return impl.selectServices();
  }

  /**
   * Inserts a new service into the database. The key of the new service must be unique within the
   * database.
   *
   * @param service the new service to be inserted
   * @return the new service
   */
  @PostMapping("services")
  public ResponseEntity<Service> insertService(@RequestBody @Valid Service service) {
    return impl.insertService(service);
  }

  /**
   * Returns an existing service in the database identified by {@code key}.
   *
   * @param key the key of the service
   * @return the service as a {@link ResponseEntity}
   */
  @GetMapping("services/{key}")
  public ResponseEntity<Service> selectService(@PathVariable("key") String key) {
    return impl.selectService(key);
  }

  /**
   * Updates an existing service in the database identified by {@code key}.
   *
   * @param key the key of the service
   * @param service the new value of the service
   * @return the updated service as a {@link ResponseEntity}
   */
  @PutMapping("services/{key}")
  public ResponseEntity<Service> updateService(
    @PathVariable("key") String key,
    @RequestHeader(name = HttpHeaders.IF_MATCH, required = false) String version,
    @RequestBody @Valid Service service
  ) {
    return impl.updateService(key, version, service);
  }

  /**
   * Returns the resources for a specific service identified by {@code key} and {@code lng}.
   *
   * @param key the key of the service
   * @param lng the locale of the service
   * @return the {@link ServiceResource} as a {@link ResponseEntity}
   */
  @GetMapping("services/{key}/locales/{lng}")
  public ResponseEntity<ServiceResource> selectServiceResource(
    @PathVariable("key") String key,
    @PathVariable("lng") ServiceLocales lng
  ) {
    return impl.selectServiceResource(key, lng);
  }

  /**
   * Upserts the resource for a specific service identified by {@code key} and {@code lng}.
   *
   * @param key the key of the service to update
   * @param lng the locale of the service to update
   * @param resource the new value of the resource
   * @return the updated {@link ServiceResource} as a {@link ResponseEntity}
   */
  @PutMapping("services/{key}/locales/{lng}")
  public ResponseEntity<ServiceResource> upsertServiceResource(
    @PathVariable("key") String key,
    @PathVariable("lng") ServiceLocales lng,
    @RequestHeader(name = HttpHeaders.IF_MATCH, required = false) String version,
    @RequestBody @Valid ServiceResource resource
  ) {
    return impl.upsertServiceResource(key, lng, version, resource);
  }

  /**
   * Updates all resource versions for a service as up-to-date.
   * @param key the key of the service to update
   * @return the updated service
   */
  @PostMapping("services/{key}/locales:update")
  public ResponseEntity<Service> updateServiceResourceVersions(@PathVariable("key") String key) {
    return impl.updateServiceResourceVersions(key);
  }

  /**
   * Updates the ranks of existing services.
   *
   * @param serviceRanks the rank update requests
   * @return the updated singleton {@link ServiceDocument}
   */
  @PostMapping("services:rank")
  public ResponseEntity<ServiceDocument> updateServiceRanks(
    @RequestBody Collection<@Valid ServiceRank> serviceRanks
  ) {
    return impl.updateServiceRanks(serviceRanks);
  }
}
