const { defineConfig } = require('cypress');
import { configurePlugin } from './dist';
require('dotenv').config();

module.exports = defineConfig({
  env: {
    rootFolderId: process.env.ROOT_FOLDER_ID,
    clientId: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    refreshToken: process.env.GOOGLE_REFRESH_TOKEN,
    tester: 'Bayanbaatar.D',
    spreadSheetList: [
      {
        specName: 'cypress/e2e/1_login.cy.ts',
        spreadSheetId: '1hVy4JaELKwIQRnQ-67XaVYQp-v48GhxQn3Oq1FAOxpg',
      },
      {
        specName: 'cypress/e2e/2_login.cy.ts',
        spreadSheetId: '1NV5t8B51enL4xjihUcKjYmi645xsS0g1iQS5tAM-ekI',
      },
    ],
  },
  e2e: {
    setupNodeEvents(on: any, config: any) {
      configurePlugin(on, config);

      return config;
    },
    experimentalRunAllSpecs: true,
  },
});
