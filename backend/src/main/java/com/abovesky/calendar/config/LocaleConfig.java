package com.abovesky.calendar.config;

import org.springframework.context.MessageSource;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.support.ResourceBundleMessageSource;
import org.springframework.web.servlet.LocaleResolver;
import org.springframework.web.servlet.i18n.AcceptHeaderLocaleResolver;

import java.util.Arrays;
import java.util.Locale;

/**
 * Configuration for internationalization (i18n) support.
 * Supports English (en), German (de), Turkish (tr), French (fr), and Azerbaijani (az).
 */
@Configuration
public class LocaleConfig {

    /**
     * Configure the locale resolver to use Accept-Language header from HTTP requests.
     * Falls back to English if no language is specified or if the specified language is not supported.
     */
    @Bean
    public LocaleResolver localeResolver() {
        AcceptHeaderLocaleResolver localeResolver = new AcceptHeaderLocaleResolver();
        localeResolver.setDefaultLocale(Locale.ENGLISH);
        localeResolver.setSupportedLocales(Arrays.asList(
                Locale.ENGLISH,           // en
                Locale.GERMAN,            // de
                new Locale("tr"),         // Turkish
                Locale.FRENCH,            // fr
                new Locale("az")          // Azerbaijani
        ));
        return localeResolver;
    }

    /**
     * Configure MessageSource to load message properties files for internationalization.
     * Message files are expected in src/main/resources/i18n/messages_[locale].properties
     */
    @Bean
    public MessageSource messageSource() {
        ResourceBundleMessageSource messageSource = new ResourceBundleMessageSource();
        messageSource.setBasename("i18n/messages");
        messageSource.setDefaultEncoding("UTF-8");
        messageSource.setUseCodeAsDefaultMessage(true);
        messageSource.setCacheSeconds(3600); // Cache for 1 hour
        return messageSource;
    }
}
