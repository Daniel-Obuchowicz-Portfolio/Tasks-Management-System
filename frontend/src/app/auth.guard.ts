import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
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

  canActivate(): boolean | Observable<boolean> | Promise<boolean> {
    // Check if the code is running in the browser
    if (isPlatformBrowser(this.platformId)) {
      const token = localStorage.getItem('token');
      if (token) {
        return true;
      } else {
        this.router.navigate(['/login']);
        return false;
      }
    } else {
      // If not in browser, deny access
      return false;
    }
  }
}
