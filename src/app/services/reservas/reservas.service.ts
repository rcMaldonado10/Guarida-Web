import { Injectable } from '@angular/core';
import { Http, Headers } from '@angular/http';
import { url } from '../../../url';
import 'rxjs/add/operator/map';

@Injectable()
export class ReservasService {

  authToken: any;

  constructor(private http: Http) { }

  /* Por el momento no se utiliza en la pagina. Esta funcion consigue todas las reservas
     que se encuentran en la base de datos. */
  getReservas() {
    const headers = new Headers();
    this.loadToken();
    headers.append('x-access-token', this.authToken);
    return this.http.get( url + '/reservas/web', { headers: headers })
      .map(res => res.json());
  }

  /* Por el momento no se utiliza en la pagina. Esta funcion consigue todas las
     reservas de un un salon, en piso y fecha especifica. */
  getReservationsByEspecific(date, floor, room) {
    const headers = new Headers();
    this.loadToken();
    headers.append('x-access-token', this.authToken);
    return this.http.get(url + '/reservas/' + date + '/' + floor + '/' + room, { headers: headers })
      .map(res => res.json());
  }

  /* Esta si se utiliza en la pagina. Consigue todas las reservas en una fecha especifica.
  Esta funcion se utiliza en Confirmar Reserva y en Salones disponibles */
  getReservationsByDate(date) {
    const headers = new Headers();
    this.loadToken();
    headers.append('x-access-token', this.authToken);
    return this.http.get(url + '/reservas/web/' + date, { headers: headers })
      .map(res => res.json());
  }

  /* Esta se utiliza en la pagina. Añade una reserva en la base de datos. Se
  utiliza en Crear Reserva  */
  addReserva(reserva) {
    const headers = new Headers();
    this.loadToken();
    headers.append('x-access-token', this.authToken);
    headers.append('Content-Type', 'application/json');
    return this.http.post(url + '/reservas/web', JSON.stringify(reserva), { headers: headers })
      .map(res => res.json());
  }

  /* Esta se utiliza en la pagina. Elimina una reserva de la base de datos.
  Se utiliza en Confirmar Reserva, y el status de la reserva debe ser Ocupado */
  deleteReservation(id) {
    const headers = new Headers();
    this.loadToken();
    headers.append('x-access-token', this.authToken);
    return this.http.delete(url + '/reservas/web/' + id, {headers: headers})
      .map(res => res.json());
  }

  /* Esta se utiliza en la pagina. Actualiza el status de una reserva en la base
  de datos. Se utiliza en Confirmar Reserva, y el status de la reserva debe ser
  Confirmado */
  updateReservation(updateRes) {
    console.log(updateRes);
    const headers = new Headers();
    this.loadToken();
    headers.append('x-access-token', this.authToken);
    headers.append('Content-Type', 'application/json');
    return this.http.put(url + '/reservas/web/' + updateRes._id, JSON.stringify(updateRes), { headers: headers })
      .map(res => res.json());
  }

  /* Funcion carga el token de autorización que esta en el localStorage.
  El token es enviado por los API de la base de datos para ver que el
  usuario tiene el permiso para hacerlo. */
  loadToken() {
    const token = localStorage.getItem('token');
    this.authToken = token;
  }
}
