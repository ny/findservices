package gov.ny.its.hs.maslow.author.converter;

import gov.ny.its.hs.maslow.author.model.ServiceLocales;
import org.springframework.core.convert.converter.Converter;
import org.springframework.stereotype.Component;

/**
 * Converts a case-insensitive locale string (such as "es" or "ES") to a {@link ServiceLocale}
 */
@Component
public class ServiceLocalesConverter implements Converter<String, ServiceLocales> {

  @Override
  public ServiceLocales convert(String source) {
    return ServiceLocales.valueOf(source.toUpperCase());
  }
}
