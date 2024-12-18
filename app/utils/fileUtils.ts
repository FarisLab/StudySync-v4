export const getFileType = (filename: string): string => {
  const extension = filename.split('.').pop()?.toLowerCase() || '';

  const imageTypes = ['jpg', 'jpeg', 'png', 'gif'];
  const documentTypes = ['doc', 'docx'];
  const presentationTypes = ['ppt', 'pptx'];
  const spreadsheetTypes = ['xls', 'xlsx', 'csv'];

  if (extension === 'pdf') return 'pdf';
  if (imageTypes.includes(extension)) return 'image';
  if (documentTypes.includes(extension)) return 'document';
  if (presentationTypes.includes(extension)) return 'presentation';
  if (spreadsheetTypes.includes(extension)) return 'spreadsheet';

  return 'other';
};

export const formatFileSize = (bytes: number): string => {
  const units = ['B', 'KB', 'MB', 'GB', 'TB'];
  let size = bytes;
  let unitIndex = 0;

  while (size >= 1024 && unitIndex < units.length - 1) {
    size /= 1024;
    unitIndex++;
  }

  return `${size.toFixed(1)} ${units[unitIndex]}`;
};
