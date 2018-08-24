import { Injectable } from '@angular/core';
import { Role } from './role.enum';
import { BehaviorSubject, Observable, throwError, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { HttpClient } from '@angular/common/http';
import { sign } from 'fake-jwt-sign';
import * as decode from 'jwt-decode';
import { CacheService } from './cache.service';

export interface IAuthStatus {
  isAuthenticated: boolean;
  userRole: Role;
  userId: string;
}

interface IServerAuthResponse {
  accessToken: string;
}

const defaultAuthStatus: IAuthStatus = {
  isAuthenticated: false,
  userRole: Role.None,
  userId: ''
};

@Injectable({
  providedIn: 'root'
})
export class AuthService extends CacheService {
  private jwtKey = 'jwt';
  private readonly authProvider: (
    email: string,
    password: string
  ) => Observable<IServerAuthResponse>;

  authStatus = new BehaviorSubject<IAuthStatus>(defaultAuthStatus);

  constructor(private httpClient: HttpClient) {
    super();
    this.authProvider = this.fakeAuthProvider;
  }

  private fakeAuthProvider(email: string, password: string): Observable<IServerAuthResponse> {
    if (!email.toLowerCase().endsWith('@test.com')) {
      return throwError('Failed to login!');
    }

    const authStatus = {
      isAuthenticated: true,
      userId: '223344',
      userRole: this.getUserRole(this.getUserRole(email))
    } as IAuthStatus;

    const authResponse = {
      accessToken: sign(authStatus, 'secret', { expiresIn: '1h', algorithm: 'none'})
    } as IServerAuthResponse;

    return of(authResponse)
  }

  private getUserRole(email: string): Role {
    const emailString = email.toLowerCase();
    if (emailString.includes(Role.Cashier)) {
      return Role.Cashier;
    } else if (emailString.includes(Role.Clerk)) {
      return Role.Clerk;
    } else if (emailString.includes(Role.Manager)) {
      return Role.Manager;
    }

    return Role.None;
  }

  login(email: string, password: string): Observable<IAuthStatus> {
    this.logout();

    const loginResponse = this.authProvider(email, password)
      .pipe(
        map(value => {
          this.setToken(value.accessToken);
          return decode(value.accessToken) as IAuthStatus;
        }),
        catchError(null)
    );

    loginResponse.subscribe(
      result => {
        this.authStatus.next(result);
      },
      err => {
        this.logout();
        return throwError(err);
      }
    );

    return loginResponse;
  }

  logout(): void {
    this.clearToken();
    this.authStatus.next(defaultAuthStatus);
  }

  private setToken(jwt: string) {
    this.setItem(this.jwtKey, jwt);
  }

  private getDecodedToken(): IAuthStatus {
    return decode(this.getItem(this.jwtKey));
  }

  getToken(): string {
    return this.getItem(this.jwtKey);
  }

  private clearToken() {
    this.removeItem(this.jwtKey);
  }
}
