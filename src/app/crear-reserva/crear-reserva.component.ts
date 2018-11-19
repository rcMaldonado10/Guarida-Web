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

  public reservas: Reservas[]; // arreglo que recibe la informacion de la base de datos
  private separatedReservations: Reservas[]; // arreglo que obtiene las reservas separadas por un piso y salon especifico
  private orderedReservations: Reservas[]; // arreglo que tiene las reservas ordenado por piso y salón
  private acumulateReservation: Reservas[]; // Acumula las reservas de organizadas

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

    this.reservaService.getReservationsByDate(this.date).subscribe(reservas => {

      // Coge las reservas para que sean organizadas por hora
      // this.getAllReservations(reservas);
      this.reservas = this.getAllReservations(reservas);

      // Si no existen reservas se presenta un banner en donde se indicara
      if (this.reservas.length === undefined || this.reservas.length === 0) {
        flashMessage.show('No hay reservas creadas por el momento.', { cssClass: 'alert-warning' });
      }
    });
  }

  ngOnInit() {
  }
  checkRes(startTimeMilitary,endingTimeMilitary,allGoodFlagTime){
            //esto chequea que los datos nuevos no esten en los luhgares de otra reserva       Yatio
        // diffMinutes = (+this.enteredMinutes) - (+this.exitMinutes);
        allGoodFlagTime = true;
        if(this.reservas.length != 0 || this.reservas.length != undefined )
        {
          debugger;
          for (let i = 0; i < this.reservas.length; i++)
          {
            let entHoraDB = Number(this.reservas[i].horaEntrada.slice(0,-3));
            let entMinDB = Number(this.reservas[i].horaEntrada.slice(3));
            let salHoraDB = Number(this.reservas[i].horaSalida.slice(0,-3));
            let salMinDB = Number(this.reservas[i].horaSalida.slice(3));
            let entTimeDB = entHoraDB.toString() + entMinDB.toString();
            let salTimeDB = salHoraDB.toString() + salMinDB.toString();
            //quisas necesite el chequiar si el flag esta en false o no allGoodFlagTime = false; o hacer un flag uno mismo para propositos de esta parte
            for(let j = 0; entTimeDB != salTimeDB && this.reservas[i].piso === this.floorNumber && this.reservas[i].numSalon === this.roomNumber.toString(); j++)
            {
              let entHoraRes = Number(startTimeMilitary);
              let entMinRes = Number(this.enteredMinutes);
              let salHoraRes = Number(endingTimeMilitary);
              let salMinRes = Number(this.exitMinutes);
              let entTimeRes = entHoraRes.toString() + entMinRes.toString();
              let salTimeRes = salHoraRes.toString() + salMinRes.toString();
              for(let k = 0; entTimeRes != salTimeRes; k++)
              {
                if(entMinRes === 0)
                {
                  if(entHoraRes === entHoraDB && entMinRes === entMinDB)
                  {
                    allGoodFlagTime = false;
                    break;
                  }
                  entMinRes = 15;
                  entTimeRes = entHoraRes.toString() + entMinRes.toString();
                }else if(entMinRes === 15)
                {
                  if(entHoraRes === entHoraDB && entMinRes === entMinDB)
                  {
                    allGoodFlagTime = false;
                    break;
                  }
                  entMinRes = 30;
                  entTimeRes = entHoraRes.toString() + entMinRes.toString();
                }else if(entMinRes === 30)
                {
                  if(entHoraRes === entHoraDB && entMinRes === entMinDB)
                  {
                    allGoodFlagTime = false;
                    break;
                  }
                  entMinRes = 45;
                  entTimeRes = entHoraRes.toString() + entMinRes.toString();
                }else if(entMinRes === 45)
                {
                  if(entHoraRes === entHoraDB && entMinRes === entMinDB)
                  {
                    allGoodFlagTime = false;
                    break;
                  }
                  entMinRes = 0;
                  entHoraRes = entHoraRes + 1;
                  entTimeRes = entHoraRes.toString() + entMinRes.toString();
                }
              }
              
              //el otro batch de if's para cambiar la hora de la base de datos
              if(entMinDB === 0)
                {
                  if(entHoraRes === entHoraDB && entMinRes === entMinDB)
                  {
                    if(endingTimeMilitary === this.reservas[i].horaEntrada.slice(0,-3) && this.exitMinutes === this.reservas[i].horaEntrada.slice(3))
                    {
                      allGoodFlagTime = true;
                      break;
                    }
                    this.flashMessage.show('Lo sentimos, las horas seleccionadas conflige con otra reserva.', { cssClass: 'alert-danger' });
                    allGoodFlagTime = false;
                    break;
                    
                  }
                  entMinDB = 15;
                  entTimeDB = entHoraDB.toString() + entMinDB.toString();
                }else if(entMinDB === 15)
                {
                  if(entHoraRes === entHoraDB && entMinRes === entMinDB)
                  {
                    if(endingTimeMilitary === this.reservas[i].horaEntrada.slice(0,-3) && this.exitMinutes === this.reservas[i].horaEntrada.slice(3))
                    {
                      allGoodFlagTime = true;
                      break;
                    }
                    this.flashMessage.show('Lo sentimos, las horas seleccionadas conflige con otra reserva.', { cssClass: 'alert-danger' });
                    allGoodFlagTime = false;
                    break;
                    
                  }
                  entMinDB = 30;
                  entTimeDB = entHoraDB.toString() + entMinDB.toString();
                }else if(entMinDB === 30)
                {
                  if(entHoraRes === entHoraDB && entMinRes === entMinDB)
                  {
                    if(endingTimeMilitary === this.reservas[i].horaEntrada.slice(0,-3) && this.exitMinutes === this.reservas[i].horaEntrada.slice(3))
                    {
                      allGoodFlagTime = true;
                      break;
                    }
                    this.flashMessage.show('Lo sentimos, las horas seleccionadas conflige con otra reserva.', { cssClass: 'alert-danger' });
                    allGoodFlagTime = false;
                    break;
                    
                  }
                  entMinDB = 45;
                  entTimeDB = entHoraDB.toString() + entMinDB.toString();
                }else if(entMinDB === 45)
                {
                  if(entHoraRes === entHoraDB && entMinRes === entMinDB)
                  {
                    if(endingTimeMilitary === this.reservas[i].horaEntrada.slice(0,-3) && this.exitMinutes === this.reservas[i].horaEntrada.slice(3))
                    {
                      allGoodFlagTime = true;
                      break;
                    }
                    this.flashMessage.show('Lo sentimos, las horas seleccionadas conflige con otra reserva.', { cssClass: 'alert-danger' });
                    allGoodFlagTime = false;
                    break;
                    
                  }
                  entMinDB = 0;
                  entHoraDB = entHoraDB + 1;
                  entTimeDB = entHoraDB.toString() + entMinDB.toString();
                }
            }
          }
        }
        return allGoodFlagTime;
  }
  reservar() {
    let allGoodFlagID: boolean; // Flag to check if the ID is typed in the correct way
    let allGoodFlagQuantity: boolean; // Flag to check if the Quantity of students is typed is typed with numbers and no letters
    let allGoodFlagTime: boolean; // Flag to check if the reservation time is between the allowed hours
    let allGoodFlagHourLimit: boolean; // Flag to check if the reservation time doesn't exceed 2 hours
    let roomExists: boolean;
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
        this.flashMessage.show('La cantidad del numero de estudiantes es incorrecta', { cssClass: 'alert-danger', timeout: 5000 });
        allGoodFlagID = false;
      }
      if (isNaN(this.quantityStudents)) {
        this.flashMessage.show('La cantidad de estudiantes debe ser numerica', { cssClass: 'alert-danger', timeout: 5000 });
        allGoodFlagQuantity = false;
      } else {
        allGoodFlagQuantity = true;
      }

      if(this.floorNumber === '3' && this.roomNumber >= 6){
        roomExists= false;
        this.flashMessage.show('El salón seleccionado no puede ser reservado', {cssClass: 'alert-danger', timeout: 5000});
      } else {
        roomExists= true;
      }
      
     if((+startTimeMilitary) >= 8 && (+endingTimeMilitary) >=16 && this.floorNumber === '3')
      {
        allGoodFlagHourLimit = false;
          this.flashMessage.show('Los horarios de reserva del Learning Commons son de 8:00 AM - 4:00 PM', {cssClass: 'alert-danger', timeout: 5000});
      }
      else{
      if ((+startTimeMilitary) >= 8 && (+endingTimeMilitary) <= 21) {
        allGoodFlagHourLimit = true;
        if ((+endingTimeMilitary) === 21 && (+this.exitMinutes) > 0 ) {
          allGoodFlagHourLimit = false;
          this.flashMessage.show('Los horarios de reserva de la Biblioteca son de 8:00 AM - 9:00 PM', {cssClass: 'alert-danger', timeout: 5000});
        }
      } else {
        allGoodFlagHourLimit = false;
        this.flashMessage.show('Los horarios de reserva de la Biblioteca son de 8:00 AM - 9:00 PM', { cssClass: 'alert-danger', timeout: 5000 });
      }
      if (militaryTimeDiff <= 2 && militaryTimeDiff > 0) {
        hourToEnter = startTimeMilitary + ':' + this.enteredMinutes;
        hourToExit = endingTimeMilitary + ':' + this.exitMinutes;

        allGoodFlagTime = this.checkRes(startTimeMilitary,endingTimeMilitary,allGoodFlagTime);
        // Este if es para calcular los minutos cuando la diferencia de hora es dos.
        if (militaryTimeDiff === 2) {
          diffMinutes = (+this.exitMinutes) - (+this.enteredMinutes);
          if (diffMinutes > 0) {
            this.flashMessage.show('La reserva excede el limite de dos horas', { cssClass: 'alert-danger', timeout: 10000 });
            allGoodFlagTime = false;
          } else {
            hourToEnter = startTimeMilitary + ':' + this.enteredMinutes;
            hourToExit = endingTimeMilitary + ':' + this.exitMinutes;
            allGoodFlagTime = this.checkRes(startTimeMilitary,endingTimeMilitary,allGoodFlagTime);
          }
        }

        // Este if es para evaluar cuando la hora es la misma y la diferencia son los minutos.
      } else if (militaryTimeDiff === 0) {
        diffMinutes = (+this.enteredMinutes) - (+this.exitMinutes);
        if (diffMinutes < 0) {
          hourToEnter = startTimeMilitary + ':' + this.enteredMinutes;
          hourToExit = endingTimeMilitary + ':' + this.exitMinutes;
          allGoodFlagTime = this.checkRes(startTimeMilitary,endingTimeMilitary,allGoodFlagTime);
        } else {
          this.flashMessage.show('Por favor seleccione un tiempo de reseva valido 😑 ', { cssClass: 'alert-danger', timeout: 5000 });
          allGoodFlagTime = false;
        }
      } else {
        this.flashMessage.show('La hora de salida no cumple con el limite de dos horas', { cssClass: 'alert-danger', timeout: 5000 });
      }
    }
      if (allGoodFlagID === true && allGoodFlagQuantity === true && allGoodFlagTime === true && allGoodFlagHourLimit === true && roomExists === true) {
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
              this.flashMessage.show('Lo sentimos, el salón esta reservado a esa hora.', { cssClass: 'alert-danger' });
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
