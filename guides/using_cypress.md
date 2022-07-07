# Cypress

We use Cypress for end-to-end testing.

## Basic Info

-   Cypress is configured with the cypress.(local).json file, this is the config file for telling cypress what environment it is running in.
-   To run cypress locally use `yarn run cypress`. Later we will add a command to run against prod or staging.
-   To configure cypress for git actions you go into the .git/workflows folder here in the project, there is a main.yml file that is the git actions main file
-   You can find info on the cypress setup [here](https://github.com/cypress-io/github-action/tree/baf61dc3944ed4baccb528a8085f0255be155e2e#basic)

## Adding tests

-   make sure to use `data-cy` tags on elements you want to test, follow best practices [here](https://docs.cypress.io/guides/references/best-practices.html)
-   As a team having a bunch of tests for the sake of having tests is not ideal. Ideally we have enough tests to tell us that users are getting the experience they expect. If
    we have a regression that affects the users experience we evaluate and consider adding a test. If we have a regression multiple times a test should definitely be added.

## Debugging tests on CI/CD

-   We are uploading video and screen from the tests, you can find them using [this](https://github.com/actions/upload-artifact#where-does-the-upload-go)

## Actions and Logging

-   You can see actions and there logs and running [here](https://github.com/chain4travel/camino-wallet-internal/actions)
    -   git action logging doesnt do well live, as of this you have to refresh the logs to see them as they run

## Cypress config

Rather than creating a config for each environment at the root of the app, we hijack the config at the plugin level. We dynamically create a config in the cypress/plugins/index.ts. You will see that the cypress.json file is an empty json object, this is to fulfill the requirement that a file is there for cypress.

## Ideas for later

-   run cypress as a [git cron job](https://jasonet.co/posts/scheduled-actions/) so it runs on scheduled intervals against prod
-   include linting so things like .only dont get left inside tests, info can be found [here](https://www.npmjs.com/package/eslint-plugin-no-only-tests)
