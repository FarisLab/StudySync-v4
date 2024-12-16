import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import JSZip from 'jszip';
import { BaseDocument } from '@/app/types/document.types';

const supabase = createClientComponentClient();

export async function downloadDocument(document: BaseDocument): Promise<Blob | null> {
  try {
    const { data, error } = await supabase
      .storage
      .from('documents')
      .download(document.storage_path);

    if (error) {
      console.error('Error downloading file:', error);
      return null;
    }

    return data;
  } catch (error) {
    console.error('Error downloading file:', error);
    return null;
  }
}

export async function downloadMultipleDocuments(documents: BaseDocument[]): Promise<Blob | null> {
  try {
    const zip = new JSZip();
    const downloads = await Promise.allSettled(
      documents.map(doc => downloadDocument(doc))
    );

    let successCount = 0;
    downloads.forEach((result, index) => {
      if (result.status === 'fulfilled' && result.value) {
        const doc = documents[index];
        zip.file(doc.name, result.value);
        successCount++;
      }
    });

    if (successCount === 0) {
      throw new Error('No files could be downloaded');
    }

    // If some files failed but others succeeded
    if (successCount < documents.length) {
      console.warn(`Only ${successCount} out of ${documents.length} files were downloaded successfully`);
    }

    const zipBlob = await zip.generateAsync({ type: 'blob' });
    return zipBlob;
  } catch (error) {
    console.error('Error creating zip file:', error);
    return null;
  }
}

export function downloadBlob(blob: Blob, filename: string) {
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.URL.revokeObjectURL(url);
}
