import { NavigationLinkDetails } from '../models/navigation-link-details.model';

export const ADMIN_NAVIGATION_LINK_DETAILS: NavigationLinkDetails[] = [
  {
    id: 'admin-assistants',
    displayName: 'Manage Assistants',
    route: '/admin/assistants',
    icon: 'manage_accounts',
  },
  {
    id: 'admin-verify-assistants',
    displayName: 'Verify Assistants',
    route: '/admin/verify-assistants',
    icon: 'how_to_reg',
  },
  {
    id: 'admin-researchers',
    displayName: 'Manage Researchers',
    route: '/admin/researchers',
    icon: 'group',
  },
];
