import { Injectable } from '@angular/core';

@Injectable()
export class ValidateService {

  constructor() { }

  validateAdmin(admin, confirmPassword) {
    if (admin.name === undefined || admin.username === undefined || admin.adminLevel === undefined || admin.password === undefined
      || confirmPassword === undefined) {
      return false;
    } else {
      return true;
    }
  }
}
