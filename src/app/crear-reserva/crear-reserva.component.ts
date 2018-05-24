import { Component, OnInit } from '@angular/core';
import { Reservas } from '../../Reservas';
import { ReservasService } from '../services/reservas/reservas.service';
import { Router } from '@angular/router';
import { FlashMessagesService } from 'angular2-flash-messages';
import { AuthService } from '../services/auth/auth.service';
import { timeout } from 'q';

@Component({
  selector: 'app-crear-reserva',
  templateUrl: './crear-reserva.component.html',
  styleUrls: ['./crear-reserva.component.css'],
  providers: [ReservasService]
})
export class CrearReservaComponent implements OnInit {

  reservations: Reservas[];
  reservationToCheck: any[] = [];

  public id: string;
  public name: string;
  public department: string;
  public quantityStudents: number;
  public floorNumber: string;
  public roomNumber: number;
  public enteredHour: string;
  public enteredMinutes: string;
  public enteredMeridiem: string;
  public exitHour: string;
  public exitMinutes: string;
  public exitMeridiem: string;
  public resDate: string;
  public admin = JSON.parse(localStorage.getItem('admin'));

  public selectUndefinedOptionValue = undefined;

  private date; // su valor es la fecha de la computadora
  private day; // el dia que tenga la computadora
  private month; // el mes que tenga la computadora
  public year; // el año que tenga la computadora

  constructor(private reservaService: ReservasService,
    private flashMessage: FlashMessagesService,
    private authService: AuthService,
    private router: Router) {
    this.day = (new Date().getDate()).toString(); // Verifica la fecha que de el dia correcto. El 4 de diciembre dio el 5.
    this.month = (+(new Date().getMonth().toString()) + 1).toString();
    if ((+(this.month) < 10) || (+(this.day) < 10)) {
      this.day = this.modifiedDayMonth(this.day);
      this.month = this.modifiedDayMonth(this.month);
    }
    this.year = new Date().getFullYear().toString();
    this.date = this.year + '-' + this.month + '-' + this.day;
  }

  ngOnInit() {
  }

  reservar() {
    let allGoodFlagID: boolean; // Flag to check if the ID is typed in the correct way
    let allGoodFlagQuantity: boolean; // Flag to check if the Quantity of students is typed is typed with numbers and no letters
    let allGoodFlagTime: boolean; // Flag to check if the reservation time is between the allowed hours
    let allGoodFlagHourLimit: boolean; // Flag to check if the reservation time doesn't exceed 2 hours
    const startTime = this.enteredHour + ' ' + this.enteredMeridiem; // Recibe el tiempo de entrada (hora solamente) y si se suma el AM o PM
    const endingTime = this.exitHour + ' ' + this.exitMeridiem; // Recibe el tiempo de salida (hora solamente) y si se suma el AM o PM
    const startTimeMilitary = this.changeToMilitary(startTime);
    const endingTimeMilitary = this.changeToMilitary(endingTime);
    const militaryTimeDiff = ((+endingTimeMilitary) - (+startTimeMilitary));
    let hourToEnter: string;
    let hourToExit: string;
    let diffMinutes: any;

    if (this.id === undefined || this.name === undefined || this.department === undefined ||
      this.quantityStudents === undefined || this.floorNumber === undefined ||
      this.roomNumber === undefined || this.enteredHour === undefined || this.exitHour === undefined ||
      this.resDate === undefined) {
      this.flashMessage.show('Favor de llenar todos los campos.', { cssClass: 'alert-danger', timeout: 5000 });
    } else {
      const tempArray: String[] = [];
      const checkinIdArray: String[] = [];
      let idArray = '';
      if (isNaN(+this.id)) {
        for (let i = 0; i < this.id.length; i++) {
          tempArray.push(this.id.charAt(i));
        }
      } else {
        for (let i = 0; i < this.id.length; i++) {
          tempArray.push(this.id.charAt(i));
        }
      }
      for (let i = 0; i < tempArray.length; i++) {
        if (false === isNaN(+tempArray[i])) {
          idArray += tempArray[i];
          checkinIdArray.push(tempArray[i]);
        }
      }
      if (checkinIdArray.length === 9) {
        this.id = idArray;
        allGoodFlagID = true;
      } else {
        this.flashMessage.show('El numero estudiantil es incorrecto', { cssClass: 'alert-danger', timeout: 5000 });
        allGoodFlagID = false;
      }
      if (isNaN(this.quantityStudents)) {
        this.flashMessage.show('La cantidad de estudiantes no es un número', { cssClass: 'alert-danger', timeout: 5000 });
        allGoodFlagQuantity = false;
      } else {
        allGoodFlagQuantity = true;
      }
      if ((+startTimeMilitary) >= 8 && (+endingTimeMilitary) <= 21) {
        allGoodFlagHourLimit = true;
        if ((+endingTimeMilitary) === 21 && (+this.exitMinutes) > 0 ) {
          allGoodFlagHourLimit = false;
          this.flashMessage.show('Los horarios de reserva son de 8:00 AM - 9:00 PM', {cssClass: 'alert-danger', timeout: 5000});
        }
      } else {
        allGoodFlagHourLimit = false;
        this.flashMessage.show('Los horarios de reserva son de 8:00 AM - 9:00 PM', { cssClass: 'alert-danger', timeout: 5000 });
      }
      if (militaryTimeDiff <= 2 && militaryTimeDiff > 0) {
        hourToEnter = startTimeMilitary + ':' + this.enteredMinutes;
        hourToExit = endingTimeMilitary + ':' + this.exitMinutes;

        allGoodFlagTime = true;
        // Este if es para calcular los minutos cuando la diferencia de hora es dos.
        if (militaryTimeDiff === 2) {
          diffMinutes = (+this.exitMinutes) - (+this.enteredMinutes);
          if (diffMinutes > 0) {
            this.flashMessage.show('La reserva excede el limite de dos horas', { cssClass: 'alert-danger', timeout: 10000 });
            allGoodFlagTime = false;
          } else {
            hourToEnter = startTimeMilitary + ':' + this.enteredMinutes;
            hourToExit = endingTimeMilitary + ':' + this.exitMinutes;
            allGoodFlagTime = true;
          }
        }
        // Este if es para evaluar cuando la hora es la misma y la diferencia son los minutos.
      } else if (militaryTimeDiff === 0) {
        diffMinutes = (+this.enteredMinutes) - (+this.exitMinutes);
        if (diffMinutes < 0) {
          hourToEnter = startTimeMilitary + ':' + this.enteredMinutes;
          hourToExit = endingTimeMilitary + ':' + this.exitMinutes;
          allGoodFlagTime = true;
        } else {
          this.flashMessage.show('😑  Por favor elige un tiempo de reseva valido', { cssClass: 'alert-danger', timeout: 5000 });
          allGoodFlagTime = false;
        }
      } else {
        this.flashMessage.show('La hora entrada no cumple con el limite de dos horas', { cssClass: 'alert-danger', timeout: 5000 });
      }

      if (allGoodFlagID === true && allGoodFlagQuantity === true && allGoodFlagTime === true && allGoodFlagHourLimit === true) {
        const reservation = {
          'name': this.name,
          'id': this.id,
          'departamento': this.department,
          'cantEstudiantes': this.quantityStudents,
          'numSalon': this.roomNumber,
          'horaEntrada': hourToEnter,
          'horaSalida': hourToExit,
          'fecha': this.resDate,
          'status': 'Confirmado',
          'style': 'btn btn-success',
          'piso': this.floorNumber
        };

        this.reservaService.addReserva(reservation)
          .subscribe(reserva => {
            if (reserva.error === true) {
              this.flashMessage.show('Lo sentimos, el salón este reservado a eso hora.', { cssClass: 'alert-danger' });
            } else if (reserva.error === false) {
              // this.reservations.push(reserva);
              this.flashMessage.show('Reserva Completada 🎉', { cssClass: 'alert-success' });
            }
          });
        // this.router.navigate(['confirmar-reserva']);
      }
    }
  }

  changeToMilitary(recivedHour) {
    let militaryTime: string;

    switch (recivedHour) {
      case '12 AM':
        militaryTime = '00';
        break;

      case '1 AM':
        militaryTime = '01';
        break;

      case '2 AM':
        militaryTime = '02';
        break;

      case '3 AM':
        militaryTime = '03';
        break;

      case '4 AM':
        militaryTime = '04';
        break;

      case '5 AM':
        militaryTime = '05';
        break;

      case '6 AM':
        militaryTime = '06';
        break;

      case '7 AM':
        militaryTime = '07';
        break;

      case '8 AM':
        militaryTime = '08';
        break;

      case '9 AM':
        militaryTime = '09';
        break;

      case '10 AM':
        militaryTime = '10';
        break;

      case '11 AM':
        militaryTime = '11';
        break;

      case '12 PM':
        militaryTime = '12';
        break;

      case '1 PM':
        militaryTime = '13';
        break;

      case '2 PM':
        militaryTime = '14';
        break;

      case '3 PM':
        militaryTime = '15';
        break;

      case '4 PM':
        militaryTime = '16';
        break;

      case '5 PM':
        militaryTime = '17';
        break;

      case '6 PM':
        militaryTime = '18';
        break;

      case '7 PM':
        militaryTime = '19';
        break;

      case '8 PM':
        militaryTime = '20';
        break;

      case '9 PM':
        militaryTime = '21';
        break;

      case '10 PM':
        militaryTime = '22';
        break;

      case '11 PM':
        militaryTime = '23';
        break;
    }
    return militaryTime;
  }

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
