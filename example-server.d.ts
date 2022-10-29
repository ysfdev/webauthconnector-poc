import type { AuthenticatorDevice } from '@simplewebauthn/typescript-types';

// Sample details that will be stored on server side DB
interface LoggedInUser {
  id: string;
  username: string;
  devices: AuthenticatorDevice[];
  currentChallenge?: string;
}
