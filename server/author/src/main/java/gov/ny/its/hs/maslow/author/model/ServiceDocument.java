package gov.ny.its.hs.maslow.author.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.google.common.base.Preconditions;
import com.google.common.base.Strings;
import com.google.common.collect.Sets;
import java.math.BigInteger;
import java.time.Instant;
import java.util.ArrayList;
import java.util.Collection;
import java.util.Comparator;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;
import javax.validation.Valid;
import javax.validation.constraints.Max;
import javax.validation.constraints.Min;
import javax.validation.constraints.NotNull;
import javax.validation.constraints.Pattern;
import lombok.Builder;
import lombok.Data;
import lombok.Singular;
import org.springframework.data.annotation.Id;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.annotation.Version;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.http.HttpStatus;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.server.ResponseStatusException;

/**
 * Represents a collection of services as a single document. The services are in fact stored as a
 * singleton document within the {@code services} collection in MongoDB. The id of this singleton
 * document is always {@code 0} (actually, {@link BigInteger#ZERO}).
 */
@Builder(toBuilder = true)
@Data
@Document("services")
@Validated
public class ServiceDocument {
  // TODO(marcja): The way modified is handled throughout this class can be improved. It is possible
  // for services updated in batch not to have the exact same modified date as the serviceDocument.
  // It might be better to do this in two passes: 1) mark modified dates as dirty during updating,
  // and 2) update all dirty date with a coherent value right before save.

  /**
   * The unique identifier for the singleton document. Always equal to {@link BigInteger#ZERO}.
   */
  @Builder.Default
  @Id
  @JsonIgnore
  @Min(0)
  @Max(0)
  private BigInteger id = BigInteger.ZERO;

  /**
   * The version identifier. Set by Spring Data.
   */
  @Version
  private Long version;

  /**
   * The date when the singleton document was last modified. This date will be updated whenever any
   * child object of the document is updated.
   */
  @Builder.Default
  @LastModifiedDate
  @NotNull
  private Instant modified = Instant.now();

  /**
   * The services in the document. Maps the service key (such as "SNAP") to its service.
   */
  @NotNull
  @Singular
  private Map<@Pattern(regexp = Service.RE_KEY) String, @Valid Service> services;

  /**
   * Returns the {@link Service} identified by {@code key} in the in-memory instance of
   * {@link ServiceDocument}.
   *
   * @param key the key identifying the {@link Service}
   * @return the {@link Service} if it exists, null otherwise
   */
  public Service selectService(String key) {
    return services.get(key);
  }

  /**
   * Inserts a new {@link Service} in the in-memory instance of {@link ServiceDocument}. The
   * {@code key} of the {@code service} must be unique with the document.
   *
   * The rank of the new services requires special handling. There are four use cases:
   * 1. rank = -1. The new service will be inserted at the TAIL of the list.
   * 2. rank =  0. The new service will be inserted at the HEAD of the list, and any existing
   *    services with rank >= 1 will have their rank incremented by 1.
   * 3. rank = RANK, where RANK <= services.size(). The new service will be inserted at RANK and
   *    any existing service with rank >= RANK will be incremented by 1.
   * 4. rank > services.size() or rank < -1. The insert throws an {@code IllegalArgumentException}.
   *
   * Note that updating the rank of a service also updates its {@code modified} date.
   *
   * @param insertedService the {@link Service} to be inserted
   */
  public void insertService(Service insertedService) {
    Preconditions.checkArgument(
      !services.containsKey(insertedService.getKey()),
      "SERVICE_NOT_UNIQUE: Service could not be inserted because a service already exists with the key '%s'.",
      insertedService.getKey()
    );

    // Every service must provide resources for at least the EN locale. EN is the benchmark locale
    // and is used to determine if other locales are out-of-date or missing.
    Preconditions.checkArgument(
      insertedService.getResources().containsKey(ServiceLocales.EN),
      "SERVICE_INVALID_EN: Service could not be inserted because the service is missing resources for the EN locale."
    );

    // Update the resourceVersions for inserted service.
    String resourceVersionEN = insertedService.getResources().get(ServiceLocales.EN).version();
    Service.ServiceBuilder builder = insertedService.toBuilder();
    insertedService
      .getResources()
      .keySet()
      .forEach(key -> builder.resourceVersion(key, resourceVersionEN));
    insertedService = builder.build();

    // To reduce redundant code and leverage the battery of unit tests we have on
    // {@link #updateServiceRanks}, we just insert the service at TAIL and then update its rank.

    ArrayList<ServiceRank> serviceRanks = new ArrayList<>();
    serviceRanks.add(new ServiceRank(insertedService.getKey(), insertedService.getRank()));

    modified = Instant.now();
    insertedService.setRank(services.size() + 1);
    insertedService.setModified(modified);
    services.put(insertedService.getKey(), insertedService);

    updateServiceRanks(serviceRanks);
  }

  /**
   * Updates an existing {@link Service} in the in-memory instance of {@link ServiceDocument}. Will
   * not check for concurrent edits.
   *
   * Note that it is an error to update the rank via {@link #updateService(Service)}. Use
   * {@link #updateServiceRanks(Collection)} instead.
   *
   * @param updatedService the {@link Service} to be updated
   * @return the previous value of the service, null if the service was created
   */
  public Service updateService(Service updatedService) {
    return updateService(updatedService, null);
  }

  /**
   * Updates an existing {@link Service} in the in-memory instance of {@link ServiceDocument}.
   * Checks for concurrent edits if {@code version} is not empty.
   *
   * Note that it is an error to update the rank via {@link #updateService(Service)}. Use
   * {@link #updateServiceRanks(Collection)} instead.
   *
   * @param updatedService the {@link Service} to be updated
   * @param version the version of the current service to be updated
   * @return the previous value of the service, null if the service was created
   */
  public Service updateService(Service updatedService, String version) {
    Service currentService = services.get(updatedService.getKey());
    Preconditions.checkArgument(
      currentService != null,
      "SERVICE_NOT_FOUND: Service could not be updated because a service with key '%s' could not be found.",
      updatedService.getKey()
    );
    Preconditions.checkArgument(
      updatedService.getRank() == currentService.getRank(),
      "SERVICE_RANK_CHANGED: Service could not be updated because its rank was changed. Expected (rank=%s), but found (rank=%s).",
      currentService.getRank(),
      updatedService.getRank()
    );

    // Every service must provide resources for at least the EN locale. EN is the benchmark locale
    // and is used to determine if other locales are out-of-date or missing.
    Preconditions.checkArgument(
      updatedService.getResources().containsKey(ServiceLocales.EN),
      "SERVICE_INVALID_EN: Service could not be updated because the service is missing required resources for the EN locale."
    );

    // Check whether the existing service has been updated since the object was last fetched.
    if (!Strings.isNullOrEmpty(version)) {
      if (!EntityTag.from(currentService).equals(version)) {
        throw new ResponseStatusException(
          HttpStatus.CONFLICT,
          "CONCURRENT_EDIT: Service could not be updated because it has been updated by another request."
        );
      }
    }

    // Update the resourceVersions for updated service.
    String resourceVersionEN = updatedService.getResources().get(ServiceLocales.EN).version();
    Service.ServiceBuilder builder = updatedService.toBuilder();
    updatedService
      .getResources()
      .forEach(
        (key, updatedResource) -> {
          ServiceResource currentResource = currentService.getResources().get(key);
          if (updatedResource.equals(currentResource)) {
            builder.resourceVersion(key, currentService.getResourceVersions().get(key));
          } else {
            builder.resourceVersion(key, resourceVersionEN);
          }
        }
      );
    updatedService = builder.build();

    modified = Instant.now();
    updatedService.setModified(modified);
    return services.put(updatedService.getKey(), updatedService);
  }

  /**
   * Returns the {@link ServiceResource} identified by {@code key} and {@code lng}.
   *
   * @param key the key identifying the {@link Service}
   * @param lng the {@link ServiceLocale} identifying the resource
   * @return the {@link ServiceResource} if it exists, null otherwise
   */
  public ServiceResource selectServiceResource(String key, ServiceLocales lng) {
    Preconditions.checkArgument(
      services.containsKey(key),
      "SERVICE_NOT_FOUND: Service not found for key '%s'.",
      key
    );

    return services.get(key).getResources().get(lng);
  }

  /**
   * Updates the {@link ServiceResource} identified by {@code key} and {@code lng}, inserting it if
   * it does not exist. Will not check for concurrent edits.
   */
  public ServiceResource upsertServiceResource(
    String key,
    ServiceLocales lng,
    ServiceResource resource
  ) {
    return upsertServiceResource(key, lng, resource, null);
  }

  /**
   * Updates the {@link ServiceResource} identified by {@code key} and {@code lng}, inserting it if
   * it does not exist. Will check for concurrent edits if {@code version} is non-empty.
   *
   * @param key the key identifying the {@link Service}
   * @param lng the {@link ServiceLocale} identifying the resource
   * @param resource the {@link ServiceResource} to be updated
   * @param version the version of the current resource to be updated
   * @return the previous value of the resource, null if the resource was created
   */
  public ServiceResource upsertServiceResource(
    String key,
    ServiceLocales lng,
    ServiceResource resource,
    String version
  ) {
    Preconditions.checkArgument(
      services.containsKey(key),
      "SERVICE_NOT_FOUND: Service resources could not be updated because a service with key '%s' could not be found.",
      key
    );

    // This really can't happen unless the state was created outside the methods of this class, but
    // it's an important invariant nonetheless.
    Preconditions.checkState(
      selectServiceResource(key, ServiceLocales.EN) != null,
      "SERVICE_MISSING_EN: Service resources for the %s locale could not be updated because the service is missing required resources for the EN locale.",
      key
    );

    // Check whether the existing service resource has been updated since the object was last
    // fetched. Here we use an ETag based check since we do not store a last modified time for each
    // resource.
    ServiceResource currentResource = selectServiceResource(key, lng);
    if (currentResource != null && !Strings.isNullOrEmpty(version)) {
      if (!EntityTag.from(currentResource).equals(version)) {
        throw new ResponseStatusException(
          HttpStatus.CONFLICT,
          "CONCURRENT_EDIT: Service resource could not be updated because it has been updated by another request."
        );
      }
    }

    // To upsert the service resource, we need to consider several use cases. In all cases, we
    // assume that the EN resource currently exists on the service.
    // 1. If lng is EN, we're updating the benchmark resource. In this case, we need to update the
    //    resourceVersion for EN to the updated hash. All other resourceVersions remain unchanged.
    // 2. If lng is XX, we're upserting some other resource. In this case, we need to upsert the
    //    resourceVersion for XX to the existing hash of EN. This reflects that the upsert of XX has
    //    "seen" the current version of EN and therefore reflects its contents. All other
    //    resourceVersions remain unchanged.

    Service currentService = selectService(key);
    if (lng == ServiceLocales.EN) {
      currentService.getResourceVersions().put(lng, resource.version());
    } else {
      String resourceVersionEN = currentService.getResourceVersions().get(ServiceLocales.EN);
      currentService.getResourceVersions().put(lng, resourceVersionEN);
    }

    modified = Instant.now();
    currentService.setModified(modified);
    return currentService.getResources().put(lng, resource);
  }

  /**
   * Updates all resourceVersion entries for the service identified by {@code key} as up-to-date
   * with the EN version.
   */
  public void updateServiceResourceVersions(String key) {
    Service service = selectService(key);
    Preconditions.checkArgument(
      service != null,
      "SERVICE_NOT_FOUND: Service resource versions could not be updated because a service with key '%s' could not be found.",
      key
    );

    updateServiceResourceVersions(service);
  }

  private void updateServiceResourceVersions(Service service) {
    assert service != null;

    String resourceEN = service.getResources().get(ServiceLocales.EN).version();

    Service.ServiceBuilder serviceBuilder = service.toBuilder();
    for (ServiceLocales lng : service.getResources().keySet()) {
      serviceBuilder.resourceVersion(lng, resourceEN);
    }
    service.setResourceVersions(serviceBuilder.build().getResourceVersions());
  }

  /**
   * Resets the resourceVersion entries for each service. This is a utility method that is only used
   * by the DatabaseRepopulateRunner to initialize test data.
   */
  public void resetServiceResourceVersions() {
    for (Service service : getServices().values()) {
      updateServiceResourceVersions(service);
    }
  }

  /**
   * Decrements the ranks of all services whose rank is greater than or equal to
   * {@code startingRank} and marks the services as modified.
   */
  private void decrementRanks(int startingRank) {
    for (Service service : services.values()) {
      if (service.getRank() >= startingRank) {
        service.setRank(service.getRank() - 1);
        service.setModified(modified);
      }
    }
  }

  /**
   * Increments the ranks of all services whose rank is greater than or equal to
   * {@code startingRank} and marks the services as modified.
   */
  private void incrementRanks(int startingRank) {
    for (Service service : services.values()) {
      if (service.getRank() >= startingRank) {
        service.setRank(service.getRank() + 1);
        service.setModified(modified);
      }
    }
  }

  /**
   * Updates the ranks of {@link Service} objects in this in-memory instance of the
   * {@link ServiceDocument}.
   *
   * The {@link ServiceRank} collection must observe several rules:
   * - The key of each {@link ServiceRank} must not be null and must reference an existing service
   * - The rank of each {@link ServiceRank} must be between [-1, services.size()]
   * - If the {@code serviceRanks} has only one {@link ServiceRank}, its rank is interpreted as:
   *     -1: move the service to have the lowest rank (aka, the TAIL)
   *      0: move the service to have the highest rank (aka, the HEAD)
   *      n: move the service to have the rank of N (aka, the RANK)
   * - If the {@code serviceRanks} has multiple {@link ServiceRank} instances, their ranks must be
   *   from the same set as those services being updated. That is, if you want to update three
   *   services whose current ranks are [2, 4, 6], the ranks in {@code serviceRanks} must come from
   *   exactly this same set, such as [4, 2, 6] or [6, 4, 2]. You cannot introduce a new rank, such
   *   as [3, 4, 6]. From this same rule, you cannot use the special -1 or 0 ranks when using
   *   multiple {@link ServiceRank} instances.
   *
   * Note that all of these operations will modify (and set the modified date) any service with rank
   * greater than or equal to min(previousRank, updatedRank).
   * @param serviceRanks a collection of {@link ServiceRank} objects with the new ranks
   */
  public void updateServiceRanks(Collection<ServiceRank> serviceRanks) {
    // To start, run some basic checks on the provided ServiceRanks object. For each object, the key
    // must not be null, the key must refer to an existing service, and the rank must be in range.
    for (ServiceRank serviceRank : serviceRanks) {
      String key = serviceRank.getKey();
      Integer rank = serviceRank.getRank();

      Preconditions.checkNotNull(key, "SERVICE_NOT_VALID: Service key is null.");
      Preconditions.checkArgument(
        services.containsKey(key),
        "SERVICE_NOT_FOUND: Service rank could not be updated because a service with key '%s' could not be found.",
        key
      );
      Preconditions.checkArgument(
        -1 <= rank && rank <= services.size(),
        "RANK_NOT_VALID: Service rank could not be updated because the rank for key '%s' was outside the expected range. Expected rank in [-1,%s], but found (rank=%s).",
        key,
        services.size(),
        rank
      );
    }

    if (serviceRanks.size() == 1) {
      // In the straightforward case of updating with a single ServiceRank, we are logically
      // removing the current service from the sequence of ranks, closing the hole, and then
      // inserting the service at the updated rank. We're not actually removing/inserting the
      // object, just manipulating the sequence of ranks.

      ServiceRank updatedService = serviceRanks.iterator().next();
      Service currentService = selectService(updatedService.getKey());
      currentService.setModified(modified);

      switch (updatedService.getRank()) {
        case -1:
          // Move at TAIL. Requires closing the hole at the current service in the sequence of ranks
          // and then setting the rank of the service to TAIL.
          decrementRanks(currentService.getRank());
          currentService.setRank(services.size());
          break;
        case 0:
          // Move at HEAD. Requires closing the hole at the current service in the sequence of
          // ranks, opening a hole at HEAD, and then setting the rank of the service to HEAD.
          decrementRanks(currentService.getRank());
          incrementRanks(1);
          currentService.setRank(1);
          break;
        default:
          // Move at RANK. Requires closing the hole at the current service in the sequence of
          // ranks, opening a hole at RANK, and then setting the rank of the service to RANK.
          decrementRanks(currentService.getRank());
          incrementRanks(updatedService.getRank());
          currentService.setRank(updatedService.getRank());
      }
    } else {
      // Now we are dealing with a collection of ServiceRanks. The most common usage is swapping the
      // ranks of two Service neighbors (for example, to implement "move up" or "move down" actions
      // in a table of services), but it is also possible to supply a collection as large as the
      // number of services itself. Fortunately we can deal with these variants all the same way.

      // Check that service keys are unique.
      long distinctKeys = serviceRanks.stream().map(ServiceRank::getKey).distinct().count();
      Preconditions.checkArgument(
        distinctKeys == serviceRanks.size(),
        "SERVICE_RANKS_NOT_VALID: Updated service keys are not unique. Found (keys=[%s]).",
        serviceRanks
          .stream()
          .map(ServiceRank::getKey)
          .map(Object::toString)
          .collect(Collectors.joining(","))
      );

      // Check that service ranks are unique.
      long distinctRanks = serviceRanks.stream().mapToInt(ServiceRank::getRank).distinct().count();
      Preconditions.checkArgument(
        distinctRanks == serviceRanks.size(),
        "SERVICE_RANKS_NOT_VALID: Updated service ranks are not unique. Found (ranks=[%s]).",
        serviceRanks
          .stream()
          .map(ServiceRank::getRank)
          .map(Object::toString)
          .collect(Collectors.joining(","))
      );

      // Check that service ranks are from the same sets as current ranks (that is, [1,2,3] ->
      // [3,2,1], not [1,2,3] -> [4,5,6]). If the sets are not equal, the result of applying the
      // update would be dependent on the order of application (that is, indeterminate). It is
      // theoretically possible to support this by interpreting the input as an ordered sequence of
      // commands rather than a set of data updates, but this is out of scope.
      Set<Integer> updatedRanks = serviceRanks
        .stream()
        .map(serviceRank -> services.get(serviceRank.getKey()))
        .map(Service::getRank)
        .collect(Collectors.toSet());
      Set<Integer> currentRanks = serviceRanks
        .stream()
        .map(ServiceRank::getRank)
        .collect(Collectors.toSet());
      Preconditions.checkArgument(
        Sets.difference(updatedRanks, currentRanks).isEmpty(),
        "SERVICE_RANKS_NOT_VALID: Updated service ranks must be from the same set as current ranks. Expected (ranks=[%s]), but found (ranks=[%s]).",
        currentRanks.stream().map(Object::toString).collect(Collectors.joining(",")),
        updatedRanks.stream().map(Object::toString).collect(Collectors.joining(","))
      );

      // Now simply update the ranks. Easy.
      modified = Instant.now();
      for (ServiceRank serviceRank : serviceRanks) {
        Service service = selectService(serviceRank.getKey());
        service.setModified(modified);
        service.setRank(serviceRank.getRank());
      }
    }
  }

  /**
   * Normalizes the ranks of all services, effectively renumbering the ranks from 1. This will close
   * holes, remove duplicates, and bring in any ranks that are outside the expected range. If
   * multiple services have the same rank, they will be further sorted by their key.
   */
  public void normalizeServiceRanks() {
    List<Service> sortedServices = services
      .values()
      .stream()
      .sorted(Comparator.comparingInt(Service::getRank).thenComparing(Service::getKey))
      .collect(Collectors.toList());

    for (int i = 0; i < sortedServices.size(); ++i) {
      Service service = sortedServices.get(i);
      if (service.getRank() != i + 1) {
        service.setRank(i + 1);
        service.setModified(modified);
      }
    }
  }
}
