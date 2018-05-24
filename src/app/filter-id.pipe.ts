import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'filterID'
})
export class FilterIDPipe implements PipeTransform {

  transform(filteredReservations: any, term: any): any {
    // Check if search term is undefined
    if (term === undefined) {
      return filteredReservations;
    }

    // return updated array of the reservations
    return filteredReservations.filter(function(filteredReservation){
        return filteredReservation.id.includes(term);
    });
  }
}
