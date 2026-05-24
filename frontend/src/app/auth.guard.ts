import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { CanActivate, Router, UrlTree } from '@angular/router';
import { isPlatformBrowser } from '@angular/common';  // Import to detect platform
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class AuthGuard implements CanActivate {

  constructor(
    private router: Router,
    @Inject(PLATFORM_ID) private platformId: object  // Inject platform ID to check the environment
  ) {}

  canActivate(): boolean | UrlTree | Observable<boolean | UrlTree> | Promise<boolean | UrlTree> {
    // Check if the code is running in the browser
    if (isPlatformBrowser(this.platformId)) {
      const token = localStorage.getItem('token');
      return token ? true : this.router.createUrlTree(['/login']);
    } else {
      // If not in browser, deny access
      return this.router.createUrlTree(['/login']);
    }
  }
}
