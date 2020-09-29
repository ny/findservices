package gov.ny.its.hs.maslow.author.service;

import org.bson.Document;
import org.springframework.data.mongodb.core.aggregation.AggregationOperation;
import org.springframework.data.mongodb.core.aggregation.AggregationOperationContext;

/**
 * Converts an aggregation operation defined in JSON to an {@link AggregationOperation} instance
 * that can be passed into Spring Data Mongo. Note that this converts only a single operation, not a
 * pipeline of operations.
 */
public class JsonAggregationOperation implements AggregationOperation {
  private final String json;

  /**
   * Constructs an instance of {@SnapshotAggregation} with the provided {@link #json}. The JSON
   * should include just a single aggregation operation, not a pipeline.
   */
  public JsonAggregationOperation(String json) {
    super();
    this.json = json;
  }

  @Override
  public Document toDocument(AggregationOperationContext context) {
    return context.getMappedObject(Document.parse(json));
  }
}
