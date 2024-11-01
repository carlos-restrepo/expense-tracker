import { Routes } from '@angular/router';
import { AnalyticsComponent } from './component/analytics/analytics.component';
import { UploadStatementComponent } from './component/upload-statement/upload-statement.component';
import { DisplayProductsComponent } from './component/display-products/display-products.component';

export const routes: Routes = [
    {path:"", redirectTo:"analytics", pathMatch:'full'},
    {path:"upload-statement", component:UploadStatementComponent},
    {path:"analytics", component:AnalyticsComponent},
    {path:"products", component:DisplayProductsComponent},
];
