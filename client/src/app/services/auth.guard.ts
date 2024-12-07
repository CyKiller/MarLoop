import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {

  constructor(private router: Router) {}

  canActivate(): Observable<boolean> | Promise<boolean> | boolean {
    const isAuthenticated = localStorage.getItem('isAuthenticated');
    if (isAuthenticated) {
      console.log('AuthGuard: User is authenticated');
      return true;
    } else {
      console.error('AuthGuard: User is not authenticated, redirecting to login');
      this.router.navigate(['/auth/login']).then(() => {
        console.log('Redirected to login page due to failed authentication');
      }).catch(error => {
        console.error('Error redirecting to login page:', error.message, error);
      });
      return false;
    }
  }
}