
import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { KatexModule } from 'ng-katex';

interface MonthlyPrices {
  AveragePrice: number;
  MonthlyPrices: number[];
}

interface Data {
  [key: string]: MonthlyPrices;
}

@Component({
  selector: 'app-root',
  standalone:true,
  imports:[
    RouterOutlet,
    RouterLink,
    RouterLinkActive,
  ],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {


  
  calculatePriceDifferences() {
    
    const data: Data = {
      SPY: {
        AveragePrice: 439.50,
        MonthlyPrices: [
          378.10, 392.32, 412.12, 410.59, 450.18,
          463.12, 456.98, 471.99, 439.75, 450.50,
          460.77, 451.33
        ]
      },
      XLF: {
        AveragePrice: 32.20,
        MonthlyPrices: [
          32.01, 31.45, 32.05, 31.67, 32.85,
          33.15, 33.01, 33.34, 32.81, 32.50,
          32.10, 32.75
        ]
      },
      XLY: {
        AveragePrice: 183.68,
        MonthlyPrices: [
          178.22, 180.89, 182.59, 182.72, 184.53,
          185.67, 186.99, 184.32, 182.65, 185.19,
          184.50, 185.06
        ]
      },
      XLC: {
        AveragePrice: 53.65,
        MonthlyPrices: [
          50.02, 51.78, 52.21, 52.81, 53.82,
          54.16, 54.50, 53.78, 52.25, 53.00,
          53.66, 53.45
        ]
      },
      XLI: {
        AveragePrice: 104.11,
        MonthlyPrices: [
          97.50, 99.32, 100.55, 102.10, 105.25,
          106.90, 107.85, 105.55, 104.20, 105.60,
          106.75, 104.85
        ]
      },
      VOO: {
        AveragePrice: 439.78,
        MonthlyPrices: [
          378.12, 392.32, 412.14, 410.32, 450.35,
          463.19, 456.99, 471.97, 439.79, 450.53,
          460.91, 451.50
        ]
      },
      VO: {
        AveragePrice: 195.60,
        MonthlyPrices: [
          185.90, 189.01, 191.40, 192.60, 195.10,
          197.20, 196.60, 195.30, 194.50, 195.80,
          197.70, 195.20
        ]
      },
      VB: {
        AveragePrice: 212.34,
        MonthlyPrices: [
          200.22, 202.51, 204.30, 205.90, 210.10,
          213.80, 212.00, 210.50, 209.60, 211.00,
          212.90, 211.60
        ]
      },
      IWM: {
        AveragePrice: 188.55,
        MonthlyPrices: [
          176.11, 179.62, 182.05, 184.10, 186.78,
          188.50, 187.90, 185.70, 184.10, 186.60,
          188.80, 187.30
        ]
      },
      MDY: {
        AveragePrice: 430.70,
        MonthlyPrices: [
          400.90, 405.22, 410.00, 415.30, 420.50,
          425.10, 428.80, 430.40, 429.00, 431.50,
          433.20, 430.10
        ]
      },
      VEA: {
        AveragePrice: 40.98,
        MonthlyPrices: [
          37.56, 38.45, 39.12, 40.20, 41.15,
          41.78, 40.50, 41.00, 40.40, 41.25,
          41.68, 40.90
        ]
      },
      VWO: {
        AveragePrice: 38.27,
        MonthlyPrices: [
          34.98, 35.62, 36.15, 36.78, 37.00,
          38.20, 37.90, 37.50, 38.30, 38.10,
          38.60, 38.20
        ]
      },
      IXUS: {
        AveragePrice: 29.54,
        MonthlyPrices: [
          27.80, 28.05, 28.50, 28.90, 29.00,
          29.15, 29.25, 29.20, 29.30, 29.40,
          29.60, 29.50
        ]
      },
      GDDY: {
        AveragePrice: 23.50,
        MonthlyPrices: [
          21.45, 22.10, 22.50, 22.80, 23.00,
          23.30, 23.15, 23.00, 23.10, 23.40,
          23.70, 23.60
        ]
      },
      ACWI: {
        AveragePrice: 87.00,
        MonthlyPrices: [
          82.50, 83.50, 84.00, 85.00, 85.50,
          86.00, 87.50, 86.70, 87.20, 87.80,
          87.90, 87.50
        ]
      },
      IVV: {
        AveragePrice: 439.90,
        MonthlyPrices: [
          378.14, 392.31, 412.10, 410.55, 450.12,
          463.11, 456.80, 471.88, 439.77, 450.56,
          460.99, 451.48
        ]
      },
      VIG: {
        AveragePrice: 145.00,
        MonthlyPrices: [
          139.50, 140.00, 142.30, 143.40, 144.70,
          145.90, 145.80, 145.30, 144.00, 144.50,
          145.60, 145.70
        ]
      },
      VTV: {
        AveragePrice: 139.25,
        MonthlyPrices: [
          135.90, 137.00, 137.50, 138.20, 139.50,
          140.00, 139.90, 139.80, 139.60, 140.50,
          140.90, 139.70
        ]
      },
      VUG: {
        AveragePrice: 392.40,
        MonthlyPrices: [
          370.00, 374.50, 376.90, 380.00, 385.50,
          390.00, 392.00, 393.50, 391.20, 392.50,
          394.00, 392.80
        ]
      },
      SPLV: {
        AveragePrice: 45.80,
        MonthlyPrices: [
          42.00, 43.50, 43.80, 44.20, 45.00,
          46.00, 45.50, 45.20, 44.80, 45.30,
          45.80, 45.60
        ]
      },
      AGG: {
        AveragePrice: 99.50,
        MonthlyPrices: [
          97.00, 97.50, 98.00, 98.50, 99.00,
          99.20, 99.40, 99.50, 99.80, 99.90,
          100.00, 99.75
        ]
      },
      VNQ: {
        AveragePrice: 83.60,
        MonthlyPrices: [
          78.50, 79.50, 80.00, 80.90, 82.00,
          83.00, 83.50, 82.20, 83.00, 84.00,
          83.90, 83.30
        ]
      },
      DBMF: {
        AveragePrice: 28.70,
        MonthlyPrices: [
          27.80, 28.10, 28.30, 28.50, 28.90,
          29.10, 28.80, 28.70, 28.60, 28.40,
          28.80, 28.70
        ]
      },
      TIP: {
        AveragePrice: 114.30,
        MonthlyPrices: [
          110.50, 111.70, 112.50, 113.50, 114.50,
          115.00, 114.00, 113.80, 114.10, 114.40,
          114.70, 114.20
        ]
      },
      HYG: {
        AveragePrice: 77.90,
        MonthlyPrices: [
          73.00, 74.50, 75.20, 75.80, 76.30,
          77.00, 76.90, 76.60, 77.30, 77.80,
          78.00, 77.50
        ]
      }
    }


    for(let key of Object.keys(data)){
      console.log(key);

      console.log(data[key].AveragePrice);
      
      console.log((data[key].MonthlyPrices[11] - data[key].MonthlyPrices[0])/data[key].MonthlyPrices[0]);
    }

  }

}

