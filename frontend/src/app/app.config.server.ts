import { provideRouter } from '@angular/router';
import { appRoutes } from './app.routes';

export const config = {
  providers: [
    provideRouter(appRoutes)  // Provide your routes configuration
    // You can add more providers here as needed
  ]
};
