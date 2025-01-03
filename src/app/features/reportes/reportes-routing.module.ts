
import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';

import { ReporteDiaComponent } from './reporte-dia/reporte-dia.component';


@NgModule({
    imports: [RouterModule.forChild([
        { path: 'dia', component: ReporteDiaComponent },
    ])],
    exports: [RouterModule]
})
export class ReportesRoutingModule { }
