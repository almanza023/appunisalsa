import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { PedidosComponent } from './pedidos.component';
import { RegistroPedidosComponent } from './registro-pedidos/registro-pedidos.component';
import { ConfirmarPedidosComponent } from './confirmar-pedidos/confirmar-pedidos.component';



const routes: Routes = [
    { path: '', component: PedidosComponent },
    { path: 'registro/:id', component: RegistroPedidosComponent },
    { path: 'confirmar', component: ConfirmarPedidosComponent },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class PedidosRoutingModule { }
