import { Component, EventEmitter, Input, Output, ViewEncapsulation } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-scheme-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './scheme-modal.component.html',
  styleUrls: ['./scheme-modal.component.css'],
  encapsulation: ViewEncapsulation.None 
})
export class SchemeModalComponent {
  @Input() scheme: any = null;
  @Input() isViewOnly: boolean = false;

  @Output() save = new EventEmitter<any>();
  @Output() close = new EventEmitter<void>();

  onSave() {
    if (!this.isViewOnly && this.scheme) {
      this.save.emit(this.scheme);
    }
  }

  onClose() {
    this.close.emit();
  }
}