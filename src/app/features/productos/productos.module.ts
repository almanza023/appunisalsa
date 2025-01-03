import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ComponentModule } from 'src/app/shared/components/component.module';

import { ProductosComponent } from './productos.component';
import { ProductosRoutingModule } from './productos-routing.module';


@NgModule({
  declarations: [
    ProductosComponent,
  ],
  imports: [
    CommonModule,
    ComponentModule,
    ProductosRoutingModule
  ]
})
export class ProductosModule { }
