import { ApplicationConfig, importProvidersFrom, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';
import { ToastrModule } from 'ngx-toastr';
import { BrowserAnimationsModule, provideAnimations} from '@angular/platform-browser/animations';
import { routes } from './app.routes';
import { provideHttpClient } from '@angular/common/http';
import { BrowserModule } from '@angular/platform-browser';


export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }), 
    provideRouter(routes),
    provideAnimations(),
    provideHttpClient(),
    importProvidersFrom(
      BrowserModule,
      BrowserAnimationsModule, 
      ToastrModule.forRoot({
        positionClass: 'toast-top-right',
        toastClass: 'ngx-toastr my-toast',
        timeOut: 3000,
        progressBar: true
     })
    )
  ]
};