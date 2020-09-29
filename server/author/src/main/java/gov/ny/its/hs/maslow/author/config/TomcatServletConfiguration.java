package gov.ny.its.hs.maslow.author.config;

import java.io.BufferedReader;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.nio.charset.StandardCharsets;
import lombok.extern.slf4j.Slf4j;
import org.apache.catalina.valves.rewrite.RewriteValve;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.autoconfigure.AutoConfigureBefore;
import org.springframework.boot.autoconfigure.AutoConfigureOrder;
import org.springframework.boot.autoconfigure.web.ServerProperties;
import org.springframework.boot.autoconfigure.web.servlet.ServletWebServerFactoryAutoConfiguration;
import org.springframework.boot.autoconfigure.web.servlet.ServletWebServerFactoryCustomizer;
import org.springframework.boot.web.embedded.tomcat.TomcatServletWebServerFactory;
import org.springframework.boot.web.servlet.server.ConfigurableServletWebServerFactory;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.Ordered;

/**
 * Configures the embedded Tomcat server. Currently the only customization we have is to add the
 * Apache Rewrite Valve for URL rewriting. This is required to support React Router.
 *
 * Adapted from
 * https://github.com/qianying1/apache-cas/blob/master/webapp/cas-server-webapp-tomcat/src/main/java/org/apereo/cas/config/CasEmbeddedContainerTomcatConfiguration.java,
 * which in turn is an adaptation/override of
 * https://github.com/apache/tomcat/blob/master/java/org/apache/catalina/valves/rewrite/RewriteValve.java.
 */
@Configuration
@AutoConfigureBefore(ServletWebServerFactoryAutoConfiguration.class)
@AutoConfigureOrder(Ordered.HIGHEST_PRECEDENCE)
@Slf4j
public class TomcatServletConfiguration {
  private static final String REWRITE_CONF = "rewrite.conf";

  @Autowired
  private ServerProperties serverProperties;

  @Bean
  public ServletWebServerFactoryCustomizer customizer() {
    return new ServletWebServerFactoryCustomizer(serverProperties) {

      @Override
      public void customize(final ConfigurableServletWebServerFactory factory) {
        TomcatServletWebServerFactory tomcat = (TomcatServletWebServerFactory) factory;

        log.debug("Configuring rewrite valve");
        final RewriteValve valve = new RewriteValve() {

          @Override
          public synchronized void startInternal() {
            try {
              super.startInternal();

              try (
                InputStream is = getClass().getClassLoader().getResourceAsStream(REWRITE_CONF);
                InputStreamReader isr = new InputStreamReader(is, StandardCharsets.UTF_8);
                BufferedReader reader = new BufferedReader(isr)
              ) {
                log.debug("Read configuration from: " + REWRITE_CONF);
                parse(reader);
              }
            } catch (final Exception e) {
              log.error(e.getMessage(), e);
            }
          }
        };

        valve.setAsyncSupported(true);
        valve.setEnabled(true);

        log.debug("Creating Rewrite valve configuration for the embedded tomcat container...");
        tomcat.addContextValves(valve);
      }
    };
  }
}
