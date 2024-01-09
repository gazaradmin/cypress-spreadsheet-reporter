import { iCopySpreadSheet, iSheetInfo } from './types';
import { getSpreadsheetInFolder } from './utils';

export const copySpreadSheets = async ({
  drive,
  folderId,
  spreadSheetList,
  specNames,
}: iCopySpreadSheet): Promise<iSheetInfo[]> => {
  let sheetInfos: iSheetInfo[] = [];
  if (spreadSheetList.length > 0) {
    for (const spreadSheetInfo of spreadSheetList) {
      const { specName, spreadSheetId: originalSheetId } = spreadSheetInfo;

      if (specNames.includes(specName)) {
        const originalFileMetadata = await drive.files.get({
          fileId: originalSheetId,
          fields: 'id, name',
        });

        const { data } = originalFileMetadata;

        if (data && data.name) {
          const name = `Result_${data.name}`;
          const sheetId = await getSpreadsheetInFolder({
            drive,
            folderId,
            name,
          });

          if (sheetId) {
            sheetInfos.push({ specName, spreadSheetId: sheetId });
          } else {
            const copyResponse = await drive.files.copy({
              fileId: originalSheetId,
              requestBody: {
                name,
                parents: [folderId],
              },
            });
            const { id: newSpreadSheetId } = copyResponse.data;

            if (newSpreadSheetId) {
              sheetInfos.push({
                specName,
                spreadSheetId: newSpreadSheetId,
              });
            }
          }
        }
      }
    }
  }
  return sheetInfos;
};
