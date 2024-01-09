import { google } from 'googleapis';
import { promisify } from 'util';
import { readFile } from 'fs';
import { IcheckSpreadsheetInFolder, iDriveInfo, iResultParser } from './types';
import { OAuth2Client } from 'google-auth-library';
const fs = require('fs');
const path = require('path');
const readFileAsync = promisify(readFile);
const fileName = 'spread_sheet_results.json';
const parentDir = path.resolve(__dirname, '..');
const FILE_PATH = path.join(parentDir, fileName);

export async function getSpreadsheetInFolder({
  drive,
  folderId,
  name,
}: IcheckSpreadsheetInFolder): Promise<string | null> {
  try {
    const response = await drive.files.list({
      q: `'${folderId}' in parents and mimeType='application/vnd.google-apps.spreadsheet' and name='${name}' and trashed=false`,
      fields: 'files(id)',
    });

    const files = response?.data?.files;
    const firstSpreadsheetId = files?.[0]?.id;

    return firstSpreadsheetId || null;
  } catch (error) {
    console.error('Error checking spreadsheet in folder:', error);
    return null;
  }
}
export const normalizePath = (path: string): string => {
  return path.replace(/\\/g, '/');
};

export const getFormattedCurrentDate = () => {
  const currentDate = new Date();
  const year = currentDate.getFullYear();
  const month = String(currentDate.getMonth() + 1).padStart(2, '0');
  const day = String(currentDate.getDate()).padStart(2, '0');

  return `${year}_${month}_${day}`;
};

export const writeCopiedDriveInfo = (data: iDriveInfo) => {
  const jsonString = JSON.stringify(data, null, 2);
  fs.writeFile(FILE_PATH, jsonString, 'utf8', (err: any) => {
    if (err) {
      console.error('Error writing JSON file:', err);
    } else {
      console.log('JSON file created successfully in the parent directory.');
    }
  });
};

const screenshotUploader = async ({
  oAuth,
  folderId,
  images,
}: {
  oAuth: OAuth2Client;
  folderId: string;
  images: string[];
}): Promise<{ name: string; webViewLink: string }[] | undefined> => {
  const drive = google.drive({ version: 'v3', auth: oAuth }); // 'auth' should be your authorized OAuth2 client
  try {
    const imageLinks: { name: string; webViewLink: string }[] = [];
    for (const image of images) {
      const nameArr = normalizePath(image).split('/');
      const name = nameArr[nameArr.length - 1];
      const fileMetadata = {
        name,
        parents: [folderId],
      };

      const media = {
        mimeType: 'image/png',
        body: fs.createReadStream(image),
      };

      const response = await drive.files.create({
        requestBody: fileMetadata,
        media,
        fields: 'webViewLink',
      });
      const webViewLink = response?.data?.webViewLink;
      webViewLink && imageLinks.push({ name, webViewLink });
    }
    return imageLinks;
  } catch (err) {
    console.log(err);
  }
};

export const resultParser = async ({
  oAuth,
  config,
  evidenceFolderId,
  spec,
  results,
}: iResultParser): Promise<{
  specName: string;
  testResults: { range: string; values: string[][] }[];
}> => {
  const { relative } = spec;
  const data: {
    specName: string;
    testResults: { range: string; values: string[][] }[];
  } = {
    specName: normalizePath(relative),
    testResults: [],
  };
  let range = '';
  const tester = config.env.tester ?? '';

  const { stats, screenshots } = results;
  const date = new Date(stats.endedAt);
  const formatedDate = date.toISOString().slice(0, 10);
  let imageLinks: { name: string; webViewLink: string }[] | undefined = [];
  if (screenshots.length > 0) {
    const paths = screenshots.map((screenshot) => screenshot.path);
    imageLinks = await screenshotUploader({
      oAuth,
      folderId: evidenceFolderId,
      images: paths,
    });
  }
  let i = 0;
  for (const testResult of results.tests) {
    const { title, state } = testResult;
    const formatedState = state.charAt(0).toUpperCase() + state.slice(1);

    // https://github.com/cypress-io/cypress/issues/3092
    const testState = formatedState === 'Pending' ? 'Skipped' : formatedState;

    const testTitle = title[title.length - 1];
    const rangeArr = testTitle.split('__');
    let failedImage: { name: string; webViewLink: string } | undefined;
    if (testState == 'Failed') {
      const failedImageInfo = imageLinks?.filter((image) => {
        const imageFullNameArr = image.name
          .replace(/ *\(failed\)\.png$/, '')
          .split('--');
        const itName = imageFullNameArr[imageFullNameArr.length - 1];
        console.log(itName);
        console.log(testTitle);
        console.log(itName.trim() == testTitle.trim());
        return itName.trim() == testTitle.trim();
      });
      if (failedImageInfo && failedImageInfo?.length > 0) {
        failedImage = failedImageInfo[0];
      }
    }
    console.log('first');
    if (rangeArr.length > 1) {
      range = rangeArr[1];
      const resultRange = range.split(',')[0];
      const testerRange = range.split(',')[1];
      if (i === 0) {
        data.testResults.push({
          range: testerRange,
          values: [[tester]],
        });
      }

      data.testResults.push({
        range: resultRange,
        values: [
          [
            formatedDate,
            testState,
            (failedImage && failedImage.webViewLink) ?? '-',
          ],
        ],
      });
    } else {
      console.log('No second part found.');
    }
    i++;
  }

  return data;
};

export const readCopiedSpreadSheetInfo = async (): Promise<
  iDriveInfo | null | undefined
> => {
  try {
    const jsonData = await readFileAsync(FILE_PATH, 'utf8');

    try {
      const parsedData = JSON.parse(jsonData) as iDriveInfo;
      return parsedData;
    } catch (error) {
      console.error('Error parsing JSON data:', error);
      return null;
    }
  } catch (error) {
    console.error('Error reading file:', error);
    return null;
  }
};
