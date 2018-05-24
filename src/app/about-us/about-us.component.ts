import { Component, OnInit } from '@angular/core';
import { AuthService } from '../services/auth/auth.service';
import { FaqService } from '../services/faq/faq.service';
import { Faq } from '../../faq';

@Component({
  selector: 'app-about-us',
  templateUrl: './about-us.component.html',
  styleUrls: ['./about-us.component.css']
})
export class AboutUsComponent implements OnInit {

  public year: String;
  private admin;
  private isLoggedIn: Boolean;
  private faq: Faq[];

  constructor(private authService: AuthService, private faqService: FaqService) {
    this.year = new Date().getFullYear().toString();
    // this.admin = JSON.parse(localStorage.getItem('admin'));

    // if (this.admin.name === undefined) {
    //   this.isLoggedIn = false;
    // } else {
    //   this.isLoggedIn = true;
    // }

    faqService.getFaq().subscribe( data => {
      this.faq = data;
      console.log(this.faq);
    });
  }

  ngOnInit() {
  }

  onLogout() {
    this.authService.logout();
  }

}
