import { Component, OnInit } from '@angular/core';
import { ReservasService } from '../services/reservas/reservas.service';
import { Reservas } from '../../Reservas';
import { AuthService } from '../services/auth/auth.service';
import { FlashMessagesService } from 'angular2-flash-messages';
// import {MatDialogModule} from '@angular/material/dialog';

@Component({
  selector: 'app-primer-piso',
  templateUrl: './primer-piso.component.html',
  styleUrls: ['./primer-piso.component.css'],
  providers: [ReservasService]
})
export class PrimerPisoComponent {

  public reservas: Reservas[]; // arreglo que recibe la informacion de la base de datos
  private date; // su valor es la fecha de la computadora
  private day; // el dia que tenga la computadora
  private month; // el mes que tenga la computadora
  public year; // el año que tenga la computadora
  public term;

  private separatedReservations: Reservas[]; // arreglo que obtiene las reservas separadas por un piso y salon especifico
  private orderedReservations: Reservas[]; // arreglo que tiene las reservas ordenado por piso y salón
  private acumulateReservation: Reservas[]; // Acumula las reservas de organizadas
  public admin = JSON.parse(localStorage.getItem('admin'));

  // Header de la tabla de reservas
  public reservationHeader: string[] = ['ID', 'Nombre', 'Departamento', 'Hora Reservada',
    'Hora de Salida', 'Cant. Est.', 'Piso', 'Salon', 'Fecha', 'Reserva'];


  constructor(private reservasService: ReservasService, private authService: AuthService, private flashMessage: FlashMessagesService) {
    this.day = (new Date().getDate()).toString(); // Verifica la fecha que de el dia correcto. El 4 de diciembre dio el 5.
    this.month = (+(new Date().getMonth().toString()) + 1).toString();
    if ((+(this.month) < 10) || (+(this.day) < 10)) {
      this.day = this.modifiedDayMonth(this.day);
      this.month = this.modifiedDayMonth(this.month);
    }
    this.year = new Date().getFullYear().toString();
    this.date = this.year + '-' + this.month + '-' + this.day;

    this.reservasService.getReservationsByDate(this.date).subscribe(reservas => {

      // Coge las reservas para que sean organizadas por hora
      this.reservas = this.getAllReservations(reservas);

      // Si no existen reservas se presenta un banner en donde se indicara
      if (this.reservas.length === undefined || this.reservas.length === 0) {
        flashMessage.show('No hay reservas creadas por el momento.', { cssClass: 'alert-warning' });
      }
    });
  }

  setStatus(resID) {
    debugger;
    const res = this.reservas;
    for (let i = 0; i < this.reservas.length; i++) {
      if (this.reservas[i].status === 'Confirmado' && this.reservas[i]._id === resID._id) {
        // Envio la reserva que quiero que sea actualizada
        let respueta = prompt("¿Está seguro que quiere ocupar este salón?", "Si")
        let message = 
        (respueta === "s" || respueta === "si" || respueta === "S" || respueta === "Si" ) ? 'Ok, ocupando el salón.' :
        (respueta === "n" || respueta === "no" || respueta === "N" || respueta === "No" ) ? 'Ok.' :
        'Solo escriba Si o No';
        if(respueta === "s" || respueta === "si" || respueta === "S" || respueta === "Si" )
        {
          console.log("resID: " + resID.ID);
          this.reservasService.updateReservation(resID).subscribe(data => { });
        }
        alert( message );

      } else if (this.reservas[i].status === 'Ocupado' && this.reservas[i]._id === resID._id) {
        let respuesta = prompt("¿Está seguro que quiere desocupar este salón?", "Si")
        let message = 
        (respuesta === "s" || respuesta === "si" || respuesta === "S" || respuesta === "Si" ) ? 'Ok, desocupando el salón.' :
        (respuesta === "n" || respuesta === "no" || respuesta === "N" || respuesta === "No" ) ? 'Ok.' :
        'Solo escriba Si o No';
        if(respuesta === "s" || respuesta === "si" || respuesta === "S" || respuesta === "Si" )
        {
          this.reservasService.updateReservation(resID).subscribe(data => { });
        }
        alert( message );
      }
    }
    window.location.reload();
  }

  getAllReservations(reservas) {
    let floor = '1';
    let room = this.getFloorAndRoom(floor);
    let flag = -2;
    const allReservations: Reservas[] = [];

    for (let i = 0; i < room.length; i++) {
      this.separatedReservations = this.separateRoomAndFloor(reservas, floor, room[i]);
      this.orderedReservations = this.organizeByHour(this.separatedReservations);
      for (let j = 0; j < this.orderedReservations.length; j++) {
        if (this.orderedReservations !== undefined || this.orderedReservations !== []) {
          allReservations.push(this.orderedReservations[j]);
        }
      }
      if (i === room.length - 1) {
        if (floor === '1') {
          floor = '2';
        } else if (floor === '2') {
          floor = '3';
        }
        room = this.getFloorAndRoom(floor);
        if (flag !== 0) {
          i = -1; // Para que cuando vuelva al for i sea igual a cero
          flag++;
        }
      }
    }
    return allReservations;
  }

  organizeByHour(organizedReservations) {
    let firstResHour: number;
    let nextFirstResHour: number;
    let diffHours: number;
    let minutesRes: number;
    let nextMinutesRes: number;
    let diffMinutes: number;

    if (organizedReservations !== []) {
      while (true) {
        let swapped = false;
        for (let j = 0; j < organizedReservations.length - 1; j++) {
          firstResHour = +(organizedReservations[j].horaSalida.charAt(0) + organizedReservations[j].horaSalida.charAt(1));
          nextFirstResHour = +(organizedReservations[j + 1].horaEntrada.charAt(0) + organizedReservations[j + 1].horaEntrada.charAt(1));
          diffHours = firstResHour - nextFirstResHour;
          if (diffHours > 0) {
            [organizedReservations[j], organizedReservations[j + 1]] = [organizedReservations[j + 1], organizedReservations[j]];
            swapped = true;
          } else if (diffHours === 0) {
            minutesRes = +(organizedReservations[j].horaSalida.charAt(3) + organizedReservations[j].horaSalida.charAt(4));
            nextMinutesRes = +(organizedReservations[j + 1].horaEntrada.charAt(3) + organizedReservations[j + 1].horaEntrada.charAt(4));
            diffMinutes = minutesRes - nextMinutesRes;
            if (diffMinutes > 0) {
              [organizedReservations[j], organizedReservations[j + 1]] = [organizedReservations[j + 1], organizedReservations[j]];
              swapped = true;
            }
          }
        }
        if (!swapped) {
          break;
        }
      }
    }
    return organizedReservations;
  }

  // Separa las reservas en pedazos de salon y piso especificos
  separateRoomAndFloor(reservationsToFilter, floor, room) {
    const especificRes: Reservas[] = [];

    for (let j = 0; j < reservationsToFilter.length; j++) {
      if (reservationsToFilter[j].piso === floor && reservationsToFilter[j].numSalon === room) {
        especificRes.push(reservationsToFilter[j]);
      }
    }
    return especificRes;
  }

  // Indica cuantos salones hay en un piso
  getFloorAndRoom(floor: string) {
    const floorAndRoom: any = {
      floor1: ['1', '2', '3', '4', '5', '6'],
      floor2: ['1', '2', '3', '4', '5', '6', '7'],
      floor3: ['1', '2', '3', '4', '5']
    };

    if (floor === '1') {
      return floorAndRoom.floor1;
    } else if (floor === '2') {
      return floorAndRoom.floor2;
    } else {
      return floorAndRoom.floor3;
    }
  }

  // Funcion que modifica el dia para que pueda encontrar reservas en la base de datos
  modifiedDayMonth(day) {
    switch (day) {
      case '1':
        day = '01';
        break;
      case '2':
        day = '02';
        break;
      case '3':
        day = '03';
        break;
      case '4':
        day = '04';
        break;
      case '5':
        day = '05';
        break;
      case '6':
        day = '06';
        break;
      case '7':
        day = '07';
        break;
      case '8':
        day = '08';
        break;
      case '9':
        day = '09';
        break;
    }
    return day;
  }

  onLogout() {
    this.authService.logout();
  }
}
