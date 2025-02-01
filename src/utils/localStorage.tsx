// utils/localStorage.ts
import { ContentItem } from '../types/content';

const STORAGE_KEY = 'content-manager-items';

export const saveContentsToStorage = (contents: ContentItem[]): void => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(contents));
  } catch (error) {
    console.error('Error saving to localStorage:', error);
  }
};

export const loadContentsFromStorage = (): ContentItem[] => {
  try {
    const storedContents = localStorage.getItem(STORAGE_KEY);
    return storedContents ? JSON.parse(storedContents) : [];
  } catch (error) {
    console.error('Error loading from localStorage:', error);
    return [];
  }
};

export const addContentToStorage = (content: ContentItem): void => {
  const currentContents = loadContentsFromStorage();
  saveContentsToStorage([...currentContents, content]);
};

export const updateContentInStorage = (updatedContent: ContentItem): void => {
  const currentContents = loadContentsFromStorage();
  const updatedContents = currentContents.map((content) =>
    content.id === updatedContent.id ? updatedContent : content
  );
  saveContentsToStorage(updatedContents);
};

export const deleteContentFromStorage = (id: string): void => {
  const currentContents = loadContentsFromStorage();
  const filteredContents = currentContents.filter((content) => content.id !== id);
  saveContentsToStorage(filteredContents);
};
