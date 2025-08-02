import React, { ButtonHTMLAttributes, DetailedHTMLProps } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSpinner } from '@fortawesome/free-solid-svg-icons';
import { faExclamationTriangle, faSignInAlt, faTimes } from '@fortawesome/free-solid-svg-icons';
import { useState, FormEvent } from 'react';

export const Spinner = () => {
  return (
    <div className="text-center">
      <FontAwesomeIcon
        icon={faSpinner}
        spin={true}
        className="text-3xl text-sky-400"
      />
    </div>
  );
};

export const LoadingButton = (
  props: {
    loading: boolean;
  } & DetailedHTMLProps<
    ButtonHTMLAttributes<HTMLButtonElement>,
    HTMLButtonElement
  >
) => {
  const { loading, disabled, ...btnHtmlAttrs } = props;

  const defaultClassName =
    'w-full justify-center text-white bg-sky-400 hover:bg-sky-500 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg px-5 py-2.5 text-center mr-2 inline-flex items-center';

  const diabledClassName =
    'w-full justify-center text-white bg-gray-400 font-medium rounded-lg px-5 py-2.5 text-center mr-2 inline-flex items-center';

  const btnClassName = disabled ? diabledClassName : defaultClassName;

  return (
    <button
      type="submit"
      className={btnClassName}
      disabled={loading || disabled}
      {...btnHtmlAttrs}
    >
      {loading && !disabled && (
        <FontAwesomeIcon icon={faSpinner} spin={true} className="mr-1" />
      )}
      {props.children}
    </button>
  );
};

export const ErrorMessage = (props: { children?: React.ReactNode }) => {
  return (
    <div
      className="p-2 text-sm text-red-700 bg-red-100 rounded-lg"
      role="alert"
    >
      {props.children}
    </div>
  );
};

export const TitledComponent = (props: {
  title: string;
  subtitle: string;
  children?: React.ReactNode;
}) => {
  const children =
    props.children instanceof Array ? props.children : [props.children];

  return (
    <div className="text-base space-y-3">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900">{props.title}</h1>
        <h2 className="font-medium text-gray-400">{props.subtitle}</h2>
      </div>
      {children?.map((child, key) => {
        return (
          child && (
            <React.Fragment key={key}>
              <hr />
              {child}
            </React.Fragment>
          )
        );
      })}
    </div>
  );
};

export const Link = (
  props: React.DetailedHTMLProps<
    React.AnchorHTMLAttributes<HTMLAnchorElement>,
    HTMLAnchorElement
  >
) => {
  // https://github.com/jsx-eslint/eslint-plugin-react/issues/3284
  // eslint-disable-next-line react/prop-types
  const { className, children, ...restProps } = props;
  return (
    <a
      className={`text-sky-400 hover:text-sky-500 ${className}`}
      target="_blank"
      rel="noreferrer"
      {...restProps}
    >
      {children}
    </a>
  );
};

export const LoadingComponent = ({ subtitle }: { subtitle?: string }) => {
  return (
    <TitledComponent title="Loading" subtitle={subtitle}>
      <div className="text-center">
        <FontAwesomeIcon icon={faSpinner} spin size="2x" />
      </div>
    </TitledComponent>
  );
};

export const AppSpecificPasswordForm = ({
  onSubmit,
  onCancel,
  isLoading = false,
  error,
}: {
  onSubmit: (appleId: string, appSpecificPassword: string, masterPassword: string) => void;
  onCancel: () => void;
  isLoading?: boolean;
  error?: string;
}) => {
  const [appleId, setAppleId] = useState('');
  const [appSpecificPassword, setAppSpecificPassword] = useState('');
  const [masterPassword, setMasterPassword] = useState('');

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (appleId.trim() && appSpecificPassword.trim() && masterPassword.trim()) {
      onSubmit(appleId.trim(), appSpecificPassword.trim(), masterPassword.trim());
    }
  };

  return (
    <TitledComponent title="iCloud Authentication" subtitle="Sign in with App-Specific Password">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="appleId" className="block text-sm font-medium text-gray-700 mb-1">
            Apple ID
          </label>
          <input
            type="email"
            id="appleId"
            value={appleId}
            onChange={(e) => setAppleId(e.target.value)}
            placeholder="your.email@example.com"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            required
            disabled={isLoading}
          />
        </div>
        
        <div>
          <label htmlFor="appPassword" className="block text-sm font-medium text-gray-700 mb-1">
            App-Specific Password
          </label>
          <input
            type="password"
            id="appPassword"
            value={appSpecificPassword}
            onChange={(e) => setAppSpecificPassword(e.target.value)}
            placeholder="xxxx-xxxx-xxxx-xxxx"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            required
            disabled={isLoading}
          />
        </div>

        <div>
          <label htmlFor="masterPassword" className="block text-sm font-medium text-gray-700 mb-1">
            Master Password
          </label>
          <input
            type="password"
            id="masterPassword"
            value={masterPassword}
            onChange={(e) => setMasterPassword(e.target.value)}
            placeholder="Enter a secure password to encrypt your credentials"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            required
            disabled={isLoading}
          />
          <p className="text-xs text-gray-500 mt-1">
            This password encrypts your app-specific password locally. Choose something secure and memorable.
          </p>
        </div>

        {error && (
          <div className="flex p-3 text-sm border text-red-600 rounded-lg bg-red-50 border-red-200" role="alert">
            <FontAwesomeIcon icon={faExclamationTriangle} className="mr-2 mt-1" />
            <span className="sr-only">Error</span>
            <div>{error}</div>
          </div>
        )}

        <div className="space-y-2">
          <button
            type="submit"
            disabled={isLoading || !appleId.trim() || !appSpecificPassword.trim() || !masterPassword.trim()}
            className="w-full justify-center text-white bg-blue-500 hover:bg-blue-600 disabled:bg-gray-400 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg px-5 py-2.5 text-center inline-flex items-center"
          >
            {isLoading ? (
              <>
                <FontAwesomeIcon icon={faSpinner} spin className="mr-2" />
                Signing In...
              </>
            ) : (
              <>
                <FontAwesomeIcon icon={faSignInAlt} className="mr-2" />
                Sign In
              </>
            )}
          </button>
          
          <button
            type="button"
            onClick={onCancel}
            disabled={isLoading}
            className="w-full justify-center text-gray-700 bg-gray-200 hover:bg-gray-300 disabled:bg-gray-100 focus:ring-4 focus:outline-none focus:ring-gray-300 font-medium rounded-lg px-5 py-2.5 text-center inline-flex items-center"
          >
            <FontAwesomeIcon icon={faTimes} className="mr-2" />
            Cancel
          </button>
        </div>

        <div className="text-xs text-gray-500 space-y-2">
          <p>
            <strong>Security Information:</strong>
          </p>
          <p>
            Your app-specific password is encrypted using AES-256-GCM before being stored locally. 
            The master password you choose never leaves your device and is used only for encryption/decryption.
          </p>
          <p>
            <a 
              href="https://support.apple.com/en-us/HT204397" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-blue-500 hover:text-blue-700 underline"
            >
              Learn how to generate an app-specific password →
            </a>
          </p>
        </div>
      </form>
    </TitledComponent>
  );
};

export const MasterPasswordPrompt = ({
  onSubmit,
  onCancel,
  isLoading = false,
  error,
  appleId,
}: {
  onSubmit: (masterPassword: string) => void;
  onCancel: () => void;
  isLoading?: boolean;
  error?: string;
  appleId: string;
}) => {
  const [masterPassword, setMasterPassword] = useState('');

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (masterPassword.trim()) {
      onSubmit(masterPassword.trim());
    }
  };

  return (
    <TitledComponent title="Unlock Credentials" subtitle={`Sign in as ${appleId}`}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="masterPassword" className="block text-sm font-medium text-gray-700 mb-1">
            Master Password
          </label>
          <input
            type="password"
            id="masterPassword"
            value={masterPassword}
            onChange={(e) => setMasterPassword(e.target.value)}
            placeholder="Enter your master password to unlock credentials"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            required
            disabled={isLoading}
            autoFocus
          />
          <p className="text-xs text-gray-500 mt-1">
            This is the password you used to encrypt your app-specific password.
          </p>
        </div>

        {error && (
          <div className="flex p-3 text-sm border text-red-600 rounded-lg bg-red-50 border-red-200" role="alert">
            <FontAwesomeIcon icon={faExclamationTriangle} className="mr-2 mt-1" />
            <span className="sr-only">Error</span>
            <div>{error}</div>
          </div>
        )}

        <div className="space-y-2">
          <button
            type="submit"
            disabled={isLoading || !masterPassword.trim()}
            className="w-full justify-center text-white bg-blue-500 hover:bg-blue-600 disabled:bg-gray-400 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg px-5 py-2.5 text-center inline-flex items-center"
          >
            {isLoading ? (
              <>
                <FontAwesomeIcon icon={faSpinner} spin className="mr-2" />
                Unlocking...
              </>
            ) : (
              <>
                <FontAwesomeIcon icon={faSignInAlt} className="mr-2" />
                Unlock
              </>
            )}
          </button>
          
          <button
            type="button"
            onClick={onCancel}
            disabled={isLoading}
            className="w-full justify-center text-gray-700 bg-gray-200 hover:bg-gray-300 disabled:bg-gray-100 focus:ring-4 focus:outline-none focus:ring-gray-300 font-medium rounded-lg px-5 py-2.5 text-center inline-flex items-center"
          >
            <FontAwesomeIcon icon={faTimes} className="mr-2" />
            Use Different Account
          </button>
        </div>
      </form>
    </TitledComponent>
  );
};
