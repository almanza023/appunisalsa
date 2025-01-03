import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AperturaCajaComponent } from './apertura-caja.component';



const routes: Routes = [{ path: '', component: AperturaCajaComponent }];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AperturaCajaRoutingModule { }
