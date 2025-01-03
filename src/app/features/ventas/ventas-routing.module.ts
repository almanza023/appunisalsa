import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { RegistroVentasComponent } from './registro-ventas/registro-ventas.component';
import { VentasComponent } from './ventas.component';



const routes: Routes = [
    { path: '', component: VentasComponent },
    { path: 'registro', component: RegistroVentasComponent },

];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class VentasRoutingModule { }
