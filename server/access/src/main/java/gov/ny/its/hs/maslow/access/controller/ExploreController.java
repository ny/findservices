package gov.ny.its.hs.maslow.access.controller;

import com.google.common.collect.Maps;
import gov.ny.its.hs.maslow.access.dto.CatalogDto;
import gov.ny.its.hs.maslow.access.service.CatalogService;
import org.modelmapper.ModelMapper;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * Provides a REST endpoint to retrieve the catalog of questions and services.
 */
@RestController
public class ExploreController {
  private CatalogService catalogService;

  /**
   * Constructs an ExploreController instance.
   *
   * @param catalogService the catalog service that manages the state of the catalog
   */
  public ExploreController(CatalogService catalogService) {
    super();
    this.catalogService = catalogService;
  }

  /**
   * Returns all data (other than translation strings) required by the client application at
   * startup.
   */
  @GetMapping("/api/explore/v1/catalog")
  public CatalogDto catalog() {
    CatalogDto catalogDto = new ModelMapper().map(catalogService.getCatalog(), CatalogDto.class);

    // we only want this endpoint to return services that are enabled
    catalogDto.setServices(
      Maps.filterEntries(catalogDto.getServices(), service -> service.getValue().getEnabled())
    );

    return catalogDto;
  }
}
