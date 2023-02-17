# Cypress testing framework

## Testing environment

set environment variable `TEST_ENV` to specify the target environment for testing, ex: `TEST_ENV=columbus yarn cypress`.
current support environment (case-insensitive),

-   `columbus`
-   `local` identical to `dev`
-   `prod` identical to `production`

> shortcut of `columbus`: yarn cypress:columbus

## Naming convention

### Alias

**_CamelCase_** add prefix(abbreviate in 3 ~ 5 characters, not greater than 6) according to component type,

-   button: `btnXxx`
-   input: `inputXxx`
-   select: `selectXxx`
-   text: `txtXxx`
-   other doms: `elXxx`
-   variable: `xxx`
-   intercept / request: `apiXxx`
