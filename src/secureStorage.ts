/**
 * Secure storage manager for app-specific passwords
 * Handles encryption/decryption of credentials using AES-256-GCM
 */

import { encryptData, decryptData, EncryptedData } from './crypto';
import { setBrowserStorageValue, getBrowserStorageValue } from './storage';
import type { SecureCredentials, AppSpecificCredentials } from './storage';

/**
 * Stores app-specific credentials securely using encryption
 * 
 * @param appleId - Apple ID (stored in plaintext)
 * @param appSpecificPassword - App-specific password (encrypted)
 * @param masterPassword - User's master password for encryption
 */
export async function storeSecureCredentials(
  appleId: string,
  appSpecificPassword: string,
  masterPassword: string
): Promise<void> {
  try {
    // Encrypt the app-specific password
    const encryptedPassword = await encryptData(appSpecificPassword, masterPassword);
    
    // Store the credentials
    const secureCredentials: SecureCredentials = {
      appleId,
      encryptedPassword,
      version: 1 // For future migration compatibility
    };
    
    await setBrowserStorageValue('secureCredentials', secureCredentials);
    
    // Clear any legacy unencrypted credentials
    await setBrowserStorageValue('appSpecificCredentials', undefined);
  } catch (error) {
    throw new Error('Failed to store secure credentials: ' + (error instanceof Error ? error.message : 'Unknown error'));
  }
}

/**
 * Retrieves and decrypts app-specific credentials
 * 
 * @param masterPassword - User's master password for decryption
 * @returns Decrypted credentials or null if not found/invalid
 */
export async function retrieveSecureCredentials(masterPassword: string): Promise<AppSpecificCredentials | null> {
  try {
    const secureCredentials = await getBrowserStorageValue('secureCredentials');
    
    if (!secureCredentials) {
      // Try to migrate legacy credentials if they exist
      return await migrateLegacyCredentials(masterPassword);
    }
    
    // Decrypt the app-specific password
    const appSpecificPassword = await decryptData(secureCredentials.encryptedPassword, masterPassword);
    
    return {
      appleId: secureCredentials.appleId,
      appSpecificPassword,
      isEncrypted: true
    };
  } catch (error) {
    console.debug('Failed to retrieve secure credentials:', error);
    return null;
  }
}

/**
 * Migrates legacy unencrypted credentials to secure encrypted storage
 * This provides backward compatibility for users upgrading
 */
async function migrateLegacyCredentials(masterPassword: string): Promise<AppSpecificCredentials | null> {
  try {
    const legacyCredentials = await getBrowserStorageValue('appSpecificCredentials');
    
    if (!legacyCredentials) {
      return null;
    }
    
    // Migrate to secure storage
    await storeSecureCredentials(
      legacyCredentials.appleId,
      legacyCredentials.appSpecificPassword,
      masterPassword
    );
    
    console.log('Successfully migrated legacy credentials to secure storage');
    
    return {
      ...legacyCredentials,
      isEncrypted: true
    };
  } catch (error) {
    console.warn('Failed to migrate legacy credentials:', error);
    return null;
  }
}

/**
 * Deletes all stored credentials (both legacy and secure)
 */
export async function clearAllCredentials(): Promise<void> {
  await setBrowserStorageValue('secureCredentials', undefined);
  await setBrowserStorageValue('appSpecificCredentials', undefined);
}

/**
 * Checks if secure credentials are available
 */
export async function hasSecureCredentials(): Promise<boolean> {
  const secureCredentials = await getBrowserStorageValue('secureCredentials');
  const legacyCredentials = await getBrowserStorageValue('appSpecificCredentials');
  
  return !!(secureCredentials || legacyCredentials);
}

/**
 * Updates the master password by re-encrypting stored credentials
 * This is useful when users want to change their master password
 */
export async function updateMasterPassword(
  currentMasterPassword: string,
  newMasterPassword: string
): Promise<void> {
  // First retrieve credentials with current password
  const credentials = await retrieveSecureCredentials(currentMasterPassword);
  
  if (!credentials) {
    throw new Error('Could not decrypt credentials with current master password');
  }
  
  // Re-encrypt with new password
  await storeSecureCredentials(
    credentials.appleId,
    credentials.appSpecificPassword,
    newMasterPassword
  );
}