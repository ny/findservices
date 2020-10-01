package gov.ny.its.hs.maslow.author.controller;

import static org.mockito.Mockito.doReturn;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.header;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

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
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.SpyBean;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.util.ResourceUtils;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
public class ServiceControllerTests {
  // TODO(marcja): Add @DisplayName annotations to make tests more readable.

  // TODO(marcja): Consider adding @Nested test classes to make tests more readable

  // TODO(marcja): Consider adding additional mockMvc expectations. Many possible expectations would
  // be redundant given the tests in ServiceDocumentTests, but a few extra might be useful.

  private static final String SERVICES = "/api/author/v1/services";
  private static final String SERVICES_KEY = "/api/author/v1/services/{key}";
  private static final String SERVICES_KEY_LNG = "/api/author/v1/services/{key}/locales/{lng}";
  private static final String SERVICES_KEY_VER = "/api/author/v1/services/{keys}/locales:update";
  private static final String SERVICES_RANK = "/api/author/v1/services:rank";

  @Autowired
  private ObjectMapper mapper;

  @Autowired
  private MockMvc mockMvc;

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

  private String toJson(final Object value) throws Exception {
    return mapper.writeValueAsString(value);
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
    mockMvc
      .perform(get(SERVICES))
      .andExpect(status().isOk())
      .andExpect(header().string("Cache-Control", "no-cache"))
      .andExpect(header().exists("ETag"))
      .andExpect(header().exists("Last-Modified"));
  }

  @Test
  void insertService_serviceInvalid_returnsBadRequest() throws Exception {
    String json = "{key: 'FOO'}";
    mockMvc
      .perform(post(SERVICES).contentType(MediaType.APPLICATION_JSON).content(json))
      .andExpect(status().isBadRequest());
  }

  @Test
  void insertService_servicePresent_returnsConflict() throws Exception {
    mockMvc
      .perform(post(SERVICES).contentType(MediaType.APPLICATION_JSON).content(toJson(ONE)))
      .andExpect(status().isConflict());
  }

  @Test
  void insertService_serviceMissing_returnsCreated() throws Exception {
    Service FOO = ONE.toBuilder().key(getUniqueKey()).build();
    DOC.getServices().put(FOO.getKey(), FOO);
    doReturn(DOC).when(mongoTemplate).save(Mockito.any(ServiceDocument.class));

    mockMvc
      .perform(post(SERVICES).contentType(MediaType.APPLICATION_JSON).content(toJson(FOO)))
      .andExpect(status().isCreated())
      .andExpect(header().string("Cache-Control", "no-cache"))
      .andExpect(header().exists("ETag"))
      .andExpect(header().exists("Last-Modified"));
  }

  @Test
  void selectService_servicePresent_returnsOk() throws Exception {
    mockMvc
      .perform(get(SERVICES_KEY, "ONE"))
      .andExpect(status().isOk())
      .andExpect(header().string("Cache-Control", "no-cache"))
      .andExpect(header().exists("ETag"))
      .andExpect(header().exists("Last-Modified"));
  }

  @Test
  void selectService_serviceMissing_returnsNotFound() throws Exception {
    mockMvc.perform(get(SERVICES_KEY, getUniqueKey())).andExpect(status().isNotFound());
  }

  @Test
  void updateService_servicePresent_updatesService_returnsOk() throws Exception {
    Service ONE_UP = ONE.toBuilder().formula(getUniqueFormula()).build();
    mockMvc
      .perform(
        put(SERVICES_KEY, ONE_UP.getKey())
          .contentType(MediaType.APPLICATION_JSON)
          .content(toJson(ONE_UP))
      )
      .andExpect(status().isOk())
      .andExpect(header().string("Cache-Control", "no-cache"))
      .andExpect(header().exists("ETag"))
      .andExpect(header().exists("Last-Modified"));
  }

  @Test
  void updateService_serviceMissing_insertsService_returnsBadRequest() throws Exception {
    Service FOO = ONE.toBuilder().key(getUniqueKey()).build();
    mockMvc
      .perform(
        put(SERVICES_KEY, FOO.getKey()).contentType(MediaType.APPLICATION_JSON).content(toJson(FOO))
      )
      .andExpect(status().isBadRequest());
  }

  @Test
  void selectServiceResource_servicePresent_resourcePresent_returnsOk() throws Exception {
    mockMvc
      .perform(get(SERVICES_KEY_LNG, "ONE", "EN"))
      .andExpect(status().isOk())
      .andExpect(header().string("Cache-Control", "no-cache"))
      .andExpect(header().exists("ETag"));
  }

  @Test
  void selectServiceResource_servicePresent_resourceMissing_returnsNotFound() throws Exception {
    mockMvc.perform(get(SERVICES_KEY_LNG, "ONE", "ZH")).andExpect(status().isNotFound());
  }

  @Test
  void selectServiceResource_serviceMissing_returnsNotFound() throws Exception {
    mockMvc.perform(get(SERVICES_KEY_LNG, getUniqueKey(), "EN")).andExpect(status().isNotFound());
  }

  @Test
  void upsertServiceResource_servicePresent_resourcePresent() throws Exception {
    ServiceResource ONE_EN = ONE.getResources().get(ServiceLocales.EN);
    ServiceResource ONE_EN_UP = ONE_EN.toBuilder().category("FOO").build();
    mockMvc
      .perform(
        put(SERVICES_KEY_LNG, ONE.getKey(), "EN")
          .contentType(MediaType.APPLICATION_JSON)
          .content(toJson(ONE_EN_UP))
      )
      .andExpect(status().isOk())
      .andExpect(header().string("Cache-Control", "no-cache"))
      .andExpect(header().exists("ETag"));
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
    // ServiceDocument DOC_UP = DOC.toBuilder().service(ONE_UP.getKey(), ONE_UP).build();
    DOC.getServices().put(ONE_UP.getKey(), ONE_UP);
    doReturn(DOC).when(mongoTemplate).save(Mockito.any(ServiceDocument.class));

    mockMvc
      .perform(
        put(SERVICES_KEY_LNG, ONE.getKey(), "ZH")
          .contentType(MediaType.APPLICATION_JSON)
          .content(toJson(ONE_ZH_UP))
      )
      .andExpect(status().isOk())
      .andExpect(header().string("Cache-Control", "no-cache"))
      .andExpect(header().exists("ETag"));
  }

  @Test
  void upsertServiceResource_serviceMissing() throws Exception {
    ServiceResource ONE_EN = ONE.getResources().get(ServiceLocales.EN);
    mockMvc
      .perform(
        put(SERVICES_KEY_LNG, getUniqueKey(), "EN")
          .contentType(MediaType.APPLICATION_JSON)
          .content(toJson(ONE_EN))
      )
      .andExpect(status().isBadRequest());
  }

  @Test
  void updateServiceResourceVersions_servicePresent_returnsOk() throws Exception {
    mockMvc.perform(post(SERVICES_KEY_VER, ONE.getKey())).andExpect(status().isOk());
  }

  @Test
  void updateServiceRanks_servicesPresent_returnsOk() throws Exception {
    ArrayList<ServiceRank> serviceRanks = new ArrayList<>();
    serviceRanks.add(ServiceRank.builder().key("ONE").rank(2).build());
    serviceRanks.add(ServiceRank.builder().key("TWO").rank(1).build());
    mockMvc
      .perform(
        post(SERVICES_RANK).contentType(MediaType.APPLICATION_JSON).content(toJson(serviceRanks))
      )
      .andExpect(status().isOk())
      .andExpect(header().string("Cache-Control", "no-cache"))
      .andExpect(header().exists("ETag"))
      .andExpect(header().exists("Last-Modified"));
  }

  @Test
  void updateServiceRanks_servicesMissing_returnsBadRequest() throws Exception {
    ArrayList<ServiceRank> serviceRanks = new ArrayList<>();
    serviceRanks.add(ServiceRank.builder().key("ONE").rank(2).build());
    serviceRanks.add(ServiceRank.builder().key(getUniqueKey()).rank(1).build());
    mockMvc
      .perform(
        post(SERVICES_RANK).contentType(MediaType.APPLICATION_JSON).content(toJson(serviceRanks))
      )
      .andExpect(status().isBadRequest());
  }
}
