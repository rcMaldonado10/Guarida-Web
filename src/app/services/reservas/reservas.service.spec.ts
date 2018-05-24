/* tslint:disable:no-unused-variable */

import { TestBed, async, inject } from '@angular/core/testing';
import { ReservasService } from './reservas.service';

describe('ReservasService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [ReservasService]
    });
  });

  it('should ...', inject([ReservasService], (service: ReservasService) => {
    expect(service).toBeTruthy();
  }));
});
