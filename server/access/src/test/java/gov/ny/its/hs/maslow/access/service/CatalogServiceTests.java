package gov.ny.its.hs.maslow.access.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import gov.ny.its.hs.maslow.access.event.CatalogUpdatedEvent;
import gov.ny.its.hs.maslow.access.model.Catalog;
import gov.ny.its.hs.maslow.shared.model.Services;
import java.io.File;
import java.io.IOException;
import java.net.URI;
import java.util.Optional;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.mockito.Mockito;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.http.HttpMethod;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.client.ResourceAccessException;
import org.springframework.web.client.RestOperations;

public class CatalogServiceTests {
  private ApplicationEventPublisher publisher = Mockito.mock(ApplicationEventPublisher.class);
  private Catalog catalog;
  private RestOperations restOperations = Mockito.mock(RestOperations.class);
  private CatalogService service;
  private final String SERVICES_PATH = "src/test/resources/services.json";
  private final String SNAPSHOTS_URI = "http://localhost:8081/api/author/v1/snapshots/latest";

  @BeforeEach
  void beforeEach() {
    catalog = new Catalog();
  }

  @Nested
  class RefreshServiceTests {

    @BeforeEach
    void beforeEach() {
      service =
        new CatalogService(publisher, catalog, restOperations, SERVICES_PATH, SNAPSHOTS_URI);
    }

    @Test
    void refreshService_updatesCatalog() {
      // assert that the catalog created in beforeEach is empty
      assertThat(service.getCatalog().getRank()).isEmpty();
      assertThat(service.getCatalog().getServices()).isEmpty();

      // assert that the service refreshed the services from the test data
      assertThat(service.refreshServices()).isTrue();

      // assert that the service updated the catalog
      assertThat(service.getCatalog().getRank()).isNotEmpty();
      assertThat(service.getCatalog().getServices()).isNotEmpty();

      // note that these assertions are only true based on the current content of the test data
      assertThat(service.getCatalog().getRank()).containsExactly("ONE", "TWO");
      assertThat(service.getCatalog().getServices()).containsOnlyKeys("ONE", "TWO");
    }

    @Test
    void refreshService_publishesCatalogUpdatedEvent() {
      service.refreshServices();
      verify(publisher).publishEvent(any(CatalogUpdatedEvent.class));
    }

    @Test
    void refreshService_ignoresSameLastModified() {
      // first time we refresh since the test data is newer than the last time we loaded (i.e. never)
      assertThat(service.refreshServices()).isTrue();
      // second time we don't refresh since the test data is not newer
      assertThat(service.refreshServices()).isFalse();
    }

    @Test
    void refreshService_ignoresInvalidLocation() {
      String servicesLocation = "bad_file_name";
      service =
        new CatalogService(publisher, catalog, restOperations, servicesLocation, SNAPSHOTS_URI);

      assertThat(service.getCatalog().getRank()).isEmpty();
      assertThat(service.getCatalog().getServices()).isEmpty();

      assertThat(service.refreshServices()).isFalse();

      assertThat(service.getCatalog().getRank()).isEmpty();
      assertThat(service.getCatalog().getServices()).isEmpty();
    }
  }

  @Nested
  class FetchServicesSnapshotTests {

    String getTempFilePath() throws IOException {
      File tempFile = File.createTempFile(this.getClass().getCanonicalName(), ".json");
      return tempFile.getAbsolutePath();
    }

    @BeforeEach
    void beforeEach() throws IOException {
      service =
        new CatalogService(publisher, catalog, restOperations, getTempFilePath(), SNAPSHOTS_URI);
    }

    @Test
    void fetchServicesSnapshot_returnsTrue() {
      Optional<Services> services = Optional.of(new Services());
      ResponseEntity<Services> response = ResponseEntity.of(services);

      when(restOperations.exchange(any(URI.class), eq(HttpMethod.GET), any(), eq(Services.class)))
        .thenReturn(response);

      assertThat(service.fetchServicesSnapshot()).isTrue();
    }

    @Test
    void fetchServicesSnapshot_withNullUri_returnsFalse() {
      service = new CatalogService(publisher, catalog, restOperations, SERVICES_PATH, null);

      assertThat(service.fetchServicesSnapshot()).isFalse();
    }

    @Test
    void fetchServicesSnapshot_withInvalidUri_returnsFalse() {
      final String snapshotFetchUriString = "invalid uri";
      service =
        new CatalogService(
          publisher,
          catalog,
          restOperations,
          SERVICES_PATH,
          snapshotFetchUriString
        );

      assertThat(service.fetchServicesSnapshot()).isFalse();
    }

    @Test
    void fetchServicesSnapshot_withResourceAccessException_returnsFalse() {
      when(restOperations.exchange(any(URI.class), eq(HttpMethod.GET), any(), eq(Services.class)))
        .thenThrow(new ResourceAccessException("mocked"));

      assertThat(service.fetchServicesSnapshot()).isFalse();
    }

    @Test
    void fetchServicesSnapshot_withHttpNotFound_returnsFalse() {
      when(restOperations.exchange(any(URI.class), eq(HttpMethod.GET), any(), eq(Services.class)))
        .thenReturn(ResponseEntity.notFound().build());

      assertThat(service.fetchServicesSnapshot()).isFalse();
    }

    @Test
    void fetchServicesSnapshot_withHttpBadRequest_returnsFalse() {
      when(restOperations.exchange(any(URI.class), eq(HttpMethod.GET), any(), eq(Services.class)))
        .thenReturn(ResponseEntity.badRequest().build());

      assertThat(service.fetchServicesSnapshot()).isFalse();
    }

    @Test
    void fetchServicesSnapshot_withHttpNotModified_returnsFalse() {
      when(restOperations.exchange(any(URI.class), eq(HttpMethod.GET), any(), eq(Services.class)))
        .thenReturn(ResponseEntity.status(HttpStatus.NOT_MODIFIED).build());

      assertThat(service.fetchServicesSnapshot()).isFalse();
    }
  }
}
