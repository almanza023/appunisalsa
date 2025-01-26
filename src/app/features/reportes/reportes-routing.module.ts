
import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';

import { ReporteDiaComponent } from './reporte-dia/reporte-dia.component';
import { ReporteDiaHistoricosComponent } from './reporte-dia-historicos/reporte-dia-historicos.component';


@NgModule({
    imports: [RouterModule.forChild([
        { path: 'dia', component: ReporteDiaComponent },
        { path: 'historicos', component: ReporteDiaHistoricosComponent },
    ])],
    exports: [RouterModule]
})
export class ReportesRoutingModule { }
