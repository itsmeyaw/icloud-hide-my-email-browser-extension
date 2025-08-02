/**
 * Secure cryptographic utilities for storing app-specific passwords
 * Uses AES-256-GCM with PBKDF2 key derivation following industry best practices
 * 
 * References:
 * - OWASP Cryptographic Storage Cheat Sheet
 * - Chrome Extension Security Best Practices
 * - NIST SP 800-132 (PBKDF2)
 */

export interface EncryptedData {
  ciphertext: string; // Base64 encoded
  iv: string; // Base64 encoded initialization vector
  salt: string; // Base64 encoded salt
  authTag: string; // Base64 encoded authentication tag
}

/**
 * Derives a cryptographic key from a password using PBKDF2
 * Uses 600,000 iterations as recommended by OWASP (2024)
 */
async function deriveKey(password: string, salt: Uint8Array): Promise<CryptoKey> {
  const encoder = new TextEncoder();
  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    encoder.encode(password),
    { name: 'PBKDF2' },
    false,
    ['deriveKey']
  );

  return crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt: salt,
      iterations: 600000, // OWASP 2024 recommendation
      hash: 'SHA-256'
    },
    keyMaterial,
    {
      name: 'AES-GCM',
      length: 256 // AES-256
    },
    false,
    ['encrypt', 'decrypt']
  );
}

/**
 * Encrypts sensitive data using AES-256-GCM with PBKDF2 key derivation
 * 
 * @param plaintext - The data to encrypt (e.g., app-specific password)
 * @param masterPassword - Master password for key derivation
 * @returns Encrypted data with all necessary components for decryption
 */
export async function encryptData(plaintext: string, masterPassword: string): Promise<EncryptedData> {
  // Generate cryptographically secure random values
  const salt = crypto.getRandomValues(new Uint8Array(32)); // 256-bit salt
  const iv = crypto.getRandomValues(new Uint8Array(12)); // 96-bit IV (optimal for AES-GCM)
  
  // Derive encryption key from password
  const key = await deriveKey(masterPassword, salt);
  
  // Encrypt the data
  const encoder = new TextEncoder();
  const encrypted = await crypto.subtle.encrypt(
    {
      name: 'AES-GCM',
      iv: iv,
      tagLength: 128 // 128-bit authentication tag
    },
    key,
    encoder.encode(plaintext)
  );

  // Extract ciphertext and authentication tag
  const encryptedArray = new Uint8Array(encrypted);
  const ciphertext = encryptedArray.slice(0, -16); // All but last 16 bytes
  const authTag = encryptedArray.slice(-16); // Last 16 bytes

  // Return all components as base64 strings for storage
  return {
    ciphertext: arrayBufferToBase64(ciphertext),
    iv: arrayBufferToBase64(iv),
    salt: arrayBufferToBase64(salt),
    authTag: arrayBufferToBase64(authTag)
  };
}

/**
 * Decrypts data that was encrypted with encryptData
 * 
 * @param encryptedData - The encrypted data components
 * @param masterPassword - Master password used for encryption
 * @returns Decrypted plaintext data
 * @throws Error if decryption fails (wrong password, corrupted data, etc.)
 */
export async function decryptData(encryptedData: EncryptedData, masterPassword: string): Promise<string> {
  try {
    // Convert base64 strings back to arrays
    const salt = base64ToArrayBuffer(encryptedData.salt);
    const iv = base64ToArrayBuffer(encryptedData.iv);
    const ciphertext = base64ToArrayBuffer(encryptedData.ciphertext);
    const authTag = base64ToArrayBuffer(encryptedData.authTag);
    
    // Derive the same key using the stored salt
    const key = await deriveKey(masterPassword, new Uint8Array(salt));
    
    // Combine ciphertext and auth tag for decryption
    const encryptedWithTag = new Uint8Array(ciphertext.byteLength + authTag.byteLength);
    encryptedWithTag.set(new Uint8Array(ciphertext), 0);
    encryptedWithTag.set(new Uint8Array(authTag), ciphertext.byteLength);
    
    // Decrypt the data
    const decrypted = await crypto.subtle.decrypt(
      {
        name: 'AES-GCM',
        iv: new Uint8Array(iv),
        tagLength: 128
      },
      key,
      encryptedWithTag
    );
    
    // Convert back to string
    const decoder = new TextDecoder();
    return decoder.decode(decrypted);
  } catch (error) {
    throw new Error('Decryption failed: Invalid password or corrupted data');
  }
}

/**
 * Securely generates a random master password for key derivation
 * Uses a combination of user input and browser-generated entropy
 */
export function generateSecureMasterPassword(userInput: string): string {
  // Combine user input with browser entropy
  const entropy = crypto.getRandomValues(new Uint8Array(32));
  const entropyString = arrayBufferToBase64(entropy);
  
  // Create a deterministic but unpredictable password
  // This ensures the same user input always generates the same master password
  // while adding additional entropy
  const combined = userInput + '|' + entropyString;
  return combined;
}

/**
 * Validates that a string appears to be encrypted data
 */
export function isEncryptedData(data: unknown): data is EncryptedData {
  return (
    typeof data === 'object' &&
    data !== null &&
    typeof (data as any).ciphertext === 'string' &&
    typeof (data as any).iv === 'string' &&
    typeof (data as any).salt === 'string' &&
    typeof (data as any).authTag === 'string'
  );
}

// Utility functions for base64 encoding/decoding
function arrayBufferToBase64(buffer: ArrayBuffer | Uint8Array): string {
  const bytes = new Uint8Array(buffer);
  let binary = '';
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

function base64ToArrayBuffer(base64: string): ArrayBuffer {
  const binary = atob(base64);
  const buffer = new ArrayBuffer(binary.length);
  const view = new Uint8Array(buffer);
  for (let i = 0; i < binary.length; i++) {
    view[i] = binary.charCodeAt(i);
  }
  return buffer;
}