package gov.ny.its.hs.maslow.author.model;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.catchThrowable;
import static org.assertj.core.api.Assertions.catchThrowableOfType;
import static org.assertj.core.api.Assumptions.assumeThat;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import java.io.File;
import java.util.ArrayList;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.springframework.util.ResourceUtils;

@DisplayName("A service document")
public class ServiceDocumentTests {
  private final ObjectMapper mapper = new ObjectMapper();

  private ServiceDocument REF;
  private ServiceDocument DOC;
  private Service ONE;
  private Service TWO;
  private Service FOO;

  protected ServiceDocument clone(ServiceDocument document) throws Exception {
    return mapper.readValue(mapper.writeValueAsBytes(document), ServiceDocument.class);
  }

  @BeforeAll
  void beforeAll() throws Exception {
    // When code is run within a Spring Boot context, the following module is already registered,
    // and a correctly-configured ObjectMapper can be autowired instead of created. But since these
    // unit tests do not run in a Spring Boot context, we have to initialize this bit ourselves.
    //
    // The JavaTimeModule adds Jackson support for JSR-310: Date and Time API (such as Instant).
    mapper.registerModule(new JavaTimeModule());

    File json = ResourceUtils.getFile("classpath:fixtures/services.json");
    REF = mapper.readValue(json, ServiceDocument.class);
    REF.resetServiceResourceVersions();
  }

  @BeforeEach
  void beforeEach() throws Exception {
    DOC = ServiceDocumentTests.this.clone(REF);
    ONE = DOC.getServices().get("ONE");
    TWO = DOC.getServices().get("TWO");
    FOO = TWO.toBuilder().key("FOO").rank(-1).build();
  }

  @Nested
  @DisplayName("with a known service present")
  class ServicePresentTests {

    @Test
    @DisplayName("returns requested service")
    void selectService_servicePresent_returnsService() {
      assumeThat(DOC.getServices().containsKey(ONE.getKey())).isTrue();

      Service observed = DOC.selectService(ONE.getKey());

      assertThat(observed).isEqualTo(ONE);
    }

    @Test
    @DisplayName("throws on insert of the same service")
    void insertService_servicePresent_throws() {
      assumeThat(DOC.getServices().containsKey(ONE.getKey())).isTrue();

      Throwable thrown = catchThrowableOfType(
        () -> DOC.insertService(ONE),
        IllegalArgumentException.class
      );

      assertThat(thrown).isInstanceOf(IllegalArgumentException.class);
    }

    @Test
    @DisplayName("updates the existing service")
    void updateService_servicePresent_updatesService() {
      assumeThat(DOC.getServices().containsKey(ONE.getKey())).isTrue();

      Service ONE_UP = ONE.toBuilder().formula("=SOMETHING_ELSE_ENTIRELY").build();

      Service previous = DOC.updateService(ONE_UP);
      Service observed = DOC.selectService(ONE.getKey());

      // Updating a service has the side effect of updating the modified date. We update that value
      // here so that we can use equality on other fields.
      ONE_UP.setModified(observed.getModified());

      assertThat(previous).isEqualTo(ONE);
      assertThat(observed).isEqualTo(ONE_UP);
    }

    @Test
    @DisplayName("returns an existing resource when present")
    void selectServiceResource_servicePresent_resourcePresent_returnsResource() {
      assumeThat(DOC.getServices().containsKey(ONE.getKey())).isTrue();
      assumeThat(DOC.getServices().get(ONE.getKey()).getResources().containsKey(ServiceLocales.EN))
        .isTrue();

      ServiceResource resource = DOC.selectServiceResource(ONE.getKey(), ServiceLocales.EN);

      assertThat(resource).isNotNull();
      assertThat(resource.getName()).isEqualTo("Program One");
    }

    @Test
    @DisplayName("returns null when the resource is missing")
    void selectServiceResource_servicePresent_resourceMissing_returnsNull() {
      assumeThat(DOC.getServices().containsKey(ONE.getKey())).isTrue();
      assumeThat(DOC.getServices().get(ONE.getKey()).getResources().containsKey(ServiceLocales.ZH))
        .isFalse();

      ServiceResource resource = DOC.selectServiceResource(ONE.getKey(), ServiceLocales.ZH);

      assertThat(resource).isNull();
    }

    @Test
    @DisplayName("updates the resource when present")
    void upsertServiceResource_servicePresent_resourcePresent_updatesResource() {
      final String key = ONE.getKey();
      final ServiceLocales lng = ServiceLocales.EN;

      assumeThat(DOC.getServices().containsKey(key)).isTrue();
      assumeThat(DOC.getServices().get(key).getResources().containsKey(lng)).isTrue();

      ServiceResource ONE_EN = DOC.selectServiceResource(key, lng);
      ServiceResource ONE_EN_UP = ONE_EN.toBuilder().category("FOO").build();

      ServiceResource previous = DOC.upsertServiceResource(key, lng, ONE_EN_UP);
      ServiceResource observed = DOC.selectServiceResource(key, lng);

      assertThat(previous).isEqualTo(ONE_EN);
      assertThat(observed).isEqualTo(ONE_EN_UP);
    }

    @Test
    @DisplayName("inserts the resource when missing")
    void upsertServiceResource_servicePresent_resourceMissing_insertsResource() {
      final String key = ONE.getKey();

      assumeThat(DOC.getServices().containsKey(key)).isTrue();
      assumeThat(DOC.getServices().get(key).getResources().containsKey(ServiceLocales.EN)).isTrue();
      assumeThat(DOC.getServices().get(key).getResources().containsKey(ServiceLocales.ZH))
        .isFalse();

      ServiceResource ONE_EN = DOC.selectServiceResource(key, ServiceLocales.EN);

      ServiceResource previous = DOC.upsertServiceResource(key, ServiceLocales.ZH, ONE_EN);
      ServiceResource observed = DOC.selectServiceResource(key, ServiceLocales.ZH);

      assertThat(previous).isNull();
      assertThat(observed).isEqualTo(ONE_EN);
    }

    @Test
    @DisplayName("updates the ranks")
    void updateServiceRanks_servicePresent_updatesServices() {
      assumeThat(DOC.getServices().containsKey(ONE.getKey())).isTrue();
      assumeThat(DOC.getServices().containsKey(TWO.getKey())).isTrue();
      assumeThat(DOC.selectService(ONE.getKey()).getRank()).isEqualTo(1);
      assumeThat(DOC.selectService(TWO.getKey()).getRank()).isEqualTo(2);

      ArrayList<ServiceRank> serviceRanks = new ArrayList<>();
      serviceRanks.add(new ServiceRank(ONE.getKey(), 2));
      serviceRanks.add(new ServiceRank(TWO.getKey(), 1));

      DOC.updateServiceRanks(serviceRanks);

      assertThat(DOC.selectService(ONE.getKey()).getRank()).isEqualTo(2);
      assertThat(DOC.selectService(TWO.getKey()).getRank()).isEqualTo(1);
    }
  }

  @Nested
  @DisplayName("with a known service missing")
  class ServiceMissingTests {

    @Test
    @DisplayName("returns null when requested service is missing")
    void selectService_serviceMissing_returnsNull() {
      assumeThat(DOC.getServices().containsKey(FOO.getKey())).isFalse();

      Service observed = DOC.selectService(FOO.getKey());

      assertThat(observed).isNull();
    }

    @Test
    @DisplayName("inserts new service on insert")
    void insertService_serviceMissing_insertsService() {
      assumeThat(DOC.getServices().containsKey(FOO.getKey())).isFalse();

      DOC.insertService(FOO);

      Service observed = DOC.selectService(FOO.getKey());

      // Inserting a service with rank = -1 has the side effect of updating both the rank and the
      // modified date. We update those values here so that we can use equality on other fields.
      FOO.setRank(observed.getRank());
      FOO.setModified(observed.getModified());

      assertThat(observed).isEqualTo(FOO);
    }

    @Test
    @DisplayName("throws when updating service that doesn't exist")
    void updateService_serviceMissing_throws() {
      assumeThat(DOC.getServices().containsKey(FOO.getKey())).isFalse();

      Throwable thrown = catchThrowable(() -> DOC.updateService(FOO));

      assertThat(thrown).isInstanceOf(IllegalArgumentException.class);
    }

    @Test
    @DisplayName("throws on select of resources on missing service")
    void selectServiceResource_serviceMissing_resourceMissing_throws() {
      assumeThat(DOC.getServices().containsKey(FOO.getKey())).isFalse();

      Throwable thrown = catchThrowable(
        () -> DOC.selectServiceResource(FOO.getKey(), ServiceLocales.ZH)
      );

      assertThat(thrown).isInstanceOf(IllegalArgumentException.class);
    }

    @Test
    @DisplayName("throws on updating ranks when service missing")
    void updateServiceRanks_serviceMissing_throws() {
      assumeThat(DOC.getServices().containsKey(ONE.getKey())).isTrue();
      assumeThat(DOC.getServices().containsKey(FOO.getKey())).isFalse();

      ArrayList<ServiceRank> serviceRanks = new ArrayList<>();
      serviceRanks.add(new ServiceRank(ONE.getKey(), 2));
      serviceRanks.add(new ServiceRank(FOO.getKey(), 1));

      Throwable thrown = catchThrowable(() -> DOC.updateServiceRanks(serviceRanks));

      assertThat(thrown).isInstanceOf(IllegalArgumentException.class);
    }
  }

  @Nested
  class UpdateServiceResourceVersionsTests {

    @Test
    void updateServiceResourceVersions_keyNotFound_throws() {
      assumeThat(DOC.getServices().containsKey(FOO.getKey())).isFalse();

      Throwable thrown = catchThrowable(() -> DOC.updateServiceResourceVersions(FOO.getKey()));

      assertThat(thrown).isInstanceOf(IllegalArgumentException.class);
    }

    @Test
    void updateServiceResourceVersions_updates() {
      assumeThat(DOC.getServices().containsKey(ONE.getKey())).isTrue();
      assumeThat(ONE.getResourceVersions().get(ServiceLocales.EN))
        .isEqualTo(ONE.getResourceVersions().get(ServiceLocales.ES));

      ServiceResource ONE_EN = ONE.getResources().get(ServiceLocales.EN);
      ServiceResource ONE_EN_UP = ONE_EN.toBuilder().category("FOO").build();
      DOC.upsertServiceResource(ONE.getKey(), ServiceLocales.EN, ONE_EN_UP);

      ONE = DOC.selectService(ONE.getKey());
      assertThat(ONE.getResourceVersions().get(ServiceLocales.EN))
        .isNotEqualTo(ONE.getResourceVersions().get(ServiceLocales.ES));

      DOC.updateServiceResourceVersions(ONE.getKey());
      assertThat(ONE.getResourceVersions().get(ServiceLocales.EN))
        .isEqualTo(ONE.getResourceVersions().get(ServiceLocales.ES));
    }
  }

  @Nested
  @DisplayName("with existing services")
  class UpdateServiceRankTests {

    @Test
    @DisplayName("throws if the keys are not unique")
    void updateServiceRanks_keysNotUnique_throws() {
      assumeThat(DOC.getServices().size()).isEqualTo(2);

      ArrayList<ServiceRank> serviceRanks = new ArrayList<>();
      serviceRanks.add(new ServiceRank(ONE.getKey(), 1));
      serviceRanks.add(new ServiceRank(ONE.getKey(), 2));

      Throwable thrown = catchThrowable(() -> DOC.updateServiceRanks(serviceRanks));

      assertThat(thrown).isInstanceOf(IllegalArgumentException.class);
    }

    @Test
    @DisplayName("throws if the ranks are not unique")
    void updateServiceRanks_ranksNotUnique_throws() {
      assumeThat(DOC.getServices().size()).isEqualTo(2);

      ArrayList<ServiceRank> serviceRanks = new ArrayList<>();
      serviceRanks.add(new ServiceRank(ONE.getKey(), 1));
      serviceRanks.add(new ServiceRank(TWO.getKey(), 1));

      Throwable thrown = catchThrowable(() -> DOC.updateServiceRanks(serviceRanks));

      assertThat(thrown).isInstanceOf(IllegalArgumentException.class);
    }

    @Test
    @DisplayName("throws if the ranks are larger than the number of services")
    void updateServiceRanks_ranksGreaterThanSize_throws() {
      assumeThat(DOC.getServices().size()).isEqualTo(2);

      ArrayList<ServiceRank> serviceRanks = new ArrayList<>();
      serviceRanks.add(new ServiceRank(ONE.getKey(), 200));
      serviceRanks.add(new ServiceRank(TWO.getKey(), 1));

      Throwable thrown = catchThrowable(() -> DOC.updateServiceRanks(serviceRanks));

      assertThat(thrown).isInstanceOf(IllegalArgumentException.class);
    }

    @Test
    @DisplayName("throws if the ranks are not a closed set")
    void updateServiceRanks_ranksNotClosedSet_throws() {
      assumeThat(DOC.getServices().size()).isEqualTo(2);
      DOC.insertService(FOO.toBuilder().key("TRI").rank(-1).build());
      DOC.insertService(FOO.toBuilder().key("QUA").rank(-1).build());
      assumeThat(DOC.getServices().size()).isEqualTo(4);

      ArrayList<ServiceRank> serviceRanks = new ArrayList<>();
      serviceRanks.add(new ServiceRank(ONE.getKey(), 3));
      serviceRanks.add(new ServiceRank(TWO.getKey(), 4));

      Throwable thrown = catchThrowable(() -> DOC.updateServiceRanks(serviceRanks));

      assertThat(thrown).isInstanceOf(IllegalArgumentException.class);
    }

    @Test
    @DisplayName("throws if move to head is used with batch serviceRanks")
    void updateServiceRanks_multiple_containsHeadRank_throws() {
      assumeThat(DOC.getServices().size()).isEqualTo(2);

      ArrayList<ServiceRank> serviceRanks = new ArrayList<>();
      serviceRanks.add(new ServiceRank(ONE.getKey(), 2));
      serviceRanks.add(new ServiceRank(TWO.getKey(), 0));

      Throwable thrown = catchThrowable(() -> DOC.updateServiceRanks(serviceRanks));

      assertThat(thrown).isInstanceOf(IllegalArgumentException.class);
    }

    @Test
    @DisplayName("throws if move to tail is used with batch serviceRanks")
    void updateServiceRanks_multiple_containsTailRank_throws() {
      assumeThat(DOC.getServices().size()).isEqualTo(2);

      ArrayList<ServiceRank> serviceRanks = new ArrayList<>();
      serviceRanks.add(new ServiceRank(ONE.getKey(), 2));
      serviceRanks.add(new ServiceRank(TWO.getKey(), -1));

      Throwable thrown = catchThrowable(() -> DOC.updateServiceRanks(serviceRanks));

      assertThat(thrown).isInstanceOf(IllegalArgumentException.class);
    }

    @Test
    @DisplayName("moves service to tail")
    void updateServiceRanks_moveToTail() {
      assumeThat(DOC.getServices().size()).isEqualTo(2);
      DOC.insertService(FOO);
      FOO = DOC.selectService(FOO.getKey());
      assumeThat(FOO.getRank()).isEqualTo(3);

      ArrayList<ServiceRank> serviceRanks = new ArrayList<>();
      serviceRanks.add(new ServiceRank(TWO.getKey(), -1));

      DOC.updateServiceRanks(serviceRanks);
      assertThat(TWO.getRank()).isEqualTo(3);
      assertThat(FOO.getRank()).isEqualTo(2);
    }

    @Test
    @DisplayName("moves service to head")
    void updateServiceRanks_moveToHead() {
      assumeThat(DOC.getServices().size()).isEqualTo(2);
      DOC.insertService(FOO);
      FOO = DOC.selectService(FOO.getKey());
      assumeThat(FOO.getRank()).isEqualTo(3);

      ArrayList<ServiceRank> serviceRanks = new ArrayList<>();
      serviceRanks.add(new ServiceRank(TWO.getKey(), 0));

      DOC.updateServiceRanks(serviceRanks);
      assertThat(TWO.getRank()).isEqualTo(1);
      assertThat(ONE.getRank()).isEqualTo(2);
      assertThat(FOO.getRank()).isEqualTo(3);
    }

    @Test
    @DisplayName("moves services to requested position")
    void updateServiceRanks_moveToRank() {
      assumeThat(DOC.getServices().size()).isEqualTo(2);
      DOC.insertService(FOO);
      FOO = DOC.selectService(FOO.getKey());
      assumeThat(FOO.getRank()).isEqualTo(3);

      ArrayList<ServiceRank> serviceRanks = new ArrayList<>();
      serviceRanks.add(new ServiceRank(ONE.getKey(), 2));

      DOC.updateServiceRanks(serviceRanks);
      assertThat(ONE.getRank()).isEqualTo(2);
      assertThat(TWO.getRank()).isEqualTo(1);
      assertThat(FOO.getRank()).isEqualTo(3);
    }

    @Test
    @DisplayName("swaps two services")
    void updateServiceRanks_swapPairOfRanks() {
      assumeThat(DOC.getServices().size()).isEqualTo(2);
      DOC.insertService(FOO);
      FOO = DOC.selectService(FOO.getKey());
      assumeThat(FOO.getRank()).isEqualTo(3);

      ArrayList<ServiceRank> serviceRanks = new ArrayList<>();
      serviceRanks.add(new ServiceRank(ONE.getKey(), 2));
      serviceRanks.add(new ServiceRank(TWO.getKey(), 1));

      DOC.updateServiceRanks(serviceRanks);
      assertThat(ONE.getRank()).isEqualTo(2);
      assertThat(TWO.getRank()).isEqualTo(1);
      assertThat(FOO.getRank()).isEqualTo(3);
    }

    @Test
    @DisplayName("reverses the rank of all services")
    void updateServiceRanks_reverseRanks() {
      assumeThat(DOC.getServices().size()).isEqualTo(2);
      DOC.insertService(FOO);
      FOO = DOC.selectService(FOO.getKey());
      assumeThat(FOO.getRank()).isEqualTo(3);

      ArrayList<ServiceRank> serviceRanks = new ArrayList<>();
      serviceRanks.add(new ServiceRank(ONE.getKey(), 3));
      serviceRanks.add(new ServiceRank(TWO.getKey(), 2));
      serviceRanks.add(new ServiceRank(FOO.getKey(), 1));

      DOC.updateServiceRanks(serviceRanks);
      assertThat(ONE.getRank()).isEqualTo(3);
      assertThat(TWO.getRank()).isEqualTo(2);
      assertThat(FOO.getRank()).isEqualTo(1);
    }
  }

  @Nested
  class UpsertResourceVersionsTests {

    // TODO(marcja): These tests are a bit verbose and overlap assertions with other tests above.
    // Try to make these tests more orthogonal and concise.

    @Test
    @DisplayName("throws when inserting service without EN resource")
    void insertService_withoutResourceEN_throws() {
      assumeThat(DOC.getServices().containsKey(FOO.getKey())).isFalse();

      Service BAD = FOO
        .toBuilder()
        .clearResources()
        .resource(
          ServiceLocales.ZH,
          ServiceResource
            .builder()
            .name("name")
            .category("category")
            .description("description")
            .build()
        )
        .build();

      Throwable thrown = catchThrowable(() -> DOC.insertService(BAD));

      assertThat(thrown).isInstanceOf(IllegalArgumentException.class);
    }

    @Test
    @DisplayName("throws when updating service without existing EN resource")
    void updateService_withoutResourceEN_throws() {
      assumeThat(DOC.getServices().containsKey(ONE.getKey())).isTrue();

      Service BAD = ONE
        .toBuilder()
        .clearResources()
        .resource(
          ServiceLocales.ZH,
          ServiceResource
            .builder()
            .name("name")
            .category("category")
            .description("description")
            .build()
        )
        .build();

      Throwable thrown = catchThrowable(() -> DOC.updateService(BAD));

      assertThat(thrown).isInstanceOf(IllegalArgumentException.class);
    }

    @Test
    @DisplayName("throws when upserting service resource without existing EN resource")
    void upsertServiceResource_withoutResourceEN_throws() {
      Service BAD = FOO
        .toBuilder()
        .clearResources()
        .resource(
          ServiceLocales.ZH,
          ServiceResource
            .builder()
            .name("name")
            .category("category")
            .description("description")
            .build()
        )
        .build();

      ServiceDocument FUD = DOC.toBuilder().service(BAD.getKey(), BAD).build();
      ServiceResource resourceZH = BAD.getResources().get(ServiceLocales.ZH);

      Throwable thrown = catchThrowable(
        () -> FUD.upsertServiceResource(FOO.getKey(), ServiceLocales.ZH, resourceZH)
      );

      assertThat(thrown).isInstanceOf(IllegalStateException.class);
    }

    @Test
    @DisplayName("inserts a service with upserted resource versions")
    void insertService_withResourceEN_insertsResourceVersions() {
      assumeThat(DOC.getServices().containsKey(FOO.getKey())).isFalse();

      DOC.insertService(FOO);

      Service observed = DOC.selectService(FOO.getKey());
      assertThat(observed).isNotNull();
      assertThat(observed.getResourceVersions()).isNotEmpty();
      assertThat(observed.getResourceVersions().size()).isEqualTo(observed.getResources().size());

      String resourceVersionEN = DOC
        .selectServiceResource(FOO.getKey(), ServiceLocales.EN)
        .version();
      assertThat(observed.getResourceVersions().get(ServiceLocales.EN))
        .isEqualTo(resourceVersionEN);
      assertThat(observed.getResourceVersions().get(ServiceLocales.ES))
        .isEqualTo(resourceVersionEN);
    }

    @Test
    @DisplayName("updates a service with upserted resource versions")
    void updateService_withResourceEN_upsertsResourceVersions() {
      assumeThat(DOC.getServices().containsKey(ONE.getKey())).isTrue();

      ServiceResource updatedResourceES = ONE
        .getResources()
        .get(ServiceLocales.ES)
        .toBuilder()
        .category("SOMETHING_ELSE")
        .build();
      Service ONE_UP = ONE.toBuilder().resource(ServiceLocales.ES, updatedResourceES).build();

      Service previous = DOC.updateService(ONE_UP);
      Service observed = DOC.selectService(ONE.getKey());

      // Updating a service has the side effect of updating the modified date. We update that value
      // here so that we can use equality on other fields.
      ONE_UP.setModified(observed.getModified());
      assertThat(previous).isEqualTo(ONE);
      assertThat(observed).isEqualTo(ONE_UP);

      assertThat(observed).isNotNull();
      assertThat(observed.getResourceVersions()).isNotEmpty();
      assertThat(observed.getResourceVersions().size()).isEqualTo(observed.getResources().size());

      String resourceVersionEN = DOC
        .selectServiceResource(ONE_UP.getKey(), ServiceLocales.EN)
        .version();
      assertThat(observed.getResourceVersions().get(ServiceLocales.EN))
        .isEqualTo(resourceVersionEN);
      assertThat(observed.getResourceVersions().get(ServiceLocales.ES))
        .isEqualTo(resourceVersionEN);
    }
  }

  @Test
  @DisplayName("upserts a service resource with upserted resource versions")
  void upsertServiceResource_withResourceEN_upserts() {
    final String key = ONE.getKey();
    final ServiceLocales lng = ServiceLocales.EN;

    assumeThat(DOC.getServices().containsKey(key)).isTrue();
    Service currentService = DOC.selectService(key);
    assumeThat(currentService.getResources().containsKey(lng)).isTrue();

    ServiceResource ONE_EN = DOC.selectServiceResource(key, lng);
    ServiceResource ONE_EN_UP = ONE_EN.toBuilder().category("FOO").build();

    ServiceResource previous = DOC.upsertServiceResource(key, lng, ONE_EN_UP);
    ServiceResource observed = DOC.selectServiceResource(key, lng);

    assertThat(previous).isEqualTo(ONE_EN);
    assertThat(observed).isEqualTo(ONE_EN_UP);

    Service updatedService = DOC.selectService(key);
    assertThat(updatedService.getResourceVersions()).isNotEmpty();
    assertThat(updatedService.getResourceVersions().size())
      .isEqualTo(updatedService.getResources().size());

    String currentVersionEN = ONE_EN.version();
    String updatedVersionEN = ONE_EN_UP.version();
    assertThat(updatedService.getResourceVersions().get(ServiceLocales.EN))
      .isEqualTo(updatedVersionEN);
    assertThat(updatedService.getResourceVersions().get(ServiceLocales.ES))
      .isEqualTo(currentVersionEN);
  }
}
