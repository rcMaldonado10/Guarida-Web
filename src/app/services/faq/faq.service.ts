import { Injectable } from '@angular/core';
import { Http, Headers } from '@angular/http';
import { url } from '../../../url';
import 'rxjs/add/operator/map';

@Injectable()
export class FaqService {

  constructor(private http: Http) { }

  getFaq() {
    const headers = new Headers();
     return this.http.get(url + '/faq')
      .map(res => res.json());
  }
}
