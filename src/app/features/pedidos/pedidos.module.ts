import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ComponentModule } from 'src/app/shared/components/component.module';

import { PedidosComponent } from './pedidos.component';
import { PedidosRoutingModule } from './pedidos-routing.module';
import { RegistroPedidosComponent } from './registro-pedidos/registro-pedidos.component';
import { ConfirmarPedidosComponent } from './confirmar-pedidos/confirmar-pedidos.component';


@NgModule({
  declarations: [
    PedidosComponent,
    RegistroPedidosComponent,
    ConfirmarPedidosComponent
  ],
  imports: [
    CommonModule,
    ComponentModule,
    PedidosRoutingModule
  ]
})
export class PedidosModule { }
