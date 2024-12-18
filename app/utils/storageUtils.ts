import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { BaseDocument } from '../types/document.types';

const supabase = createClientComponentClient();

/**
 * Batch verify multiple documents in storage concurrently
 */
export const verifyDocumentsInStorage = async (documents: BaseDocument[]): Promise<Map<string, boolean>> => {
  const verificationMap = new Map<string, boolean>();
  
  // Group documents by directory to minimize API calls
  const directoryMap = new Map<string, { path: string; docs: BaseDocument[] }>();
  
  documents.forEach(doc => {
    const pathParts = doc.storage_path.split('/');
    const fileName = pathParts.pop()!;
    const directory = pathParts.join('/');
    
    if (!directoryMap.has(directory)) {
      directoryMap.set(directory, { path: directory, docs: [] });
    }
    directoryMap.get(directory)!.docs.push(doc);
  });

  // Verify documents in parallel, grouped by directory
  const verificationPromises = Array.from(directoryMap.values()).map(async ({ path, docs }) => {
    try {
      const { data, error } = await supabase.storage
        .from('documents')
        .list(path);

      if (error) {
        console.error('Error verifying documents in directory:', path, error);
        docs.forEach(doc => verificationMap.set(doc.id, false));
        return;
      }

      const existingFiles = new Set(data.map(file => file.name));
      docs.forEach(doc => {
        const fileName = doc.storage_path.split('/').pop()!;
        verificationMap.set(doc.id, existingFiles.has(fileName));
      });
    } catch (error) {
      console.error('Error verifying directory:', path, error);
      docs.forEach(doc => verificationMap.set(doc.id, false));
    }
  });

  await Promise.all(verificationPromises);
  return verificationMap;
};

/**
 * Clean up orphaned document records
 * Removes database records for documents that no longer exist in storage
 */
export const cleanupOrphanedDocuments = async (documents: BaseDocument[]): Promise<BaseDocument[]> => {
  if (!documents.length) return [];
  
  const verificationMap = await verifyDocumentsInStorage(documents);
  const invalidDocuments = documents.filter(doc => !verificationMap.get(doc.id));
  
  // Delete invalid documents in parallel
  if (invalidDocuments.length > 0) {
    const deletePromises = invalidDocuments.map(doc => 
      supabase
        .from('documents')
        .delete()
        .eq('id', doc.id)
        .then(({ error }) => {
          if (error) {
            console.error('Error deleting invalid document:', doc.id, error);
          }
        })
    );
    
    await Promise.all(deletePromises);
  }
  
  return documents.filter(doc => verificationMap.get(doc.id));
};
