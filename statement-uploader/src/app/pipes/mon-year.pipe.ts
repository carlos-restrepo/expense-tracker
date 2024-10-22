import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'monYear',
  standalone: true
})
export class MonYearPipe implements PipeTransform {

  transform(value: string): string {
    if (!value) return ''; // Handle empty or invalid values

    // Create a Date object by adding "-01" for the day
    const date = new Date(`${value}-03`);

    // Format the date into "Month Year"
    return date.toLocaleString('default', { month: 'long', year: 'numeric' });
  }

}
