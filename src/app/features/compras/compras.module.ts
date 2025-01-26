import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ComponentModule } from 'src/app/shared/components/component.module';

import { ComprasComponent } from './compras.component';
import { RegistroComprasComponent } from './registro-compras/registro-compras.component';
import { ComprasRoutingModule } from './compras-routing.module';
import { ActualizarStockComponent } from './actualizar-stock/actualizar-stock.component';


@NgModule({
  declarations: [
    ComprasComponent,
    RegistroComprasComponent,
    ActualizarStockComponent
  ],
  imports: [
    CommonModule,
    ComponentModule,
    ComprasRoutingModule
  ]
})
export class ComprasModule { }
