import { Injectable } from '@angular/core';
import { Http, Headers } from '@angular/http';
import 'rxjs/add/operator/map';
import { tokenNotExpired } from 'angular2-jwt';
import { url } from '../../../url';

@Injectable()
export class AuthService {

  authToken: any;
  admin: any;

  constructor(private http: Http) { }

  /* Esto se utiliza añadir administradores, en la base de datos */
  registerAdmin(admin) {
    const headers = new Headers();
    headers.append('Content-Type', 'application/json');
    return this.http.post(url + '/admin/register', admin, {headers: headers})
      .map(res => res.json());
  }

  /* Estos se utiliza en el login, autentica el usuario para cuando entra su password */
  authenticateAdmin(admin) {
    const headers = new Headers();
    headers.append('Content-Type', 'application/json');
    return this.http.post(url + '/admin/authenticate', admin, { headers: headers })
      .map(res => res.json());
  }

  /* Guarda la informacion del admin y el token de autorizacion que sera usado
   para las proximas llamadas */
  storeAdminData(token, admin) {
    localStorage.setItem('token', token);
    localStorage.setItem('admin', JSON.stringify(admin));
    this.authToken = token;
    this.admin = admin;
  }

  /* Carga el token de autorizacion del localStorage para comprobarlo*/
  loadToken() {
    const token = localStorage.getItem('token');
    this.authToken = token;
  }

  /* Verifica si la sesion del usuario es valida basado en el tiempo de 
  expiracion del token del usuario */
  loggedIn() {
    return tokenNotExpired();
  }

  /* Elimina los valores del localStorage. Esto se utiliza cuando el token no
  es valido o cuando el usuario hace logout. */
  logout() {
    this.authToken = null;
    this.admin = null;
    localStorage.clear();
  }
}
