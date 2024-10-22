import { Routes } from '@angular/router';
import { AnalyticsComponent } from './component/analytics/analytics.component';
import { UploadStatementComponent } from './component/upload-statement/upload-statement.component';

export const routes: Routes = [
    {path:"", redirectTo:"analytics", pathMatch:'full'},
    {path:"analytics", component:AnalyticsComponent},
    {path:"upload-statement", component:UploadStatementComponent},
];
