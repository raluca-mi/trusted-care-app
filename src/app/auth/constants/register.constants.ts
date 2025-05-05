export const REGISTER_TEXT = {
  // Card
  title: 'Create Account',
  subtitle: 'Join Trusted Care',

  // Labels
  firstNameLabel: 'First Name',
  lastNameLabel: 'Last Name',
  emailLabel: 'Email Address',
  passwordLabel: 'Password',
  confirmPasswordLabel: 'Confirm Password',
  userTypeLabel: 'I want to register as a:',

  // Placeholders
  firstNamePlaceholder: 'Enter your first name',
  lastNamePlaceholder: 'Enter your last name',
  emailPlaceholder: 'Enter your email address',
  passwordPlaceholder: 'Choose a strong password',
  confirmPasswordPlaceholder: 'Re-enter your password',

  // Select Options
  userTypeOptionResearcher: 'Person Looking for Care',
  userTypeOptionCareAssistant: 'Care Assistant / Provider',

  // Buttons & Links
  registerButton: 'Register',
  signInPrompt: 'Already have an account?',
  signInLink: 'Sign in here',

  // Validation Messages
  firstNameRequired: 'First name is required',
  lastNameRequired: 'Last name is required',
  emailRequired: 'Email is required',
  emailInvalid: 'Please enter a valid email address',
  emailPattern: 'Invalid email format provided',
  passwordRequired: 'Password is required',
  passwordMinLength: 'Password must be at least 6 characters long',
  confirmPasswordRequired: 'Please confirm your password',
  passwordsDoNotMatch: 'Passwords do not match',
  userTypeRequired: 'Please select your role',
  emailRegexPattern: '^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$',
} as const;
