import { Component, OnInit } from '@angular/core';
import { ValidateService } from '../services/validate/validate.service';
import { AuthService } from '../services/auth/auth.service';
import { FlashMessagesService } from 'angular2-flash-messages';
import { Router } from '@angular/router';

@Component({
  selector: 'app-register-admin',
  templateUrl: './register-admin.component.html',
  styleUrls: ['./register-admin.component.css']
})
export class RegisterAdminComponent implements OnInit {

  admin = JSON.parse(localStorage.getItem('admin'));

  name: String;
  username: String;
  adminLevel: Number;
  adminPassword: String;
  confirmAdminPassword: String;
  year: String;

  public selectUndefinedOptionValue = undefined;

  constructor(private validateService: ValidateService,
              private flashMessage: FlashMessagesService,
              private authService: AuthService,
              private router: Router) {
                // if (this.admin.adminLevel === '2') {
                //   this.onLogout();
                // }
                // this.year = new Date().getFullYear().toString();
               }

  ngOnInit() {
  }

  addAdmin() {
    const admin = {
      name: this.name,
      username: this.username,
      adminLevel: this.adminLevel,
      password: this.adminPassword
    };

    // Validate if all fields are filled
    if (!this.validateService.validateAdmin(admin, this.confirmAdminPassword)) {
      this.flashMessage.show('Favor llenar todos los campos', { cssClass: 'alert-danger', timeout: 3000});
      return false;
    }

    if (admin.password === this.confirmAdminPassword) {
      // Register the new Administrator
      this.authService.registerAdmin(admin).subscribe(data => {
        console.log(data.success);
        if (data.success) {
          this.flashMessage.show('El administrador ya esta registrado', { cssClass: 'alert-success', timeout: 3000 });
          // this.router.navigate(['/']);
        } else {
          this.flashMessage.show('Error al entar el administrador', { cssClass: 'alert-danger', timeout: 3000 });
        }
      });
    } else {
      this.flashMessage.show('Las contraseñas entradas no son iguales', {cssClass: 'alert-danger', timeout: 5000});
    }
  }

  onLogout() {
    this.authService.logout();
    if (this.admin.adminLevel === '2') {
      this.router.navigate(['/']);
    }
  }
}
