const { google } = require('googleapis');
import { drive_v3, sheets_v4 } from 'googleapis';
import {
  getFormattedCurrentDate,
  writeCopiedDriveInfo,
  resultParser,
  readCopiedSpreadSheetInfo,
} from './utils';
import { iConfigFile, iDriveInfo, iReporter, iSpreadSheet } from './types';
import { copySpreadSheets } from './spreadSheet';
import { createFolder } from './googleDrive';

export async function createFolderCopySpreadSheet({
  oauth2Client,
  config,
  specNames,
}: iSpreadSheet) {
  const { rootFolderId, spreadSheetList } = config.env as iConfigFile;
  const folderName = getFormattedCurrentDate();

  const drive: drive_v3.Drive = google.drive({
    version: 'v3',
    auth: oauth2Client,
  });
  const folderId = await createFolder({ drive, folderName, rootFolderId });
  if (folderId) {
    const evidenceFolderId = await createFolder({
      drive,
      folderName: 'evidence',
      rootFolderId: folderId,
    });
    const sheetInfos = await copySpreadSheets({
      drive,
      folderId,
      spreadSheetList,
      specNames,
    });
    if (evidenceFolderId) {
    }

    if (sheetInfos && sheetInfos.length > 0 && evidenceFolderId) {
      const driveInfo: iDriveInfo = {
        evidenceFolderId: evidenceFolderId,
        rootFolderId: folderId,
        sheets: sheetInfos,
      };
      writeCopiedDriveInfo(driveInfo);
    }
  }
}

export const reporter = async ({
  oauth2Client,
  config,
  spec,
  results,
}: iReporter) => {
  const driveInfo = await readCopiedSpreadSheetInfo();
  if (driveInfo) {
    const { evidenceFolderId } = driveInfo;
    const { specName, testResults } = await resultParser({
      oAuth: oauth2Client,
      config,
      evidenceFolderId,
      spec,
      results,
    });
    const sheets: sheets_v4.Sheets = google.sheets({
      version: 'v4',
      auth: oauth2Client,
    });
    if (driveInfo) {
      const { sheets: sheetsinfo } = driveInfo;
      const specMeta = sheetsinfo.find((item) => item.specName === specName);
      if (specMeta) {
        try {
          await sheets.spreadsheets.values.batchUpdate({
            spreadsheetId: specMeta.spreadSheetId,
            requestBody: {
              valueInputOption: 'RAW',
              data: testResults,
            },
          });
        } catch (err) {
          console.error('The API returned an error:', err);
        }
      }
    }
  }
};
