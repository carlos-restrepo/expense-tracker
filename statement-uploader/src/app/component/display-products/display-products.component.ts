import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { KatexModule } from 'ng-katex';

@Component({
  selector: 'app-display-products',
  standalone: true,
  imports: [
    CommonModule,
  ],
  templateUrl: './display-products.component.html',
  styleUrl: './display-products.component.css'
})
export class DisplayProductsComponent {

  list: number[] = [1,1,1,1,1,1,1,1,1,1,11,1,1,1,1,1,1,1,1];

}
