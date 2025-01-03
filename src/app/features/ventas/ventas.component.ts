import { Component, ViewChild } from '@angular/core';
import { finalize } from 'rxjs';

import { Table } from 'primeng/table';
import { MessageService } from 'primeng/api';
import { Router } from '@angular/router';
import { VentasService } from 'src/app/core/services/ventas.service';


@Component({
    selector: 'app-ventas',
    templateUrl: './ventas.component.html',
    providers: [MessageService],
})
export class VentasComponent {
    clienteDialog: boolean = false;
    deleteProductDialog: boolean = false;
    deleteProductsDialog: boolean = false;

    data: any[] = [];
    pedido: any = {};
    selectedProducts: any[] = [];
    submitted: boolean = false;
    cols: any[] = [];
    statuses: any[] = [];
    seleccionado: any = {};
    item: any = {};
    rowsPerPageOptions = [5, 10, 20];
    posiciones:any[]=[];
    posicion:any={};
    detalles: any = [];
    pagos: any = [];
    totalpedido:any=0;
    totalcantidad:any=0;
    nombreModulo: string = 'Módulo de Ventas';



    constructor(
        private service: VentasService,
        private router: Router,
        private messageService: MessageService
    ) {}



    ngOnInit() {
        this.getDataAll();
        this.cols = [ ];
        this.statuses = [];
    }

    getDataAll() {
        this.service.getAll().subscribe(
            (response) => {
                //console.log(response.data);
                this.data = response.data;
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


    openNew(id:any) {
        this.router.navigate(['/ventas/registro']); // Redirigir
    }

    deleteSelectedProducts() {
        this.deleteProductsDialog = true;
    }


    bloqueoCliente(cliente: any) {
        this.deleteProductDialog = true;
        this.pedido = { ...cliente };
        this.pedido.cambio_estado = true;


    }

    confirmDelete() {
        this.deleteProductDialog = false;
        this.service
            .postEstado(this.pedido.id)
            .pipe(finalize(() => this.getDataAll()))
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
                        severity: 'warn',
                        summary: 'Advertencia',
                        detail: error.error.data,
                        life: 3000,
                    });
                }
            );
        this.pedido = {};
    }

    hideDialog() {
        this.clienteDialog = false;
        this.submitted = false;
    }

    getPedido(item:any) {
        this.clienteDialog=true;
        this.detalles=item.detalles;
        this.pagos=item.pagos;
    }

    calcularTotal() {
        this.totalpedido=this.detalles.reduce(
            (total, detalle) => total + detalle.subtotal,
            0
        );
        this.totalcantidad=this.detalles.reduce(
            (total, detalle) => total + detalle.cantidad,
            0
        );
        return this.totalpedido;
    }

    onGlobalFilter(table: Table, event: Event) {
        table.filterGlobal(
            (event.target as HTMLInputElement).value,
            'contains'
        );
    }



}
