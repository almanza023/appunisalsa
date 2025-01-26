import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ComponentModule } from '../../shared/components/component.module';
import { ReportesRoutingModule } from './reportes-routing.module';
import { ReactiveFormsModule } from '@angular/forms';
import { ReporteDiaComponent } from './reporte-dia/reporte-dia.component';
import { ReporteDiaHistoricosComponent } from './reporte-dia-historicos/reporte-dia-historicos.component';

@NgModule({
    imports: [
        CommonModule,
        ComponentModule,
        ReactiveFormsModule,
        ReportesRoutingModule
    ],
    declarations: [
    ReporteDiaComponent,
    ReporteDiaHistoricosComponent,
  ]
})
export class ReportesModule { }
