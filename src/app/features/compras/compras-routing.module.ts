import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ComprasComponent } from './compras.component';
import { RegistroComprasComponent } from './registro-compras/registro-compras.component';
import { ActualizarStockComponent } from './actualizar-stock/actualizar-stock.component';



const routes: Routes = [
    { path: '', component: ComprasComponent },
    { path: 'registro/:id', component: RegistroComprasComponent },
    { path: 'actualizar-stock', component: ActualizarStockComponent },

];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ComprasRoutingModule { }
