package gov.ny.its.hs.maslow.author.model;

import javax.validation.constraints.Min;
import javax.validation.constraints.NotBlank;
import javax.validation.constraints.NotNull;
import lombok.Builder;
import lombok.Data;
import org.springframework.data.annotation.Id;
import org.springframework.validation.annotation.Validated;

/**
 * Represents a request to update the rank of a service.
 */
@Builder
@Data
@Validated
public class ServiceRank {
  /**
   * The key that identifies the {@link Service} to update
   */
  @Id
  @NotBlank
  private String key;

  /**
   * The updated rank. While the stored rank will always be greater than 0, a request to rank a
   * service allows two special sentinel values:
   * -  0 means to insert the service at the head
   * - -1 means to append the service at the tail
   */
  @Min(-1)
  @NotNull
  private Integer rank;
}
