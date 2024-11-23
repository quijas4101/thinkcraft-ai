import { storage } from './firebase';
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';

export async function uploadFile(
  projectId: string, 
  file: File
): Promise<{ url: string; fileName: string }> {
  // Create a unique filename
  const fileName = `${Date.now()}-${file.name}`;
  const filePath = `projects/${projectId}/${fileName}`;
  const storageRef = ref(storage, filePath);

  // Check file size (10MB limit)
  if (file.size > 10 * 1024 * 1024) {
    throw new Error('File size exceeds 10MB limit');
  }

  // Upload file
  await uploadBytes(storageRef, file);
  const url = await getDownloadURL(storageRef);

  return { url, fileName };
}

export async function deleteFile(projectId: string, fileName: string): Promise<void> {
  const filePath = `projects/${projectId}/${fileName}`;
  const storageRef = ref(storage, filePath);
  await deleteObject(storageRef);
}

export async function getProjectFiles(projectId: string): Promise<Array<{ name: string; url: string }>> {
  const filesRef = ref(storage, `projects/${projectId}`);
  
  try {
    const result = await filesRef.listAll();
    const files = await Promise.all(
      result.items.map(async (item) => ({
        name: item.name,
        url: await getDownloadURL(item)
      }))
    );
    return files;
  } catch (error) {
    console.error('Error listing files:', error);
    return [];
  }
} 