import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { KatexModule } from 'ng-katex';
import { MarkdownModule } from 'ngx-markdown';

@Component({
  selector: 'app-display-products',
  standalone: true,
  imports: [
    CommonModule,
    MarkdownModule,
  ],
  templateUrl: './display-products.component.html',
  styleUrl: './display-products.component.css'
})
export class DisplayProductsComponent {

  testLatex: string = "\\\(test + \\\)"

}
