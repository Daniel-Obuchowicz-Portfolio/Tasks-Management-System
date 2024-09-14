import { HttpClientModule } from '@angular/common/http'; // Import HttpClientModule
import { RouterModule } from '@angular/router';
import { appRoutes } from './app.routes';

export const appConfig = [
  RouterModule.forRoot(appRoutes),
  HttpClientModule,  // Ensure this is included globally if used across multiple components
];
