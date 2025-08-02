import browser from 'webextension-polyfill';
import ICloudClient from './iCloudClient';
import { PopupState } from './pages/Popup/stateMachine';

export type Autofill = {
  button: boolean;
  contextMenu: boolean;
};

export type Options = {
  autofill: Autofill;
};

export type AppSpecificCredentials = {
  appleId: string;
  appSpecificPassword: string;
  // Encrypted storage flag for future security enhancement
  isEncrypted?: boolean;
};

export type AuthenticationMode = 'cookies' | 'app-specific-password';

export type Store = {
  popupState: PopupState;
  iCloudHmeOptions: Options; // TODO: rename key to options
  clientState?: {
    setupUrl: ConstructorParameters<typeof ICloudClient>[0];
    webservices: ConstructorParameters<typeof ICloudClient>[1];
  };
  // New fields for app-specific password authentication
  authenticationMode: AuthenticationMode;
  appSpecificCredentials?: AppSpecificCredentials;
};

export const DEFAULT_STORE = {
  popupState: PopupState.SignedOut,
  iCloudHmeOptions: {
    autofill: {
      button: true,
      contextMenu: true,
    },
  },
  clientState: undefined,
  authenticationMode: 'app-specific-password' as AuthenticationMode,
  appSpecificCredentials: undefined,
};

export async function getBrowserStorageValue<K extends keyof Store>(
  key: K
): Promise<Store[K] | undefined> {
  const store: Partial<Store> = await browser.storage.local.get(key);
  return store[key];
}

export async function setBrowserStorageValue<K extends keyof Store>(
  key: K,
  value: Store[K]
): Promise<void> {
  if (value === undefined) {
    await browser.storage.local.remove(key);
  } else {
    await browser.storage.local.set({ [key]: value });
  }
}
