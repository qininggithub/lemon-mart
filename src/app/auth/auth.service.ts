import { Injectable } from '@angular/core';
import { Role } from './role.enum';
import { BehaviorSubject, Observable, throwError, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { HttpClient } from '@angular/common/http';
import { sign } from 'fake-jwt-sign';
import * as decode from 'jwt-decode';

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
export class AuthService {
  private readonly authProvider: (
    email: string,
    password: string
  ) => Observable<IServerAuthResponse>;

  authStatus = new BehaviorSubject<IAuthStatus>(defaultAuthStatus);

  constructor(private httpClient: HttpClient) {
    this.authProvider = this.fakeAuthProvider;
  }

  private fakeAuthProvider(email: string, password: string): Observable<IServerAuthResponse> {
    if (!email.toLowerCase().endsWith('@test,cpm')) {
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
    this.authStatus.next(defaultAuthStatus);
  }
}
