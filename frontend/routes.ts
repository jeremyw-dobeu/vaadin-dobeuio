import { Flow } from '@vaadin/flow-frontend';
import type { Route } from '@vaadin/router';
import Role from './generated/com/example/application/data/Role.js';
import { appStore } from './stores/app-store.js';
import './views/main-layout';

const { serverSideRoutes } = new Flow({
  imports: () => import('Frontend/generated/flow/generated-flow-imports'),
});

export type ViewRoute = Route & {
  title?: string;
  icon?: string;
  requiresLogin?: boolean;
  rolesAllowed?: Role[];
  children?: ViewRoute[];
};

export const hasAccess = (route: Route) => {
  const viewRoute = route as ViewRoute;
  if (viewRoute.requiresLogin && !appStore.loggedIn) {
    return false;
  }

  if (viewRoute.rolesAllowed) {
    return viewRoute.rolesAllowed.some((role) => appStore.isUserInRole(role));
  }
  return true;
};

export const views: ViewRoute[] = [
  // Place routes below (more info https://hilla.dev/docs/routing)
  {
    path: 'hello-world',
    component: 'hello-world2-view',
    rolesAllowed: [Role.ADMIN],
    icon: 'globe-solid',
    title: 'Hello World2',
    action: async (_context, _command) => {
      if (!hasAccess(_context.route)) {
        return _command.redirect('login');
      }
      await import('./views/helloworld2/hello-world2-view.js');
      return;
    },
  },
];
export const routes: ViewRoute[] = [
  {
    path: 'login',
    component: 'login-view',
    rolesAllowed: [Role.ADMIN],
    icon: '',
    title: 'Login',
    action: async (_context, _command) => {
      await import('./views/login/login-view.js');
      return;
    },
  },

  {
    path: '',
    component: 'main-layout',
    children: [
      ...views,
      // for server-side, the next magic line sends all unmatched routes:
      ...serverSideRoutes, // IMPORTANT: this must be the last entry in the array
    ],
  },
];
