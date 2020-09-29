package gov.ny.its.hs.maslow.author.model;

import static gov.ny.its.hs.maslow.author.assertions.ConstraintViolationSetAssert.assertThat;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import gov.ny.its.hs.maslow.author.model.ServiceResource.ServiceResourceBuilder;
import java.io.File;
import java.math.BigInteger;
import java.time.Instant;
import java.util.stream.Stream;
import javax.validation.Validation;
import javax.validation.Validator;
import javax.validation.ValidatorFactory;
import lombok.val;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.MethodSource;
import org.junit.jupiter.params.provider.ValueSource;
import org.springframework.util.ResourceUtils;

@DisplayName("Validation")
public class ValidationTests {
  private final ObjectMapper mapper = new ObjectMapper();

  private Validator validator;
  private ServiceDocument REF;
  private ServiceDocument DOC;
  private Service ONE;

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

    ValidatorFactory factory = Validation.buildDefaultValidatorFactory();
    validator = factory.getValidator();

    File json = ResourceUtils.getFile("classpath:fixtures/services.json");
    REF = mapper.readValue(json, ServiceDocument.class);
  }

  @BeforeEach
  void beforeEach() throws Exception {
    DOC = ValidationTests.this.clone(REF);
    ONE = DOC.getServices().get("ONE");
  }

  @Nested
  @DisplayName("on service document")
  class ServiceDocumentValidationTests {

    @Test
    @DisplayName("validates test fixture")
    void testFixtureIsValid() {
      val violations = validator.validate(DOC);

      assertThat(violations).isEmpty();
    }

    @Test
    @DisplayName("validates that 'id' is not negative")
    void validate_id_isNotNegative() {
      ServiceDocument BAD = DOC.toBuilder().id(BigInteger.valueOf(-1)).build();

      val violations = validator.validate(BAD);

      assertThat(violations).hasSize(1);
      assertThat(violations).hasViolationOnPath("id");
    }

    @Test
    @DisplayName("validates that 'id' is not positive")
    void validate_id_isNotPositive() {
      ServiceDocument BAD = DOC.toBuilder().id(BigInteger.valueOf(1)).build();

      val violations = validator.validate(BAD);

      assertThat(violations).hasSize(1);
      assertThat(violations).hasViolationOnPath("id");
    }

    @Test
    @DisplayName("validates that 'modified' is not null")
    void validate_modified_isNotNull() {
      ServiceDocument BAD = DOC.toBuilder().modified(null).build();

      val violations = validator.validate(BAD);

      assertThat(violations).hasSize(1);
      assertThat(violations).hasViolationOnPath("modified");
    }

    @Test
    @DisplayName("validates that 'services' is not null")
    void validate_services_isNotNull() {
      ServiceDocument BAD = new ServiceDocument(BigInteger.ZERO, 0L, Instant.now(), null);

      val violations = validator.validate(BAD);

      assertThat(violations).hasSize(1);
      assertThat(violations).hasViolationOnPath("services");
    }
  }

  @Nested
  @DisplayName("on service")
  class ServiceValidationTests {

    @Test
    @DisplayName("validates 'key' is not null")
    void validate_key_isNotNull() {
      Service BAD = ONE.toBuilder().key(null).build();

      val violations = validator.validate(BAD);

      assertThat(violations).hasSize(1);
      assertThat(violations).hasViolationOnPath("key");
    }

    @ParameterizedTest
    @ValueSource(strings = { "one", " ONE ", "1", "_ONE" })
    @DisplayName("validates 'key' matches pattern")
    void validate_key_matchesPattern(String key) {
      Service BAD = ONE.toBuilder().key(key).build();

      val violations = validator.validate(BAD);

      assertThat(violations).hasSize(1);
      assertThat(violations).hasViolationOnPath("key");
    }

    @Test
    @DisplayName("validates 'rank' is not null")
    void validate_rank_isNotNull() {
      Service BAD = ONE.toBuilder().rank(null).build();

      val violations = validator.validate(BAD);

      assertThat(violations).hasSize(1);
      assertThat(violations).hasViolationOnPath("rank");
    }

    @Test
    @DisplayName("validates 'rank' is greater than or equal to -1")
    void validate_rank_isWithinRange() {
      Service BAD = ONE.toBuilder().rank(-2).build();

      val violations = validator.validate(BAD);

      assertThat(violations).hasSize(1);
      assertThat(violations).hasViolationOnPath("rank");
    }

    @Test
    @DisplayName("validates 'enabled' is not null")
    void validate_enabled_isNotNull() {
      Service BAD = ONE.toBuilder().enabled(null).build();

      val violations = validator.validate(BAD);

      assertThat(violations).hasSize(1);
      assertThat(violations).hasViolationOnPath("enabled");
    }

    Stream<String> validFormulaProvider() {
      return Stream.of(
        "=FALSE",
        "=TRUE",
        "=OR(CHILDREN_06_17, CHILDREN_00_05)",
        "=AND(NOT(IS_EMPLOYMENT_AFFECTED), IS_MILITARY)",
        "=IFS(OR(IS_PAY_FOR_DEPENDENT_CARE, IS_DISABLED, ADULTS_60_PLUS), HOUSEHOLD_INCOME <= (2126 + (HOUSEHOLD_SIZE - 1) * 747), HOUSEHOLD_EMPLOYED, HOUSEHOLD_INCOME <= (1595 + (HOUSEHOLD_SIZE - 1) * 560), AND(NOT(HOUSEHOLD_EMPLOYED), NOT(IS_DISABLED), NOT(ADULTS_60_PLUS), NOT(IS_PAY_FOR_DEPENDENT_CARE)), HOUSEHOLD_INCOME <= (1383 + (HOUSEHOLD_SIZE - 1) * 486))"
      );
    }

    Stream<String> invalidFormulaProvider() {
      return Stream.of("=", "TRUE");
    }

    @ParameterizedTest
    @MethodSource("validFormulaProvider")
    @DisplayName("validates 'formula' matches valid formulas")
    void validate_formula_validPattern(String formula) {
      Service YEP = ONE.toBuilder().formula(formula).build();

      val violations = validator.validate(YEP);

      assertThat(violations).isEmpty();
    }

    @ParameterizedTest
    @MethodSource("invalidFormulaProvider")
    @DisplayName("validates 'formula' does not match invalid formulas")
    void validate_formula_invalidPattern(String formula) {
      Service BAD = ONE.toBuilder().formula(formula).build();

      val violations = validator.validate(BAD);

      assertThat(violations).hasSize(1);
      assertThat(violations).hasViolationOnPath("formula");
    }

    Stream<String> validUrlProvider() {
      // URL regexp and test cases courtesy of https://regexr.com/3um70
      return Stream.of(
        "https://foo.com/blah_blah",
        "https://foo.com/blah_blah/",
        "https://foo.com/blah_blah_(wikipedia)",
        "https://foo.com/blah_blah_(wikipedia)_(again)",
        "http://www.example.com/wpstyle/?p=364",
        "http://foo.com/blah_blah",
        "http://foo.com/blah_blah/",
        "http://foo.com/blah_blah_(wikipedia)",
        "http://foo.com/blah_blah_(wikipedia)_(again)",
        "http://www.example.com/wpstyle/?p=364",
        "https://www.example.com/foo/?bar=baz&inga=42&quux",
        "http://✪df.ws/123",
        "http://userid:password@example.com:8080",
        "http://userid:password@example.com:8080/",
        "http://userid@example.com",
        "http://userid@example.com/",
        "http://userid@example.com:8080",
        "http://userid@example.com:8080/",
        "http://userid:password@example.com",
        "http://userid:password@example.com/",
        "http://142.42.1.1/",
        "http://142.42.1.1:8080/",
        "http://➡.ws/䨹",
        "http://⌘.ws",
        "http://⌘.ws/",
        "http://foo.com/blah_(wikipedia)#cite-1",
        "http://foo.com/blah_(wikipedia)_blah#cite-1",
        "http://foo.com/unicode_(✪)_in_parens",
        "http://foo.com/(something)?after=parens",
        "http://☺.damowmow.com/",
        "http://code.google.com/events/#&product=browser",
        "http://j.mp",
        "http://foo.bar/?q=Test%20URL-encoded%20stuff",
        "http://مثال.إختبار",
        "http://例子.测试",
        "http://उदाहरण.परीक्षा",
        "http://-.~_!$&'()*+,;=:%40:80%2f::::::@example.com",
        "http://1337.net",
        "http://a.b-c.de",
        "http://223.255.255.254",
        "http://0.0.0.0"
      );
    }

    Stream<String> invalidUrlProvider() {
      // URL regexp and test cases courtesy of https://regexr.com/3um70
      return Stream.of(
        "file:///blah/index.html",
        "http://",
        "http://.",
        "http://..",
        "http://../",
        "http://?",
        "http://??",
        "http://??/",
        "http://#",
        "http://##",
        "http://##/",
        "http://foo.bar?q=Spaces should be encoded",
        "//",
        "//a",
        "///a",
        "///",
        "foo.com",
        "rdar://1234",
        "h://test",
        "http:// shouldfail.com",
        ":// should fail",
        "http://foo.bar/foo(bar)baz quux",
        "ftps://foo.bar/",
        "http://.www.foo.bar/",
        "http://.www.foo.bar./"
      );
    }

    @ParameterizedTest
    @MethodSource("validUrlProvider")
    @DisplayName("validates 'applicationUrl' matches valid URLs")
    void validate_applicationUrl_validPattern(String url) {
      Service YEP = ONE.toBuilder().applicationUrl(url).build();

      val violations = validator.validate(YEP);

      assertThat(violations).isEmpty();
    }

    @ParameterizedTest
    @MethodSource("invalidUrlProvider")
    @DisplayName("validates 'applicationUrl' does not match invalid URLs")
    void validate_applicationUrl_invalidPattern(String url) {
      Service BAD = ONE.toBuilder().applicationUrl(url).build();

      val violations = validator.validate(BAD);

      assertThat(violations).hasSize(1);
      assertThat(violations).hasViolationOnPath("applicationUrl");
    }

    @ParameterizedTest
    @MethodSource("validUrlProvider")
    @DisplayName("validates 'informationUrl' matches valid URLs")
    void validate_informationUrl_validPattern(String url) {
      Service YEP = ONE.toBuilder().informationUrl(url).build();

      val violations = validator.validate(YEP);

      assertThat(violations).isEmpty();
    }

    @ParameterizedTest
    @MethodSource("invalidUrlProvider")
    @DisplayName("validates 'informationUrl' does not match invalid URLs")
    void validate_informationUrl_invalidPattern(String url) {
      Service BAD = ONE.toBuilder().informationUrl(url).build();

      val violations = validator.validate(BAD);

      assertThat(violations).hasSize(1);
      assertThat(violations).hasViolationOnPath("informationUrl");
    }

    @Test
    @DisplayName("validates 'resources' is not null")
    void validate_resources_isNotNull() {
      Service BAD = new Service(
        ONE.getKey(),
        ONE.getRank(),
        ONE.getModified(),
        ONE.getEnabled(),
        ONE.getFormula(),
        ONE.getApplicationUrl(),
        ONE.getInformationUrl(),
        null,
        ONE.getResourceVersions()
      );

      val violations = validator.validate(BAD);

      assertThat(violations).hasSize(1);
      assertThat(violations).hasViolationOnPath("resources");
    }
  }

  @Nested
  @DisplayName("on service resource")
  class ServiceResourceValidationTests {

    private ServiceResourceBuilder toResourceBuilder(Service service) {
      return DOC.selectServiceResource(service.getKey(), ServiceLocales.EN).toBuilder();
    }

    @Test
    @DisplayName("validates that 'name' is not null")
    void validate_name_isNotNull() {
      ServiceResource BAD = toResourceBuilder(ONE).name(null).build();

      val violations = validator.validate(BAD);

      assertThat(violations).hasSize(1);
      assertThat(violations).hasViolationOnPath("name");
    }

    @Test
    @DisplayName("validates that 'name' is not blank")
    void validate_name_isNotBlank() {
      ServiceResource BAD = toResourceBuilder(ONE).name("").build();

      val violations = validator.validate(BAD);

      assertThat(violations).hasSize(1);
      assertThat(violations).hasViolationOnPath("name");
    }

    @Test
    @DisplayName("validates that 'category' is not null")
    void validate_category_isNotNull() {
      ServiceResource BAD = toResourceBuilder(ONE).category(null).build();

      val violations = validator.validate(BAD);

      assertThat(violations).hasSize(1);
      assertThat(violations).hasViolationOnPath("category");
    }

    @Test
    @DisplayName("validates that 'category' is not blank")
    void validate_category_isNotBlank() {
      ServiceResource BAD = toResourceBuilder(ONE).category("").build();

      val violations = validator.validate(BAD);

      assertThat(violations).hasSize(1);
      assertThat(violations).hasViolationOnPath("category");
    }

    @Test
    @DisplayName("validates that 'description' is not null")
    void validate_description_isNotNull() {
      ServiceResource BAD = toResourceBuilder(ONE).description(null).build();

      val violations = validator.validate(BAD);

      assertThat(violations).hasSize(1);
      assertThat(violations).hasViolationOnPath("description");
    }

    @Test
    @DisplayName("validates that 'description' is not blank")
    void validate_description_isNotBlank() {
      ServiceResource BAD = toResourceBuilder(ONE).description("").build();

      val violations = validator.validate(BAD);

      assertThat(violations).hasSize(1);
      assertThat(violations).hasViolationOnPath("description");
    }
  }

  @Nested
  @DisplayName("on service rank")
  class ServiceRankValidationTests {

    @Test
    @DisplayName("validates that 'key' is not null")
    void validate_key_isNotNull() {
      ServiceRank BAD = new ServiceRank(null, 0);

      val violations = validator.validate(BAD);

      assertThat(violations).hasSize(1);
      assertThat(violations).hasViolationOnPath("key");
    }

    @Test
    @DisplayName("validates that 'key' is not blank")
    void validate_key_isNotBlank() {
      ServiceRank BAD = new ServiceRank("", 0);

      val violations = validator.validate(BAD);

      assertThat(violations).hasSize(1);
      assertThat(violations).hasViolationOnPath("key");
    }

    @Test
    @DisplayName("validates that 'rank' is not null")
    void validate_rank_isNotNull() {
      ServiceRank BAD = new ServiceRank("BAD", null);

      val violations = validator.validate(BAD);

      assertThat(violations).hasSize(1);
      assertThat(violations).hasViolationOnPath("rank");
    }

    @Test
    @DisplayName("validates that 'rank' is greater than or equal to -1")
    void validate_rank_isWithinRange() {
      ServiceRank BAD = new ServiceRank("BAD", -2);

      val violations = validator.validate(BAD);

      assertThat(violations).hasSize(1);
      assertThat(violations).hasViolationOnPath("rank");
    }
  }
}
