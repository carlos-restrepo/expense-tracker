import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'kpiColorPercent',
  standalone: true
})
export class KpiColorPercentPipe implements PipeTransform {

  transform(value: unknown, ...args: unknown[]): unknown {
    return null;
  }

}
