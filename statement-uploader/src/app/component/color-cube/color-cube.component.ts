import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-color-cube',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule
  ],
  templateUrl: './color-cube.component.html',
  styleUrl: './color-cube.component.css'
})
export class ColorCubeComponent {
  twoFiftySix: Array<number> = Array(256);
  blueValue: number = 0;

  onBlueChange(eventTarget: any): void {
    
    var value = eventTarget.value;

    const blue = parseInt(value, 10);
    if (!isNaN(blue) && blue >= 0 && blue <= 255) {
      this.blueValue = blue;
    }
  }
}
