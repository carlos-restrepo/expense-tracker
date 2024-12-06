import { Routes } from '@angular/router';
import { AnalyticsComponent } from './component/analytics/analytics.component';
import { UploadStatementComponent } from './component/upload-statement/upload-statement.component';
import { DisplayProductsComponent } from './component/display-products/display-products.component';
import { ColorCubeComponent } from './component/color-cube/color-cube.component';

export const routes: Routes = [
    {path:"", redirectTo:"upload-statement", pathMatch:'full'},
    {path:"upload-statement", component:UploadStatementComponent},
    {path:"analytics", component:AnalyticsComponent},
    {path:"products", component:DisplayProductsComponent},
    {path:"color-cube", component:ColorCubeComponent}
];
