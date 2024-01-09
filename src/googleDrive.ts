import { iCreateFolder } from './types';

export const createFolder = async ({
  drive,
  folderName,
  rootFolderId,
}: iCreateFolder): Promise<string | undefined> => {
  const folderMetadata = {
    name: folderName, // Name of the folder you want to create
    mimeType: 'application/vnd.google-apps.folder',
    parents: [rootFolderId], // Specify the parent folder ID
  };

  try {
    const response = await drive.files.list({
      q: `mimeType='application/vnd.google-apps.folder' and name='${folderName}' and '${rootFolderId}' in parents and trashed=false`,
      fields: 'files(id, name)',
    });
    let folderId = '';
    const files = response.data.files;

    if (files && files.length === 0) {
      const file = await drive.files.create({
        requestBody: folderMetadata,
        fields: 'id',
      });
      folderId = file.data.id || '';
    } else if (files && files.length > 0) {
      folderId = files[0].id || '';
    }
    return folderId;
  } catch (err) {
    console.log(err);
  }
};
