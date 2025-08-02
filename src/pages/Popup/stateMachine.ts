export enum PopupState {
  Authenticated,
  SignedOut,
  AuthenticatedAndManaging,
  AuthenticatingWithPassword,
}

export type SignedOutAction = 'AUTHENTICATE' | 'AUTHENTICATE_WITH_PASSWORD';
export type AuthenticatingWithPasswordAction = 'AUTH_SUCCESS' | 'AUTH_CANCEL' | 'AUTH_RETRY';
export type AuthenticatedAction = 'MANAGE' | 'SIGN_OUT';
export type AuthenticatedAndManagingAction = 'GENERATE' | 'SIGN_OUT';

export type PopupAction =
  | SignedOutAction
  | AuthenticatingWithPasswordAction
  | AuthenticatedAction
  | AuthenticatedAndManagingAction;

type GenericTranstitions<Actions extends PopupAction> = {
  [key in Actions]: PopupState;
};

type SignedOutTransitions = GenericTranstitions<SignedOutAction>;
type AuthenticatingWithPasswordTransitions = GenericTranstitions<AuthenticatingWithPasswordAction>;
type AuthenticatedTransitions = GenericTranstitions<AuthenticatedAction>;
type AuthenticatedAndManagingTransition =
  GenericTranstitions<AuthenticatedAndManagingAction>;

type Transitions = {
  [PopupState.SignedOut]: SignedOutTransitions;
  [PopupState.AuthenticatingWithPassword]: AuthenticatingWithPasswordTransitions;
  [PopupState.Authenticated]: AuthenticatedTransitions;
  [PopupState.AuthenticatedAndManaging]: AuthenticatedAndManagingTransition;
} & { [key in PopupState]: unknown };

export const STATE_MACHINE_TRANSITIONS: Transitions = {
  [PopupState.SignedOut]: {
    AUTHENTICATE: PopupState.Authenticated, // Legacy cookie-based auth
    AUTHENTICATE_WITH_PASSWORD: PopupState.AuthenticatingWithPassword,
  },
  [PopupState.AuthenticatingWithPassword]: {
    AUTH_SUCCESS: PopupState.Authenticated,
    AUTH_CANCEL: PopupState.SignedOut,
    AUTH_RETRY: PopupState.AuthenticatingWithPassword,
  },
  [PopupState.Authenticated]: {
    MANAGE: PopupState.AuthenticatedAndManaging,
    SIGN_OUT: PopupState.SignedOut,
  },
  [PopupState.AuthenticatedAndManaging]: {
    GENERATE: PopupState.Authenticated,
    SIGN_OUT: PopupState.SignedOut,
  },
};
