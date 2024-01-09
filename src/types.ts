import { OAuth2Client } from 'google-auth-library';
import { drive_v3 } from 'googleapis';

export interface IcheckSpreadsheetInFolder {
  drive: drive_v3.Drive;
  folderId: string;
  name: string;
}

export interface iReporter {
  oauth2Client: OAuth2Client;
  config: Cypress.Config;
  spec: Cypress.Spec;
  results: CypressCommandLine.RunResult;
}
export interface iResultParser {
  oAuth: OAuth2Client;
  config: Cypress.Config;
  evidenceFolderId: string;
  spec: Cypress.Spec;
  results: CypressCommandLine.RunResult;
}

export interface iSheetInfo {
  specName: string;
  spreadSheetId: string;
}
export interface iDriveInfo {
  evidenceFolderId: string;
  rootFolderId: string;
  sheets: iSheetInfo[];
}

export interface iSpreadSheet {
  oauth2Client: OAuth2Client;
  config: Cypress.Config;
  specNames: string[];
}

export interface iCreateFolder {
  drive: drive_v3.Drive;
  folderName: string;
  rootFolderId: string;
}

export interface iConfigFile {
  rootFolderId: string;
  spreadSheetList: iSheetInfo[];
}

export interface iCopySpreadSheet {
  drive: drive_v3.Drive;
  folderId: string;
  spreadSheetList: iSheetInfo[];
  specNames: string[];
}
