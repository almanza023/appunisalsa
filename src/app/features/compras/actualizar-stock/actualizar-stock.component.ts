import { Component, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ConfirmationService, ConfirmEventType, MessageService } from 'primeng/api';
import { Table } from 'primeng/table';
import { finalize } from 'rxjs';
import { ComprasService } from 'src/app/core/services/compras.service';

import { ProductosService } from 'src/app/core/services/productos.service';
import { SelectorProveedorComponent } from 'src/app/shared/components/selector-proveedor/selector-proveedor.component';

@Component({
    selector: 'app-actualizar-stock',
    templateUrl: './actualizar-stock.component.html',
    providers: [MessageService, ConfirmationService],
})
export class ActualizarStockComponent implements OnInit {



    productos: any[] = []; // Lista de productos disponibles para agregar
    today:any; // Inicializa la variable today con la fecha actual
    displayMovimientosDialog:boolean=false;
    nombreProducto:string;
    movimientos:any=[];

    constructor(
        private productoService: ProductosService,
        private confirmationService: ConfirmationService,
        private messageService: MessageService
    ) {}

    ngOnInit() {
        this.getProductos();

    }

    agregarProducto(producto: any) {
        if (producto.precio <= 0 || producto.precio ==undefined) {
            this.messageService.add({
                severity: 'warn',
                summary: 'Advertencia',
                detail: 'El precio de Venta debe ser mayor que cero',
                life: 3000
            });
            return;
        }
        if (producto.cantidad <= 0) {
            this.messageService.add({
                severity: 'warn',
                summary: 'Advertencia',
                detail: 'La cantidad debe ser mayor que cero',
                life: 3000
            });
            return;
        }
        if(producto.cantidad>0){
            const detalle = {
                producto_id: producto.id,
                user_id: localStorage.getItem('user_id'),
                cantidad: producto.cantidad,
                precio_venta: producto.precio,
            };

            this.confirm1(detalle, producto.stock_actual);

        }
    }

    crearDetalle(item:any) {

        this.productoService.postDetalles(item)
        .pipe(finalize(() => this.getProductos()))
        .subscribe(
            (response) => {
                let severity = '';
                let summary = '';
                if (response.isSuccess == true) {
                    severity = 'success';
                    summary = 'Exitoso';
                } else {
                    severity = 'warn';
                    summary = 'Advertencia';
                }
                this.messageService.add({
                    severity: severity,
                    summary: summary,
                    detail: response.message,
                    life: 3000,
                });
            },
            (error) => {
                this.messageService.add({
                    severity: 'error',
                    summary: 'Advertencia',
                    detail: 'Error al Actualizar Stock de  Productos',
                    life: 3000,
                });
            }
        );
    }

    getProductos() {
        this.productoService.getActive().subscribe(
            (response) => {
                //console.log(response.data);
                this.productos = response.data;
            },
            (error) => {
                this.messageService.add({
                    severity: 'warn',
                    summary: 'Advertencia',
                    detail: error.error.data,
                    life: 3000,
                });
            }
        );
    }

    confirm1(detalle:any, cantidadactual:any) {
        this.confirmationService.confirm({
            message: '¿Está seguro Reemplazar los '+cantidadactual+ ' con los '+detalle.cantidad+' del Producto ?',
            header: 'Confirmación',
            icon: 'pi pi-exclamation-triangle',
            acceptLabel: 'Aceptar', // Texto del botón Aceptar
            rejectLabel: 'Cancelar', // Texto del botón Cancelar
            accept: () => {
                this.crearDetalle(detalle);
            },
            reject: (type) => {
                switch (type) {
                    case ConfirmEventType.REJECT:
                        break;
                    case ConfirmEventType.CANCEL:
                        break;
                }
            }
        });
    }




    onGlobalFilter(table: Table, event: Event) {
        table.filterGlobal(
            (event.target as HTMLInputElement).value,
            'contains'
        );
    }

    verHistorialMovimiento(producto_id:any, nombre:string){
        let item={
            producto_id
        };
        this.nombreProducto=nombre;
        this.productoService
                .postMovimientos(item)
                .subscribe(
                    (response) => {
                        this.displayMovimientosDialog=true;
                        this.movimientos=response.data;
                    },
                    (error) => {
                        this.messageService.add({
                            severity: 'warn',
                            summary: 'Advertencia',
                            detail: error.error.data,
                            life: 3000,
                        });
                    }
                );

    }

}
