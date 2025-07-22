import { Injectable, NgZone } from '@angular/core';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class InactivityService {
  private inactivityLogout$ = new Subject<void>();

  private timer: any;
  private lastActivity: number = Date.now();
  
  private readonly TIMEOUT_DURATION = 10 * 60 * 1000;

  constructor(
    private router: Router,
    private toastr: ToastrService,
    private ngZone: NgZone 
  ) {}


  startMonitoring() {
    console.log("Inactivity monitoring started.");
    this.ngZone.runOutsideAngular(() => {
      window.addEventListener('mousemove', this.resetTimer.bind(this));
      window.addEventListener('keypress', this.resetTimer.bind(this));
      window.addEventListener('click', this.resetTimer.bind(this));
      window.addEventListener('scroll', this.resetTimer.bind(this));
    });

    this.startTimer();
  }


  stopMonitoring() {
    console.log("Inactivity monitoring stopped.");
    window.removeEventListener('mousemove', this.resetTimer.bind(this));
    window.removeEventListener('keypress', this.resetTimer.bind(this));
    window.removeEventListener('click', this.resetTimer.bind(this));
    window.removeEventListener('scroll', this.resetTimer.bind(this));
    clearTimeout(this.timer);
  }


  getInactivityLogout() {
    return this.inactivityLogout$.asObservable();
  }

  private startTimer() {
    this.timer = setTimeout(() => {
      this.ngZone.run(() => {
        this.toastr.warning('You have been logged out due to inactivity.', 'Session Expired');
        this.inactivityLogout$.next(); 
      });
    }, this.TIMEOUT_DURATION);
  }

  private resetTimer() {
    clearTimeout(this.timer);
    this.ngZone.runOutsideAngular(() => {
      this.startTimer();
    });
  }
}