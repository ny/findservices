package gov.ny.its.hs.maslow.author.model;

import com.google.common.base.Preconditions;

/**
 * Provides static utility functions for generating formatted ETags for an {@code Object}. See
 * {@link https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/ETag} for more information about
 * the ETag format.
 */
public class EntityTag {

  /**
   * Generates a weak ETag based on {@link Object#hashCode()}.
   */
  public static String from(Object o) {
    return from(o, true);
  }

  /**
   * Generates an ETag based on {@link Object#hashCode()}. If {@code weak} is true, the ETag will be
   * formatted as weak, otherwise strong.
   */
  public static String from(Object o, boolean weak) {
    Preconditions.checkNotNull(o);

    final String format = weak ? "W/\"%08x\"" : "\"%08x\"";
    return String.format(format, o.hashCode());
  }
}
