export type OAuthLoginErrorCode =
  | 'oauth_denied'
  | 'invalid_state'
  | 'email_required'
  | 'email_unverified'
  | 'oauth_failed'
  | 'oauth_not_configured';

export class OAuthLoginError extends Error {
  constructor(public readonly code: OAuthLoginErrorCode) {
    super(code);
  }
}
