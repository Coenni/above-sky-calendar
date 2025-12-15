# Internationalization (i18n) Documentation

## Overview

This application supports comprehensive multilanguage internationalization with support for 5 languages:

1. **English (en)** - Default language
2. **German (de)** - Deutsch
3. **Turkish (tr)** - Türkçe
4. **French (fr)** - Français
5. **Azerbaijani (az)** - Azərbaycan dili

## Architecture

### Frontend (Angular)

The frontend uses **ngx-translate** for internationalization support.

#### Key Components

- **Translation Files**: Located in `frontend/src/assets/i18n/`
  - `en.json` - English translations
  - `de.json` - German translations
  - `tr.json` - Turkish translations
  - `fr.json` - French translations
  - `az.json` - Azerbaijani translations

- **Configuration**: `frontend/src/app/i18n/i18n.config.ts`
  - Defines supported languages
  - HTTP loader factory for loading translation files
  - Default language configuration

- **Language Switcher**: `frontend/src/app/components/language-switcher/`
  - User-friendly language selection component
  - Displays language flags and names
  - Persists language preference in localStorage

- **Formatters**: `frontend/src/app/utils/formatters.ts`
  - Locale-aware date formatting using date-fns
  - Number and currency formatting using Intl API
  - Relative time formatting

#### How to Use Translations in Components

1. **Import TranslateModule and TranslateService**:
```typescript
import { TranslateModule, TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-example',
  standalone: true,
  imports: [CommonModule, TranslateModule],
  templateUrl: './example.component.html'
})
export class ExampleComponent {
  constructor(private translate: TranslateService) {}
}
```

2. **Use translations in templates**:
```html
<!-- Simple translation -->
<h1>{{ 'common.welcome' | translate }}</h1>

<!-- Translation with parameters -->
<p>{{ 'dashboard.welcome_back' | translate: {name: userName} }}</p>

<!-- Alternative directive syntax -->
<button [translate]="'common.save'"></button>
```

3. **Use translations in TypeScript code**:
```typescript
// Get instant translation
const message = this.translate.instant('messages.success');

// Get translation asynchronously (Observable)
this.translate.get('messages.error_general').subscribe((text: string) => {
  console.log(text);
});

// Get translation with parameters
this.translate.get('task.rewards.earned', { points: 50 }).subscribe((text: string) => {
  alert(text); // "You earned 50 reward points!"
});
```

#### Date and Number Formatting

Use the formatters utility for locale-aware formatting:

```typescript
import { formatDate, formatDateTime, formatNumber, formatCurrency } from './utils/formatters';

// Format dates
const formattedDate = formatDate(new Date(), 'PPP'); // "December 15, 2024"
const formattedTime = formatDateTime(new Date()); // "December 15, 2024 at 2:30 PM"

// Format numbers
const formattedNumber = formatNumber(1234.56); // "1,234.56" (en) or "1.234,56" (de)

// Format currency
const formattedPrice = formatCurrency(99.99, 'USD'); // "$99.99"

// Relative time
const relativeTime = formatRelativeTime(someDate); // "2 hours ago"
```

### Backend (Spring Boot)

The backend uses Spring Boot's **MessageSource** for internationalization.

#### Key Components

- **LocaleConfig**: `backend/src/main/java/com/abovesky/calendar/config/LocaleConfig.java`
  - Configures LocaleResolver to read Accept-Language header
  - Sets up MessageSource to load message properties files
  - Supports fallback to default language (English)

- **Message Properties Files**: `backend/src/main/resources/i18n/`
  - `messages.properties` - English (default)
  - `messages_de.properties` - German
  - `messages_tr.properties` - Turkish
  - `messages_fr.properties` - French
  - `messages_az.properties` - Azerbaijani

- **GlobalExceptionHandler**: `backend/src/main/java/com/abovesky/calendar/exception/GlobalExceptionHandler.java`
  - Returns localized error messages based on user's locale
  - Uses LocaleContextHolder to get current locale

- **User Entity**: User model includes `preferredLocale` field to store user's language preference

#### How to Use Translations in Backend

1. **Inject MessageSource**:
```java
@Service
public class ExampleService {
    private final MessageSource messageSource;

    public ExampleService(MessageSource messageSource) {
        this.messageSource = messageSource;
    }

    public String getLocalizedMessage() {
        Locale locale = LocaleContextHolder.getLocale();
        return messageSource.getMessage("task.created", null, locale);
    }

    // With parameters
    public String getLocalizedMessageWithParams(int points) {
        Locale locale = LocaleContextHolder.getLocale();
        return messageSource.getMessage("reward.points.earned", 
                                       new Object[]{points}, 
                                       locale);
    }
}
```

2. **Email Templates with i18n** (Thymeleaf):
```html
<!-- Use message properties in templates -->
<h1 th:text="#{email.welcome.subject}">Welcome</h1>
<p th:text="#{email.welcome.greeting(${username})}">Hello User</p>
```

3. **Set User Locale in API Requests**:
```java
@RestController
public class ExampleController {
    @GetMapping("/example")
    public ResponseEntity<String> example(
            @RequestHeader(name = "Accept-Language", required = false) Locale locale) {
        // Locale is automatically resolved by LocaleResolver
        // Use MessageSource to get localized messages
        return ResponseEntity.ok("Success");
    }
}
```

## Database

The `users` table includes a `preferred_locale` column:
- Type: VARCHAR(5)
- Default: 'en'
- Stores user's preferred language code

Migration script: `backend/src/main/resources/db/migration/V001__add_preferred_locale_to_users.sql`

## Translation File Structure

### Frontend Translation Keys

Translation files are organized by feature area:

```json
{
  "common": {        // Common UI elements
    "save": "Save",
    "cancel": "Cancel",
    ...
  },
  "nav": {          // Navigation menu
    "dashboard": "Dashboard",
    "calendar": "Calendar",
    ...
  },
  "auth": {         // Authentication
    "login": "Login",
    "register": "Register",
    ...
  },
  "validation": {   // Form validation
    "required": "This field is required",
    ...
  },
  "calendar": {     // Calendar feature
    "title": "Calendar",
    "add_event": "Add Event",
    ...
  },
  "tasks": {        // Tasks feature
    ...
  },
  "rewards": {      // Rewards feature
    ...
  },
  "meals": {        // Meals feature
    ...
  },
  "photos": {       // Photos feature
    ...
  },
  "lists": {        // Lists feature
    ...
  },
  "dashboard": {    // Dashboard feature
    ...
  },
  "messages": {     // System messages
    ...
  },
  "date": {         // Date/time labels
    ...
  }
}
```

## Adding a New Language

### 1. Add Language to Configuration

**Frontend** (`frontend/src/app/i18n/i18n.config.ts`):
```typescript
export const SUPPORTED_LANGUAGES = [
  ...
  { code: 'xx', name: 'Language Name', flag: '🏳️' }
];
```

### 2. Create Translation Files

**Frontend**:
- Copy `frontend/src/assets/i18n/en.json` to `frontend/src/assets/i18n/xx.json`
- Translate all strings to the new language
- Keep the same JSON structure

**Backend**:
- Copy `backend/src/main/resources/i18n/messages.properties` to `messages_xx.properties`
- Translate all messages to the new language
- Keep the same property keys

### 3. Update LocaleConfig

**Backend** (`backend/src/main/java/com/abovesky/calendar/config/LocaleConfig.java`):
```java
localeResolver.setSupportedLocales(Arrays.asList(
    ...
    new Locale("xx")  // Add new locale
));
```

### 4. Add date-fns Locale (if available)

**Frontend** (`frontend/src/app/utils/formatters.ts`):
```typescript
import { xx } from 'date-fns/locale';

const localeMap: { [key: string]: Locale } = {
  ...
  xx: xx
};
```

## Adding New Translation Keys

### Frontend

1. Add the key to `en.json`:
```json
{
  "feature": {
    "new_key": "English translation"
  }
}
```

2. Add corresponding translations to all other language files:
   - `de.json`
   - `tr.json`
   - `fr.json`
   - `az.json`

3. Use in component:
```html
<p>{{ 'feature.new_key' | translate }}</p>
```

### Backend

1. Add the key to all message properties files:
   - `messages.properties`
   - `messages_de.properties`
   - `messages_tr.properties`
   - `messages_fr.properties`
   - `messages_az.properties`

2. Use in code:
```java
String message = messageSource.getMessage("feature.new_key", null, locale);
```

## Testing Translations

### Frontend Testing

1. **Manual Testing**:
   - Run the application: `npm start`
   - Use the language switcher component to change languages
   - Verify all text is translated correctly
   - Check date/time formatting for each locale

2. **Testing Translation Keys**:
```typescript
// In component spec file
it('should display translated text', () => {
  const fixture = TestBed.createComponent(MyComponent);
  const translated = fixture.componentInstance.translate.instant('common.save');
  expect(translated).toBe('Save');
});
```

### Backend Testing

1. **Test with different Accept-Language headers**:
```bash
# English
curl -H "Accept-Language: en" http://localhost:8080/api/endpoint

# German
curl -H "Accept-Language: de" http://localhost:8080/api/endpoint

# Turkish
curl -H "Accept-Language: tr" http://localhost:8080/api/endpoint
```

2. **Unit Testing**:
```java
@Test
public void testLocalizedMessage() {
    Locale locale = new Locale("de");
    String message = messageSource.getMessage("task.created", null, locale);
    assertEquals("Aufgabe erfolgreich erstellt", message);
}
```

## Best Practices

1. **Always use translation keys** - Never hardcode user-facing strings
2. **Use descriptive key names** - `calendar.event.created` not `msg1`
3. **Keep translations consistent** - Use same terminology across features
4. **Provide context in parameters** - `{name}` not `{0}`
5. **Test all languages** - Verify translations display correctly
6. **Consider text expansion** - Some languages require more space
7. **Use locale-aware formatting** - For dates, numbers, and currencies
8. **Keep translation files organized** - Group by feature area
9. **Document new keys** - Update this documentation when adding keys
10. **Use fallback language** - English should always be complete

## Troubleshooting

### Translation not showing

1. **Check the key exists** in all translation files
2. **Verify correct syntax**: `{{ 'key.name' | translate }}`
3. **Check browser console** for missing translation warnings
4. **Clear localStorage** and reload to reset language

### Date formatting issues

1. **Verify locale is set** correctly in LocaleContextHolder
2. **Check date-fns locale** is imported and mapped
3. **Use ISO 8601 format** for date strings from backend

### Backend messages not localized

1. **Check Accept-Language header** is being sent
2. **Verify LocaleResolver** is configured correctly
3. **Check message property files** are in correct location
4. **Ensure property keys match** in all language files

## Support

For questions or issues with internationalization:
1. Check this documentation first
2. Review example components that use i18n
3. Check the browser console and backend logs for errors
4. Ensure all translation files are properly formatted JSON/properties

## Resources

- [ngx-translate Documentation](https://github.com/ngx-translate/core)
- [date-fns Documentation](https://date-fns.org/)
- [Spring MessageSource Documentation](https://docs.spring.io/spring-framework/reference/core/beans/context-introduction.html)
- [Thymeleaf i18n](https://www.thymeleaf.org/doc/tutorials/3.0/usingthymeleaf.html#using-texts)
