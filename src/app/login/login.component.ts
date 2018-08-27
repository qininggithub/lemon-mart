import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { AuthService } from '../auth/auth.service';
import { Router, ActivatedRoute } from '@angular/router';
import { Role } from '../auth/role.enum';
import { UiService } from '../common/ui.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {

  loginForm: FormGroup;
  loginError = '';
  redirectUrl = '';

  constructor(private formBuilder: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private route: ActivatedRoute,
    private uiService: UiService) {
      route.paramMap.subscribe(params => (this.redirectUrl = params.get('redirectUrl')));
  }

  ngOnInit() {
    this.buildLoginForm();
  }

  buildLoginForm() {
    this.loginForm = this.formBuilder.group({
        email: ['', [Validators.required, Validators.email]],
        password: ['', [Validators.required, Validators.minLength(2)]]
      });
  }

  async login(submittedForm: FormGroup) {
    this.authService.login(submittedForm.value.email, submittedForm.value.password)
      .subscribe(authStatus => {
        if (authStatus.isAuthenticated) {
          this.uiService.showToast(`Welcome! Role: ${authStatus.userRole}`);
          // this.uiService.showDialog('Welcome!', `Role: ${authStatus.userRole}`);
          this.router.navigate([this.redirectUrl || this.homeRoutePerRole(authStatus.userRole)]);
        }
      }, error => (this.loginError = error));
  }

  homeRoutePerRole(role: Role): string {
    switch (role) {
      case Role.Cashier:
        return '/pos';
      case Role.Clerk:
        return '/inventory';
      case Role.Manager:
        return '/manager';
      case Role.None:
        return '/user/profile';
      default:
        return '/user/profile';
    }
  }
}
