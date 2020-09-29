package gov.ny.its.hs.maslow.access.config;

import java.io.IOException;
import javax.servlet.FilterConfig;
import javax.servlet.ServletException;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.Resource;
import org.springframework.stereotype.Component;
import org.tuckey.web.filters.urlrewrite.Conf;
import org.tuckey.web.filters.urlrewrite.UrlRewriteFilter;

/**
 * Configures the UrlRewriteFilter to load its configuration from a file.
 */
@Component
public class MaslowUrlRewriteFilter extends UrlRewriteFilter {
  private static final String WEB_CONF_PATH = "classpath:/urlrewrite.xml";

  @Value(WEB_CONF_PATH)
  private Resource resource;

  @Override
  protected void loadUrlRewriter(FilterConfig filterConfig) throws ServletException {
    try {
      // Create a UrlRewrite Conf object with the injected resource
      Conf conf = new Conf(
        filterConfig.getServletContext(),
        resource.getInputStream(),
        resource.getFilename(),
        ""
      );
      checkConf(conf);
    } catch (IOException ex) {
      throw new ServletException(
        "Unable to load URL rewrite configuration file from " + WEB_CONF_PATH,
        ex
      );
    }
  }
}
