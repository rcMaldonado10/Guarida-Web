// import de librerias
import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpModule } from '@angular/http';
import { RouterModule } from '@angular/router';
import { FlashMessagesModule } from 'angular2-flash-messages';

// import de componentes
import { AppComponent } from './app.component';
import { LogInComponent } from './log-in/log-in.component';
import { PrimerPisoComponent } from './primer-piso/primer-piso.component';
import { CrearReservaComponent } from './crear-reserva/crear-reserva.component';
import { DisponibleComponent } from './disponible/disponible.component';
import { RegisterAdminComponent } from './register-admin/register-admin.component';
import { AboutUsComponent } from './about-us/about-us.component';

// import de los Pipes
import { FilterIDPipe } from './filter-id.pipe';

// import del los services
import { ValidateService } from './services/validate/validate.service';
import { AuthService } from './services/auth/auth.service';
import { FaqService } from './services/faq/faq.service';

import { AuthGuard } from './guards/auth.guard';

@NgModule({
  declarations: [
    AppComponent,
    LogInComponent,
    PrimerPisoComponent,
    CrearReservaComponent,
    DisponibleComponent,
    FilterIDPipe,
    RegisterAdminComponent,
    AboutUsComponent,
  ],
  imports: [
    BrowserModule,
    FormsModule,
    HttpModule,
    FlashMessagesModule,
    RouterModule.forRoot([
      {path: '', component: LogInComponent},
      //{path: 'confirmar-reserva', component: PrimerPisoComponent, canActivate: [AuthGuard]},
      { path: 'confirmar-reserva', component: PrimerPisoComponent },
      //{ path: 'crear-reserva', component: CrearReservaComponent, canActivate: [AuthGuard]},
      { path: 'crear-reserva', component: CrearReservaComponent},
      //{ path: 'disponible', component: DisponibleComponent, canActivate: [AuthGuard]},
      { path: 'disponible', component: DisponibleComponent},
      //{ path: 'registrar-admin', component: RegisterAdminComponent, canActivate: [AuthGuard]},
        { path: 'registrar-admin', component: RegisterAdminComponent },
      //{ path: 'about-us', component: AboutUsComponent, canActivate: [AuthGuard]}
      { path: 'about-us', component: AboutUsComponent}
    ])
  ],
  providers: [ValidateService, AuthService, AuthGuard, FaqService],
  bootstrap: [AppComponent]
})
export class AppModule { }
