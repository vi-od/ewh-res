import { Client, Account, Databases, Storage, ID } from 'appwrite';

// Appwrite configuration
const client = new Client();

client
    .setEndpoint('https://nyc.cloud.appwrite.io/v1') // Your Appwrite Endpoint
    .setProject('688f832100234b0c02bc'); // Your project ID

// Initialize Appwrite services
export const account = new Account(client);
export const databases = new Databases(client);
export const storage = new Storage(client);

// Database and Collection IDs (you'll need to create these in Appwrite console)
export const DATABASE_ID = 'ewhores-db';
export const IMAGES_COLLECTION_ID = 'images';
export const USERS_COLLECTION_ID = 'users';
export const STORAGE_BUCKET_ID = 'images-bucket';

// Authentication functions
export const authService = {
    // Sign up new user
    async signUp(email, password, name) {
        try {
            const user = await account.create(ID.unique(), email, password, name);
            console.log('User created:', user);
            return user;
        } catch (error) {
            console.error('Sign up error:', error);
            throw error;
        }
    },

    // Sign in user
    async signIn(email, password) {
        try {
            const session = await account.createEmailPasswordSession(email, password);
            console.log('User signed in:', session);
            return session;
        } catch (error) {
            console.error('Sign in error:', error);
            throw error;
        }
    },

    // Sign out user
    async signOut() {
        try {
            await account.deleteSession('current');
            console.log('User signed out');
        } catch (error) {
            console.error('Sign out error:', error);
            throw error;
        }
    },

    // Get current user
    async getCurrentUser() {
        try {
            const user = await account.get();
            return user;
        } catch (error) {
            console.error('Get user error:', error);
            return null;
        }
    }
};

// Database functions
export const databaseService = {
    // Create image document
    async createImage(imageData) {
        try {
            const document = await databases.createDocument(
                DATABASE_ID,
                IMAGES_COLLECTION_ID,
                ID.unique(),
                imageData
            );
            console.log('Image created:', document);
            return document;
        } catch (error) {
            console.error('Create image error:', error);
            throw error;
        }
    },

    // Get all images
    async getImages() {
        try {
            const documents = await databases.listDocuments(
                DATABASE_ID,
                IMAGES_COLLECTION_ID
            );
            return documents.documents;
        } catch (error) {
            console.error('Get images error:', error);
            throw error;
        }
    },

    // Get images by category
    async getImagesByCategory(category) {
        try {
            const documents = await databases.listDocuments(
                DATABASE_ID,
                IMAGES_COLLECTION_ID,
                []
            );
            return documents.documents;
        } catch (error) {
            console.error('Get images by category error:', error);
            throw error;
        }
    },

    // Like/unlike image
    async toggleLike(imageId, userId) {
        try {
            // This would require more complex logic to track likes
            // For now, just increment like count
            const image = await databases.getDocument(
                DATABASE_ID,
                IMAGES_COLLECTION_ID,
                imageId
            );
            
            const newLikeCount = (image.likes || 0) + 1;
            
            const updatedImage = await databases.updateDocument(
                DATABASE_ID,
                IMAGES_COLLECTION_ID,
                imageId,
                { likes: newLikeCount }
            );
            
            return updatedImage;
        } catch (error) {
            console.error('Toggle like error:', error);
            throw error;
        }
    }
};

// Storage functions
export const storageService = {
    // Upload image file
    async uploadImage(file) {
        try {
            const fileData = await storage.createFile(
                STORAGE_BUCKET_ID,
                ID.unique(),
                file
            );
            console.log('File uploaded:', fileData);
            return fileData;
        } catch (error) {
            console.error('Upload error:', error);
            throw error;
        }
    },

    // Get image preview URL
    getImagePreview(fileId, width = 400, height = 400) {
        return storage.getFilePreview(STORAGE_BUCKET_ID, fileId, width, height);
    },

    // Get image download URL
    getImageDownload(fileId) {
        return storage.getFileDownload(STORAGE_BUCKET_ID, fileId);
    },

    // Delete image
    async deleteImage(fileId) {
        try {
            await storage.deleteFile(STORAGE_BUCKET_ID, fileId);
            console.log('File deleted:', fileId);
        } catch (error) {
            console.error('Delete error:', error);
            throw error;
        }
    }
};

// Test connection function
export async function testConnection() {
    try {
        const user = await authService.getCurrentUser();
        console.log('Appwrite connection successful!', user ? 'User logged in' : 'No user logged in');
        return true;
    } catch (error) {
        console.error('Appwrite connection failed:', error);
        return false;
    }
} 