import { bootstrapApplication, BrowserModule } from '@angular/platform-browser';
import { AppComponent } from './app/app.component';
import { routes } from './app/app.routes';
import { provideRouter } from '@angular/router';

import { provideHttpClient, withInterceptorsFromDi, HTTP_INTERCEPTORS } from '@angular/common/http'; 
import { ToastrModule } from 'ngx-toastr';
import { importProvidersFrom } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { BrowserAnimationsModule, provideAnimations } from '@angular/platform-browser/animations';
import { AuthInterceptor } from './app/service/auth.interceptor'; 

bootstrapApplication(AppComponent, {
  providers: [
    provideRouter(routes),
    
    provideHttpClient(withInterceptorsFromDi()), 
    
    provideAnimations(), 
    importProvidersFrom(
      BrowserModule,
      FormsModule,
      BrowserAnimationsModule,
      ToastrModule.forRoot({
        positionClass: 'toast-top-right',
        toastClass: 'ngx-toastr my-toast',
        timeOut: 3000,
        progressBar: true
      })
    ),

    { 
      provide: HTTP_INTERCEPTORS, 
      useClass: AuthInterceptor, 
      multi: true 
    }
  ]
}).catch(err => console.error(err));
