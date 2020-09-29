package gov.ny.its.hs.maslow.author.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.catchThrowableOfType;
import static org.mockito.Mockito.doReturn;

import com.fasterxml.jackson.databind.ObjectMapper;
import gov.ny.its.hs.maslow.author.model.Service;
import gov.ny.its.hs.maslow.author.model.ServiceDocument;
import gov.ny.its.hs.maslow.author.model.ServiceLocales;
import gov.ny.its.hs.maslow.author.model.ServiceRank;
import gov.ny.its.hs.maslow.author.model.ServiceResource;
import java.io.File;
import java.math.BigInteger;
import java.util.ArrayList;
import java.util.UUID;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.Mockito;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.SpyBean;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.util.ResourceUtils;
import org.springframework.web.server.ResponseStatusException;

@SpringBootTest
@ActiveProfiles("test")
public class ServiceServiceTests {
  @Autowired
  private ServiceService impl;

  @Autowired
  private ObjectMapper mapper;

  @SpyBean
  private MongoTemplate mongoTemplate;

  private ServiceDocument REF;
  private ServiceDocument DOC;
  private Service ONE;

  private static String getUniqueKey() {
    return "UUID_" + UUID.randomUUID().toString().toUpperCase().replace('-', '_');
  }

  private static String getUniqueFormula() {
    return "=" + UUID.randomUUID().toString().toUpperCase().replace('-', '_');
  }

  private ServiceDocument clone(ServiceDocument document) throws Exception {
    return mapper.readValue(mapper.writeValueAsBytes(document), ServiceDocument.class);
  }

  private <T> void assertHttpStatus(ResponseEntity<T> resp, HttpStatus httpStatus) {
    assertThat(resp.getStatusCode()).isEqualTo(httpStatus);
    assertThat(resp.getHeaders().getCacheControl()).isEqualTo("no-cache");
    assertThat(resp.getHeaders().getETag()).isNotEmpty();
    assertThat(resp.getHeaders().containsKey(HttpHeaders.ETAG)).isTrue();
  }

  private <T> void assertHttpStatusOK(ResponseEntity<T> resp) {
    assertHttpStatus(resp, HttpStatus.OK);
  }

  @BeforeAll
  void beforeAll() throws Exception {
    File json = ResourceUtils.getFile("classpath:fixtures/services.json");
    REF = mapper.readValue(json, ServiceDocument.class);

    // Modify the embedded instance of MongoDB to have the two reference services we use throughout
    // these integration tests.
    ServiceDocument doc = mongoTemplate.findById(BigInteger.ZERO, ServiceDocument.class);
    doc.insertService(REF.getServices().get("ONE"));
    doc.insertService(REF.getServices().get("TWO"));
    REF = mongoTemplate.save(doc);
  }

  @BeforeEach
  void beforeEach() throws Exception {
    DOC = clone(REF);
    ONE = DOC.getServices().get("ONE");

    // It's important to mock out any calls to MongoTemplate.save, otherwise all these integration
    // tests will stomp on each other. Returning the unchanged DOC is reasonable in most tests, but
    // there are a few below where the mock is updated.
    doReturn(DOC).when(mongoTemplate).save(Mockito.any(ServiceDocument.class));
  }

  @Test
  void selectServices_returnsOk() throws Exception {
    ResponseEntity<ServiceDocument> resp = impl.selectServices();
    assertHttpStatusOK(resp);
  }

  @Test
  void insertService_serviceInvalid_returnsBadRequest() throws Exception {
    Service BAD = Service.builder().key("BAD").build();

    ResponseStatusException thrown = catchThrowableOfType(
      () -> impl.insertService(BAD),
      ResponseStatusException.class
    );

    assertThat(thrown.getStatus()).isEqualTo(HttpStatus.CONFLICT);
  }

  @Test
  void insertService_servicePresent_returnsConflict() throws Exception {
    ResponseStatusException thrown = catchThrowableOfType(
      () -> impl.insertService(ONE),
      ResponseStatusException.class
    );

    assertThat(thrown.getStatus()).isEqualTo(HttpStatus.CONFLICT);
  }

  @Test
  void insertService_serviceMissing_returnsCreated() throws Exception {
    Service FOO = ONE.toBuilder().key(getUniqueKey()).build();
    DOC.getServices().put(FOO.getKey(), FOO);
    doReturn(DOC).when(mongoTemplate).save(Mockito.any(ServiceDocument.class));
    ResponseEntity<Service> resp = impl.insertService(FOO);
    assertHttpStatus(resp, HttpStatus.CREATED);
  }

  @Test
  void selectService_servicePresent_returnsOk() throws Exception {
    ResponseEntity<Service> resp = impl.selectService(ONE.getKey());
    assertHttpStatusOK(resp);
  }

  @Test
  void selectService_serviceMissing_returnsNotFound() throws Exception {
    ResponseStatusException thrown = catchThrowableOfType(
      () -> impl.selectService(getUniqueKey()),
      ResponseStatusException.class
    );

    assertThat(thrown.getStatus()).isEqualTo(HttpStatus.NOT_FOUND);
  }

  @Test
  void updateService_servicePresent_updatesService_returnsOk() throws Exception {
    Service ONE_UP = ONE.toBuilder().formula(getUniqueFormula()).build();
    ResponseEntity<Service> resp = impl.updateService(ONE_UP.getKey(), null, ONE_UP);
    assertHttpStatusOK(resp);
  }

  @Test
  void updateService_serviceMissing_insertsService_returnsBadRequest() throws Exception {
    Service FOO = ONE.toBuilder().key(getUniqueKey()).build();
    ResponseStatusException thrown = catchThrowableOfType(
      () -> impl.updateService(FOO.getKey(), null, FOO),
      ResponseStatusException.class
    );

    assertThat(thrown.getStatus()).isEqualTo(HttpStatus.BAD_REQUEST);
  }

  @Test
  void selectServiceResource_servicePresent_resourcePresent_returnsOk() throws Exception {
    ResponseEntity<ServiceResource> resp = impl.selectServiceResource(
      ONE.getKey(),
      ServiceLocales.EN
    );
    assertHttpStatusOK(resp);
  }

  @Test
  void selectServiceResource_servicePresent_resourceMissing_returnsNotFound() throws Exception {
    ResponseStatusException thrown = catchThrowableOfType(
      () -> impl.selectServiceResource(ONE.getKey(), ServiceLocales.ZH),
      ResponseStatusException.class
    );

    assertThat(thrown.getStatus()).isEqualTo(HttpStatus.NOT_FOUND);
  }

  @Test
  void selectServiceResource_serviceMissing_returnsNotFound() throws Exception {
    ResponseStatusException thrown = catchThrowableOfType(
      () -> impl.selectServiceResource(getUniqueKey(), ServiceLocales.EN),
      ResponseStatusException.class
    );

    assertThat(thrown.getStatus()).isEqualTo(HttpStatus.NOT_FOUND);
  }

  @Test
  void upsertServiceResource_servicePresent_resourcePresent() throws Exception {
    ServiceResource ONE_EN = ONE.getResources().get(ServiceLocales.EN);
    ServiceResource ONE_EN_UP = ONE_EN.toBuilder().category("FOO").build();
    ResponseEntity<ServiceResource> resp = impl.upsertServiceResource(
      ONE.getKey(),
      ServiceLocales.EN,
      null,
      ONE_EN_UP
    );
    assertHttpStatusOK(resp);
  }

  @Test
  void upsertServiceResource_servicePresent_resourceMissing() throws Exception {
    ServiceResource ONE_ZH_UP = ONE
      .getResources()
      .get(ServiceLocales.EN)
      .toBuilder()
      .category("FOO")
      .build();
    Service ONE_UP = ONE.toBuilder().resource(ServiceLocales.ZH, ONE_ZH_UP).build();
    DOC.getServices().put(ONE_UP.getKey(), ONE_UP);
    doReturn(DOC).when(mongoTemplate).save(Mockito.any(ServiceDocument.class));

    ResponseEntity<ServiceResource> resp = impl.upsertServiceResource(
      ONE.getKey(),
      ServiceLocales.ZH,
      null,
      ONE_ZH_UP
    );
    assertHttpStatusOK(resp);
  }

  @Test
  void upsertServiceResource_serviceMissing() throws Exception {
    ServiceResource ONE_EN = ONE.getResources().get(ServiceLocales.EN);
    ResponseStatusException thrown = catchThrowableOfType(
      () -> impl.upsertServiceResource(getUniqueKey(), ServiceLocales.EN, null, ONE_EN),
      ResponseStatusException.class
    );

    assertThat(thrown.getStatus()).isEqualTo(HttpStatus.BAD_REQUEST);
  }

  @Test
  void updateServiceResourceVersions_servicePresent_returnsOk() throws Exception {
    ResponseEntity<Service> resp = impl.updateServiceResourceVersions(ONE.getKey());
    assertHttpStatusOK(resp);
  }

  @Test
  void updateServiceRanks_servicesPresent_returnsOk() throws Exception {
    ArrayList<ServiceRank> serviceRanks = new ArrayList<>();
    serviceRanks.add(ServiceRank.builder().key("ONE").rank(2).build());
    serviceRanks.add(ServiceRank.builder().key("TWO").rank(1).build());

    ResponseEntity<ServiceDocument> resp = impl.updateServiceRanks(serviceRanks);
    assertHttpStatusOK(resp);
  }

  @Test
  void updateServiceRanks_servicesMissing_returnsBadRequest() throws Exception {
    ArrayList<ServiceRank> serviceRanks = new ArrayList<>();
    serviceRanks.add(ServiceRank.builder().key("ONE").rank(2).build());
    serviceRanks.add(ServiceRank.builder().key(getUniqueKey()).rank(1).build());

    ResponseStatusException thrown = catchThrowableOfType(
      () -> impl.updateServiceRanks(serviceRanks),
      ResponseStatusException.class
    );

    assertThat(thrown.getStatus()).isEqualTo(HttpStatus.BAD_REQUEST);
  }
}
