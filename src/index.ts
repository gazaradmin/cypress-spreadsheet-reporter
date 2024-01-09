import { OAuth2Client } from 'google-auth-library';
import { googleAuth } from './googleAuth';

import {
  createFolderCopySpreadSheet,
  reporter,
} from './cypress-google-spreadsheet-plugin';

export function configurePlugin(
  on: Cypress.PluginEvents,
  config: Cypress.Config,
) {
  on('before:run', async (details: Cypress.BeforeRunDetails) => {
    const { specs } = details;
    if (specs) {
      const specNames = specs.map((spec) => spec.name);
      const oauth2Client: OAuth2Client = await googleAuth(config);
      await createFolderCopySpreadSheet({ oauth2Client, config, specNames });
    }
  });
  on(
    'after:spec',
    async (spec: Cypress.Spec, results: CypressCommandLine.RunResult) => {
      const oauth2Client: OAuth2Client = await googleAuth(config);
      await reporter({ oauth2Client, config, spec, results });
    },
  );
}
