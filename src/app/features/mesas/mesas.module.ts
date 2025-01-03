import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ComponentModule } from 'src/app/shared/components/component.module';


import { MesasComponent } from './mesas.component';
import { MesaRoutingModule } from './mesas-routing.module';




@NgModule({
  declarations: [
    MesasComponent
  ],
  imports: [
    CommonModule,
    ComponentModule,
    MesaRoutingModule
  ]
})
export class MesasModule { }
