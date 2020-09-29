package gov.ny.its.hs.maslow.author.assertions;

import com.google.common.collect.Iterables;
import java.util.Set;
import java.util.stream.Collectors;
import javax.validation.ConstraintViolation;
import org.assertj.core.api.AbstractAssert;

/**
 * Defines a custom AssertJ matcher for the results of {@link javax.validation.Validator#validate}.
 *
 * Adapted from https://www.wimdeblauwe.com/blog/2016/2016-04-01-assertj-custom-assertion-for-testing-constraintvalidator-implementations/
 */
public class ConstraintViolationSetAssert
  extends AbstractAssert<ConstraintViolationSetAssert, Set<? extends ConstraintViolation<?>>> {

  /**
   * Constructs an instance of the ConstraintViolationSetAssert matcher.
   *
   * @param actual the result of {@link javax.validation.Validator#validate} to match against
   */
  public ConstraintViolationSetAssert(Set<? extends ConstraintViolation<?>> actual) {
    super(actual, ConstraintViolationSetAssert.class);
  }

  /**
   * Creates an instance of the ConstraintViolationSetAssert matcher.
   *
   * @param actual the result of {@link javax.validation.Validator#validate} to match against
   */
  public static ConstraintViolationSetAssert assertThat(
    Set<? extends ConstraintViolation<?>> actual
  ) {
    return new ConstraintViolationSetAssert(actual);
  }

  /**
   * Asserts that there are no violations.
   */
  public ConstraintViolationSetAssert isEmpty() {
    isNotNull();

    if (!actual.isEmpty()) {
      failWithMessage(
        "There were violations. Violation paths: <%s>",
        actual
          .stream()
          .map(violation -> violation.getPropertyPath().toString())
          .collect(Collectors.toList())
      );
    }

    return this;
  }

  /**
   * Asserts that there are exactly {@code expected} violations.
   */
  public ConstraintViolationSetAssert hasSize(int expected) {
    isNotNull();

    if (actual.size() != expected) {
      failWithActualExpectedAndMessage(
        actual.size(),
        expected,
        "Expected %d violations but found %d. Violation paths: <%s>",
        expected,
        actual.size(),
        actual
          .stream()
          .map(violation -> violation.getPropertyPath().toString())
          .collect(Collectors.toList())
      );
    }

    return this;
  }

  /**
   * Asserts that there is a violation on property with path {@code path}.
   */
  public ConstraintViolationSetAssert hasViolationOnPath(String path) {
    isNotNull();

    if (!containsViolationWithPath(actual, path)) {
      failWithMessage(
        "There was no violation with path <%s>. Violation paths: <%s>",
        path,
        actual
          .stream()
          .map(violation -> violation.getPropertyPath().toString())
          .collect(Collectors.toList())
      );
    }

    return this;
  }

  private boolean containsViolationWithPath(
    Set<? extends ConstraintViolation<?>> violations,
    String path
  ) {
    return Iterables.any(
      violations,
      violation -> violation.getPropertyPath().toString().equals(path)
    );
  }
}
