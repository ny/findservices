package gov.ny.its.hs.maslow.author.model;

import com.fasterxml.jackson.annotation.JsonValue;
import lombok.Getter;
import lombok.RequiredArgsConstructor;

/**
 * Enumerates the locales currently supported by the resident-facing application.
 */
@RequiredArgsConstructor
public enum ServiceLocales {
  BN("bn"),
  EN("en"),
  ES("es"),
  HT("ht"),
  KO("ko"),
  RU("ru"),
  ZH("zh");

  @Getter
  @JsonValue
  private final String locale;
}
