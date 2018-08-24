import { Component, OnInit } from '@angular/core';
import { MatIconRegistry } from '@angular/material/icon';
import { DomSanitizer } from '@angular/platform-browser';
import { AuthService } from './auth/auth.service';
import { ObservableMedia } from '@angular/flex-layout';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  private _displayAccountIcons = false;
  constructor(iconRegistry: MatIconRegistry, sanitizer: DomSanitizer, 
    private authService: AuthService,
    public media: ObservableMedia) {
    iconRegistry.addSvgIcon(
      'lemon',
      sanitizer.bypassSecurityTrustResourceUrl('assets/img/icons/lemon.svg')
    );
  }

  ngOnInit() {
    this.authService.authStatus.subscribe(
      authStatus => {
        setTimeout(() => {
          this._displayAccountIcons = authStatus.isAuthenticated;
        }, 0);
      }
    );
  }

  get displayAccountIcons() {
    return this._displayAccountIcons;
  }
}
