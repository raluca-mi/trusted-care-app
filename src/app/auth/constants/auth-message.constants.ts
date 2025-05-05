export const AUTH_ERROR_MAP: { [key: string]: string } = {
  'auth/invalid-email': 'Please enter a valid email address.',
  'auth/user-disabled': 'This user account has been disabled.',
  'auth/user-not-found': 'No account found associated with this email address.',
  'auth/wrong-password': 'Invalid email or password. Please try again.',
  'auth/invalid-credential': 'Invalid email or password. Please try again.',
  'auth/email-already-in-use': 'This email address is already registered.',
  'auth/weak-password':
    'The password is too weak. Please choose a stronger password.',
};

export const AUTH_GENERIC_ERROR_MESSAGE =
  'An unexpected authentication error occurred. Please try again later.';
export const USER_DATA_NOT_AVAILABLE_MESSAGE =
  'User creation failed, user data not available.';
