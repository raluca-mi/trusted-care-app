import { NavigationLinkDetails } from '../models/navigation-link-details.model';

export const ADMIN_NAVIGATION_LINK_DETAILS: NavigationLinkDetails[] = [
  {
    id: 'admin-assistants',
    displayName: 'Manage Assistants',
    route: '/admin/assistants',
    icon: 'manage_accounts',
  },
  {
    id: 'admin-researchers',
    displayName: 'Manage Researchers',
    route: '/admin/researchers',
    icon: 'group',
  },
];
