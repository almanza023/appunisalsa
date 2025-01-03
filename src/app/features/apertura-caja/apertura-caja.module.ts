import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ComponentModule } from 'src/app/shared/components/component.module';

import { AperturaCajaComponent } from './apertura-caja.component';
import { AperturaCajaRoutingModule } from './apertura-caja-routing.module';


@NgModule({
  declarations: [
    AperturaCajaComponent,
  ],
  imports: [
    CommonModule,
    ComponentModule,
    AperturaCajaRoutingModule
  ]
})
export class AperturaCajaModule { }
