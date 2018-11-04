import { Component, OnInit } from '@angular/core';
import { ReservasService } from '../services/reservas/reservas.service';
import { Reservas } from '../../Reservas';
import { AuthService } from '../services/auth/auth.service';
import { log } from 'util';

@Component({
  selector: 'app-disponible',
  templateUrl: './disponible.component.html',
  styleUrls: ['./disponible.component.css'],
  providers: [ReservasService]
})
export class DisponibleComponent implements OnInit {

  reservas: Reservas[];
  available: Object[] = [];
  dateDesired;

  private date; // su valor es la fecha de la computadora
  private day; // el dia que tenga la computadora
  private month; // el mes que tenga la computadora
  public year; // el año que tenga la computadora

  admin = JSON.parse(localStorage.getItem('admin'));

  constructor(private reservasService: ReservasService, private authService: AuthService) {
    this.day = (new Date().getDate()).toString(); // Verifica la fecha que de el dia correcto el 4 de diciembre dio el 5.
    this.month = (+(new Date().getMonth().toString()) + 1).toString();
    if ((+(this.month) < 10) || (+(this.day) < 10)) {
      this.day = this.modifiedDayMonth(this.day);
      this.month = this.modifiedDayMonth(this.month);
    }
    this.year = new Date().getFullYear().toString();
    this.date = (this.year + '-' + this.month + '-' + this.day).toString();

    this.dateDesired = this.date;
    /* recibo las reservas para buscar a que horas hay reserva y a
      partir de hay busco las horas en la que no hay reserva */
    this.reservasService.getReservationsByDate(this.dateDesired).subscribe(reservas => {
      this.reservas = reservas;
    });
  }

  ngOnInit() {
  }

  // La funcion search() esta hecha para buscar los espacios disponibles en una reserva
  // que este hecha, esta compara la hora de salida de una y la hora de entrada de la
  // otra para ver si hay una diferencia, ya que si la hay entonces hay un espacio
  // disponible en estas reservas. De no haber una reserva entonces indica que esta
  // disponible desde el "startingLimit" y el "endingLimit".

  search() {
    let resHour; // Toma la primera reserva que hay en la coleccion de reserva
    let nextResHour; // Toma la proxima reserva de la coleccion
    let floor = '1'; // Indica el piso en el que estamos
    let room = this.getFloorAndRoom(floor); // Devuelve cuantos salones hay dependiendo de el piso
    let roomRes; // Recibe un arreglo en donde el piso, el salon y la fecha de reservas es el mismo
    let flag = -2; /* Determina cuantas veces el loop Megalodon va a correr debido a que hay 3 pisos. El loop va a correr 3 veces ya que
                  termina cuando llegue a cero.*/
    let floorAndRoom;
    let nextFloorAndRoom;
    let primerDigito; // obtiene el primer digito de la primera reserva en el arreglo
    let segundoDigito; // obtiene el segundo digito de la primer reserva en el arreglo
    let primerDigitoEntrada; // obtiene el primer digito de la hora de entrada de una reserva en un salon
    let segundoDigitoEntrada; // obtiene el segundo digi de la hora de entrada de una reserva
    let nextPrimerDigito; // obtiene el primer digito de la segunda reserva en el arreglo
    let nextSegundoDigito; // obtiene el segundo digito de la segunda reserva en el arreglo
    let nextPrimerDigitoSalida; // obtiene el primer digito de la hora de entrada de una reserva
    let nextSegundoDigitoSalida; // obtiene el segundo digito de la hora de entrada de una reserva
    let diff; // Diferencia de las reservas, si hay diferencia entonces hay un tiempo disponible
    let tercerDigito; // obtiene el tercer digito de la primera reserva en el arreglo
    let cuartoDigito; // obtiene el cuarto digito de la primera reserva en el arreglo
    let tercerDigitoEntrada; // obtiene el tercer digito de una hora de entrada
    let cuartoDigitoEntrada; // ontiene el cuarto digito de una hora de entrada
    let nextTercerDigito; // obtiene el tercer digito de la segunda reserva en el arreglo
    let nextCuartoDigito; // obtiene el cuarto digito de la segunda reserva en el arreglo
    let nextTercerDigitoSalida; // obtiene el tercer digito de la hora de una reserva
    let nextCuartoDigitoSalida; // obtiene el cuarto digito de la hora de una reserva
    let minutosInicial; // junto tercerDigito y cuartoDigito para tener los minutos de la primera reserva
    let minutosFinal; // junto nextTercerDigito y nextCuartoDigito para tener los minutos de la proxima reserva
    let minutoStr; // se cambia los valores de los minutos de la primera reserva del arreglo
    let minutoFinalStr; // se cambia los valores de los minutos de la segunda reserva del arreglo
    let timeInterval; // Obtiene el intervalo de tiempo en que un salon se puede reservar
    let timeIntervalInical; /* Obtiene la hora despues de calcular los minutos iniciales. Tambien muestra la primera hora que se presenta
                              en los intervalos de tiempo de disponiblidad*/
    let timeIntervalFinal; // Obtiene la hora final cuando los mintuos execeden de 60 y debe hacer el arreglo para que se vea bien
    let lastRoomReservation; // se le asigna el valor de la ultima reservacion de un salon en especifico
    let hourStr; // Le quita uno a la hora para asegurar que presenta la hora correcta
    const startingLimit = '8:00'; // Limite en donde empiezan las reservas
    const endingLimit = '21:00'; // Limite en donde terminan las reservas
    let startFlag = true;
    // let endFlag = true;
    // debugger;
    /* Esto es utilizado para ver que si hay data en el arreglo,
    se elimina para hacer espacio para data nueva */
    if (this.available !== undefined) {
      this.available.splice(0);
    }
    // debugger;
    for (let j = 0; j < room.length; j++) {
      roomRes = this.sortByRoom(room[j], floor);
      console.log("rommRes[j]: " + roomRes[j]);
      console.log("rommRes[0]: " +roomRes[0]);
      console.log("rommRes[1]: " +roomRes[1]);
      console.log("rommRes[2]: " +roomRes[2]);
      // console.log("roomRes[j].numSalon + roomRes[j].piso: " + roomRes[j].numSalon + roomRes[j].piso);
      // console.log("roomRes[0].numSalon + roomRes[0].piso: " + roomRes[0].numSalon + roomRes[0].piso);
      // console.log("roomRes[j].length: " + roomRes[j].length);
      // console.log("roomRes[0].length: " + roomRes[0].length);
      // console.log("roomRes[1].length: " + roomRes[1].length);
      // console.log("roomRes.length: " + roomRes.length);
      // Hacer
      if (roomRes[0] === undefined) {
        // console.log("nada");
        this.available.push({
          'piso': floor,
          'salon': room[j],
          'content': this.getContentByFloorAndRoom(floor, room[j]),
          'timeAvailable': startingLimit + ' - ' + endingLimit,
          'status': 'Crear'
        });
        console.log(this.dateDesired);
      }

//////////////////////////////////////////////
      if (roomRes.length === 1)
      {
        let timeIntervalRes; //para poner los datos de esta parte 
        primerDigitoEntrada = roomRes[0].horaEntrada.charAt(0) + roomRes[0].horaEntrada.charAt(1); // Tomo el primer y el segundo digito de la hora de entrada
        segundoDigitoEntrada = roomRes[0].horaEntrada.charAt(3) + roomRes[0].horaEntrada.charAt(4); // Tomo el tercero y el cuarto digito de la hora de entrada
        let primerDigitoSalida = roomRes[0].horaSalida.charAt(0) + roomRes[0].horaSalida.charAt(1); // Tomo el primer y el segundo digito de la hora de Salida
        let segundoDigitoSalida = roomRes[0].horaSalida.charAt(3) + roomRes[0].horaSalida.charAt(4); // Tomo el tercero y el cuarto digito de la hora de Salida
        lastRoomReservation = primerDigitoSalida + ":" + segundoDigitoSalida;
        console.log(" lastRoomReservation: " + lastRoomReservation);
        console.log("Entro a mi funcion LOLOLOL");
        console.log(primerDigitoEntrada + " : " + segundoDigitoEntrada);
        if(primerDigitoEntrada <= '08' && segundoDigitoEntrada === '00' )
        {
          lastRoomReservation = primerDigitoSalida + ":" + segundoDigitoSalida;
          this.available.push({
            'piso': roomRes[0].piso,
            'salon': roomRes[0].numSalon,
            'content': this.getContentByFloorAndRoom(roomRes[0].piso, roomRes[0].numSalon),
            'timeAvailable': (lastRoomReservation + ' - ' + '21:00'),
            'status': 'Crear'
          });
        }
        else if (primerDigitoEntrada >= '08' && segundoDigitoEntrada >= '00' && primerDigitoEntrada != '20')
        {
          let firstRoomReservation = primerDigitoEntrada + ":" + segundoDigitoEntrada;
          lastRoomReservation = primerDigitoSalida + ":" + segundoDigitoSalida;
          this.available.push({
            'piso': roomRes[0].piso,
            'salon': roomRes[0].numSalon,
            'content': this.getContentByFloorAndRoom(roomRes[0].piso, roomRes[0].numSalon),
            'timeAvailable': ('08:00 - '+ firstRoomReservation+ ' y de ' + lastRoomReservation + ' - 21:00'),
            'status': 'Crear'
          });
        }
        else if (primerDigitoSalida === '21')
        {
          lastRoomReservation = primerDigitoEntrada + ":" + segundoDigitoEntrada;
          this.available.push({
            'piso': roomRes[0].piso,
            'salon': roomRes[0].numSalon,
            'content': this.getContentByFloorAndRoom(roomRes[0].piso, roomRes[0].numSalon),
            'timeAvailable': ( '08:00' + ' - '  + lastRoomReservation),
            'status': 'Crear'
          });
        }

      }
/////////////////////////////////////////////////////////

      // Loop Llamado Megalodon. Aqui es donde esta la carne de como se logran las busquedas de las reservas
      // buscando por el piso y por el salon de cada reserva.
      for (let i = 0; i < roomRes.length - 1; i++) {
        // En estas dos lineas de codigo verifico que el piso y el salon de una reserva sea el mismo
        // para entonces tomar las reservas de eso salones
        floorAndRoom = roomRes[i].piso === floor && roomRes[i].numSalon === room[j];
        nextFloorAndRoom = roomRes[i + 1].piso === floor && roomRes[i + 1].numSalon === room[j];

        if (floorAndRoom) {
          primerDigito = roomRes[i].horaSalida.charAt(0); // Tomo el primer digito de la hora de salida
          segundoDigito = roomRes[i].horaSalida.charAt(1); // Tomo el segundo digito de la hora de salida

          primerDigitoEntrada = roomRes[i].horaEntrada.charAt(0); // Tomo el primer digito de la hora de entrada
          segundoDigitoEntrada = roomRes[i].horaEntrada.charAt(1); // Tomo el segundo digito de la hora de entrada
          tercerDigitoEntrada = roomRes[i].horaEntrada.charAt(3); // Tomo el tercer digito de la hora de entrada
          cuartoDigitoEntrada = roomRes[i].horaEntrada.charAt(4); // Tomo el cuarto digito de la hora de entrada
          // resHour toma la hora de salida de una reserva para entonces compararla
          // con la hora de la proxima reserva
          resHour = +(primerDigito + segundoDigito); // De string los convierto a number
        }

        if (nextFloorAndRoom) {
          nextPrimerDigito = roomRes[i + 1].horaEntrada.charAt(0);
          nextSegundoDigito = roomRes[i + 1].horaEntrada.charAt(1);
          nextResHour = +(nextPrimerDigito + nextSegundoDigito); // De string los convierto a number
          console.log(nextResHour);

          nextPrimerDigitoSalida = roomRes[i + 1].horaSalida.charAt(0);
          nextSegundoDigitoSalida = roomRes[i + 1].horaSalida.charAt(1);
          nextTercerDigitoSalida = roomRes[i + 1].horaSalida.charAt(3);
          nextCuartoDigitoSalida = roomRes[i + 1].horaSalida.charAt(4);
        }

        if (floorAndRoom === true && nextFloorAndRoom === true) {
          diff = resHour - nextResHour;
          console.log(resHour + 'resHour');
          console.log(nextResHour + 'nextResHour');
          console.log(diff + 'diff');
          if (diff < 0) {
            tercerDigito = roomRes[i].horaSalida.charAt(3); // Primer minuto de la hora de salida de la reserva
            cuartoDigito = roomRes[i].horaSalida.charAt(4); // Segundo minuto de la hora de salida de la reserva

            nextTercerDigito = roomRes[i + 1].horaEntrada.charAt(3); // Primer minuto de la hora de entrada de la proxima reserva
            nextCuartoDigito = roomRes[i + 1].horaEntrada.charAt(4); // Segundo minuto de la hora de entrada de la proxima reserva

            minutosInicial = (+(tercerDigito + cuartoDigito));
            minutosFinal = (+(nextTercerDigito + nextCuartoDigito));
            // debugger;
            console.log(minutosInicial);
            let oklol = +(primerDigitoEntrada + segundoDigitoEntrada);
            console.log("Yatio +(primerDigitoEntrada + segundoDigitoEntrada): " + oklol);
            if (+(primerDigitoEntrada + segundoDigitoEntrada) > 8) {
              if (startFlag === true) {
                timeIntervalInical = primerDigitoEntrada + segundoDigitoEntrada + ':' + tercerDigitoEntrada + cuartoDigitoEntrada;
                this.available.push({
                  'piso': roomRes[i].piso,
                  'salon': roomRes[i].numSalon,
                  'content': this.getContentByFloorAndRoom(roomRes[i].piso, roomRes[i].numSalon),
                  'timeAvailable': ('08:00' + '-' + timeIntervalInical),
                  'status': 'Crear'
                });
                startFlag = false;
              }
            } else if (+(primerDigitoEntrada + segundoDigitoEntrada) === 8 && (+(tercerDigitoEntrada + cuartoDigitoEntrada) >= 15)) {
              if (startFlag === true) {
                timeIntervalInical = primerDigitoEntrada + segundoDigitoEntrada + ':' + tercerDigitoEntrada + cuartoDigitoEntrada;
                this.available.push({
                  'piso': roomRes[i].piso,
                  'salon': roomRes[i].numSalon,
                  'content': this.getContentByFloorAndRoom(roomRes[i].piso, roomRes[i].numSalon),
                  'timeAvailable': ('08:00' + '-' + timeIntervalInical),
                  'status': 'Crear'
                });
                startFlag = false;
              }
            }
          }
          // if se encarga de que si los minutos de una reserva es 0 lo cambia a string y lo pone 00 para que se vea como numero de hora
          if (minutosFinal === 0) {
            minutoFinalStr = this.setMinutes(minutosFinal);
            hourStr = +(nextPrimerDigito + nextSegundoDigito);
            timeIntervalFinal = hourStr + ':' + minutoFinalStr;
          } else {
            timeIntervalFinal = nextPrimerDigito + nextSegundoDigito + ':' + minutosFinal;
          }

          if (+(timeIntervalFinal.charAt(0) + timeIntervalFinal.charAt(1)) !== 21) {
            timeIntervalInical = primerDigito + segundoDigito + ':' + tercerDigito + cuartoDigito;
            this.available.push({
              'piso': roomRes[i].piso,
              'salon': roomRes[i].numSalon,
              'content': this.getContentByFloorAndRoom(roomRes[i].piso, roomRes[i].numSalon),
              'timeAvailable': (timeIntervalInical + '-' + timeIntervalFinal),
              'status': 'Crear'
            });
          }
          console.log(+(timeIntervalFinal.charAt(0) + timeIntervalFinal.charAt(1)));
          console.log(+(timeIntervalFinal.charAt(3) + timeIntervalFinal.charAt(4)));
          console.log(this.available);
        } else { // Este else evaula disponibilidad cuando la diferencia de hora (diff) es igual a cero.
          // console.log(diff + "hola");
          tercerDigito = roomRes[i].horaSalida.charAt(3); // Primer minuto de la hora de salida de la reserva
          cuartoDigito = roomRes[i].horaSalida.charAt(4); // Segundo minuto de la hora de salida de la reserva

          nextTercerDigito = roomRes[i + 1].horaEntrada.charAt(3); // Primer minuto de la hora de entrada de la proxima reserva
          nextCuartoDigito = roomRes[i + 1].horaEntrada.charAt(4); // Segundo minuto de la hora de entrada de la proxima reserva
          console.log(nextTercerDigito + nextCuartoDigito);

          minutosInicial = (+(tercerDigito + cuartoDigito));
          minutosFinal = (+(nextTercerDigito + nextCuartoDigito));
          console.log(minutosFinal);
          if (minutosInicial < 10 && minutosFinal < 10) {
            minutoStr = this.setMinutes(minutosInicial);
            minutoFinalStr = this.setMinutes(minutosFinal);
            timeInterval = primerDigito + segundoDigito + ':' + minutoStr + ' - ' +
              nextPrimerDigito + nextSegundoDigito + ':' + minutoFinalStr;
            console.log(timeInterval);
          } else if (minutosInicial < 10) {
            minutoStr = this.setMinutes(minutosInicial);
            timeInterval = primerDigito + segundoDigito + ':' + minutoStr + ' - ' +
              nextPrimerDigito + nextSegundoDigito + ':' + minutosFinal;
            console.log(timeInterval);
          } else if (minutosFinal < 10) {
            minutoFinalStr = this.setMinutes(minutosFinal);
            timeInterval = primerDigito + segundoDigito + ':' + minutosInicial + ' - ' +
              nextPrimerDigito + nextSegundoDigito + ':' + minutoFinalStr;
          } else {
            timeInterval = primerDigito + segundoDigito + ':' + minutosInicial + ' - ' +
              nextPrimerDigito + nextSegundoDigito + ':' + minutosFinal;
          }
          this.available.push({
            'piso': roomRes[i].piso,
            'salon': roomRes[i].numSalon,
            'content': this.getContentByFloorAndRoom(roomRes[i].piso, roomRes[i].numSalon),
            'timeAvailable': timeInterval,
            'status': 'Crear'
          });
          console.log(timeInterval);
        }
        console.log(i + 'vs.' + roomRes.length);
        console.log(i === roomRes.length - 2);
        if (i === roomRes.length - 2) {
          lastRoomReservation = nextPrimerDigitoSalida + nextSegundoDigitoSalida + ':'
            + nextTercerDigitoSalida + nextCuartoDigitoSalida;
            if (+(lastRoomReservation.charAt(0) + lastRoomReservation.charAt(1)) !== 21) {
              this.available.push({
                'piso': roomRes[i].piso,
                'salon': roomRes[i].numSalon,
                'content': this.getContentByFloorAndRoom(roomRes[i].piso, roomRes[i].numSalon),
                'timeAvailable': (lastRoomReservation + ' - ' + '21:00'),
                'status': 'Crear'
              });
            }
          startFlag = true;
        }
        
      }
      // de aqui de saca si es solo una reserva en el piso
      // Este if se utiliza para cambiar de piso y buscar por los salones de ese otro piso
      if (j === room.length - 1) {
        if (floor === '1') {
          floor = '2';
        } else if (floor === '2') {
          floor = '3';
        }
        room = this.getFloorAndRoom(floor);
        if (flag !== 0) {
          j = -1; // Para que cuando vuelva al for j sea igual a cero
          flag++;
        }
      }
    }
  }

  // Esta funcion recibe el piso en el que se este buscando reservas
  // y devuelve la cantidad de salones de estudio que hay en ese piso
  getFloorAndRoom(floor: string) {
    const floorAndRoom: any = {
      floor1: ['1', '2', '3', '4', '5', '6'],
      floor2: ['1', '2', '3', '4', '5', '6', '7'],
      floor3: ['1', '2', '3']
    };

    if (floor === '1') {
      return floorAndRoom.floor1;
    } else if (floor === '2') {
      return floorAndRoom.floor2;
    } else {
      return floorAndRoom.floor3;
    }
  }

  /* Funcion que tiene el contenido de cada salon de estudio.
     floor == 1 es el piso 1 de la biblioteca
     floor == 2 es el piso 2 de la biblioteca
     floor == 3 es el Learning Commons
  */
 getContentByFloorAndRoom(floor, room) {
  let content: any;

  if (floor === '1') {
    if (room === '1') {
      content = {
        capacity: '5',
        board: 'Sí',
        ethernet: 'Sí',
        electricity: 'Sí',
        television: 'Sí'
      };
    } else if (room === '2') {
      content = {
        capacity: '4',
        board: 'Sí',
        ethernet: 'Sí',
        electricity: 'Sí',
        television: 'Sí'
      };
    } else if (room === '3') {
      content = {
        number: '3',
        capacity: '4',
        board: 'No',
        ethernet: 'No',
        electricity: 'Sí',
        television: 'Sí'
      };
    } else if (room === '4') {
      content = {
        number: '4',
        capacity: '4',
        board: 'Sí',
        ethernet: 'No',
        electricity: 'Sí',
        television: 'No'
      };
    } else if (room === '5') {
      content = {
        capacity: '6',
        board: 'No',
        ethernet: 'No',
        electricity: 'No',
        television: 'No'
      };
    } else {
      content = {
        number: '6',
        capacity: '4',
        board: 'Sí',
        ethernet: 'No',
        electricity: 'Sí',
        television: 'No'
      };
    } 
  } else if (floor === '2') {
    if (room === '1') {
      content = {
        capacity: '8',
        board: 'No',
        ethernet: 'No',
        electricity: 'Sí',
        television: 'No'
      };
    } else if (room === '2') {
      content = {
        number: '2',
        capacity: '4',
        board: 'No',
        ethernet: 'No',
        electricity: 'Sí',
        television: 'No'
      };
    } else if (room === '3') {
      content = {
        number: '3',
        capacity: '4',
        board: 'No',
        ethernet: 'Sí',
        electricity: 'Sí',
        television: 'No'
      };
    } else if (room === '4') {
      content = {
        number: '4',
        capacity: '8',
        board: 'No',
        ethernet: 'Sí',
        electricity: 'Sí',
        television: 'No'
      };
    } else if (room === '5') {
      content = {
        number: '5',
        capacity: '8',
        board: 'Sí',
        ethernet: 'Sí',
        electricity: 'Sí',
        television: 'No'
      };
    } else if (room === '6'){
      content = {
        number: '6',
        capacity: '10',
        board: 'No',
        ethernet: 'Sí',
        electricity: 'Sí',
        television: 'No'
      };
    } else {
      content = {
        number: '7',
        capacity: '5',
        board: 'Sí',
        ethernet: 'Sí',
        electricity: 'Sí',
        television: 'No'
      }; 
  }
  } else {
    if (room === '1') {
      content = {
        number: '1',
        capacity: '5',
        board: 'Sí',
        ethernet: 'Sí',
        electricity: 'Sí',
        television: 'Sí'
      };
    } else if (room === '2') {
      content = {
        number: '2',
        capacity: '4',
        board: 'No',
        ethernet: 'No',
        electricity: 'Sí',
        television: 'Sí'
      };
    } else {
      content = {
        number: '3',
        capacity: '4',
        board: 'No',
        ethernet: 'No',
        electricity: 'Sí',
        television: 'Sí'
      };
    } 
  }
  return content;
}

  // Esta funcion recibe el arreglo de reservas y crea un arreglo
  // en donde estan las reservas de un salon en especifico. Luego
  // organiza las reservas por la hora, es decir, de reservas que son
  // en la mañana hasta por la noche
  sortByRoom(room: string, floor: string) {
    const resByRoom: any[] = [];
    let firstResHour: number; // Recive la hora de la reserva en el arreglo
    let nextFirstResHour: number; // Recive la hora de la siguiente reserva
    let minutesRes: number; // Los minutos de la primera reserva
    let nextMinutesRes: number; // los minutos de la segunda reserva
    let diffHours: number;
    let diffMinutes: number;
    console.log("this.reservas.length: " + this.reservas.length);
    for (let i = 0; i < this.reservas.length; i++) {
      if (this.reservas[i].numSalon === room && this.reservas[i].piso === floor && this.reservas[i].fecha === this.dateDesired) {
        resByRoom.push(this.reservas[i]);
      }
    }
    // Entra a este if si el arreglo resByRoom tiene reserva, de lo contrario lo sigue
    if (resByRoom !== []) {
      while (true) {
        let swapped = false;
        for (let j = 0; j < resByRoom.length - 1; j++) {
          firstResHour = +(resByRoom[j].horaSalida.charAt(0) + resByRoom[j].horaSalida.charAt(1));
          nextFirstResHour = +(resByRoom[j + 1].horaEntrada.charAt(0) + resByRoom[j + 1].horaEntrada.charAt(1));
          diffHours = firstResHour - nextFirstResHour;
          if (diffHours > 0) {
            [resByRoom[j], resByRoom[j + 1]] = [resByRoom[j + 1], resByRoom[j]];
            swapped = true;
          } else if (diffHours === 0) {
            minutesRes = +(resByRoom[j].horaSalida.charAt(3) + resByRoom[j].horaSalida.charAt(4));
            nextMinutesRes = +(resByRoom[j + 1].horaEntrada.charAt(3) + resByRoom[j + 1].horaEntrada.charAt(4));
            diffMinutes = minutesRes - nextMinutesRes;
            console.log(diffMinutes + 'minutos');
            if (diffMinutes > 0) {
              [resByRoom[j], resByRoom[j + 1]] = [resByRoom[j + 1], resByRoom[j]];
              swapped = true;
            }
          }
        }
        if (!swapped) {
          break;
        }
      }
    }
    return resByRoom;
  }
  // Funcion modifica los minutos que sean de 0 a 9 un string y el string es el numero de dos digitos para que se vea
  // como que es parte de la hora que se presenta
  setMinutes(minutoStr) {
    let minuto;
    switch (minutoStr) {
      case 0: {
        minuto = '00';
        break;
      }
      case 1: {
        minuto = '01';
        break;
      }
      case 2: {
        minuto = '02';
        break;
      }
      case 3: {
        minuto = '03';
        break;
      }
      case 4: {
        minuto = '04';
        break;
      }
      case 5: {
        minuto = '05';
        break;
      }
      case 6: {
        minuto = '06';
        break;
      }
      case 7: {
        minuto = '07';
        break;
      }
      case 8: {
        minuto = '08';
        break;
      }
      case 9: {
        minuto = '09';
        break;
      }
    }
    return minuto;
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
