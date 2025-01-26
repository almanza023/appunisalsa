import { Component, ViewChild } from '@angular/core';
import { finalize } from 'rxjs';

import { Table } from 'primeng/table';
import { MessageService } from 'primeng/api';



import { PedidosService } from 'src/app/core/services/pedidos.service';
import { Router } from '@angular/router';


@Component({
    selector: 'app-pedidos',
    templateUrl: './pedidos.component.html',
    providers: [MessageService],
})
export class PedidosComponent {
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
    totalpedido:any=0;
    totalcantidad:any=0;
    nombreModulo: string = 'Módulo de Pedidos';

    fechaInicial:any;
    fechaFinal:any;
    filtroUser:string;
    rol:string;


    constructor(
        private service: PedidosService,
        private router: Router,
        private messageService: MessageService
    ) {}



    ngOnInit() {
        this.rol = localStorage.getItem('rol');
        this.buscar();
        this.cols = [ ];
        this.statuses = [];
    }

    buscar(){
        let rol = localStorage.getItem('rol');
        if (this.fechaInicial && !this.fechaFinal) {
            this.messageService.add({
                severity: 'warn',
                summary: 'Advertencia',
                detail: 'Si ingresa Fecha Inicial debe ingresar también Fecha Final',
                life: 3000
            });
            return;
        }
        let data:any = {
            fecha_inicio: this.fechaInicial,
            fecha_fin: this.fechaFinal
        };

        if(rol != "1") {
            data.user_id = localStorage.getItem('user_id');
            data.estadopedido_id=1;
        }else{
            data.user_id = this.filtroUser;
            data.estadopedido_id=null;
            //Para Mostrar Todoslos estados

        }
        this.data=[];
        this.service.postFilter(data)
        .subscribe(
            (response) => {
                this.data = response.data;
                if(this.data.length==0){
                    this.messageService.add({
                        severity: 'warn',
                        summary: 'Advertencia',
                        detail: "No existen pedidos Pendientes",
                        life: 3000,
                    });
                }
            },
            (error) => {
                this.messageService.add({
                    severity: 'error',
                    summary: 'Advertencia',
                    detail: "Error al Consultar datos",
                    life: 3000,
                });
            }
        );
    }

    openNew(id:any) {
        this.router.navigate(['/pedidos/registro/'+id]); // Redirigir a la lista de pedidos
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
            .pipe(finalize(() => this.buscar()))
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

    getPedido(pedido_id:any) {
        this.service.getById(pedido_id)
        .subscribe(
            (response) => {
                //console.log(response.data);
                this.clienteDialog=true;
                this.detalles = response.data.detalles;
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

    calcularTotal() {
        this.totalpedido=this.detalles.reduce(
            (total, detalle) => Number(total) + Number(detalle.total_subtotal),
            0
        );
        this.totalcantidad=this.detalles.reduce(
            (total, detalle) => Number(total) + Number(detalle.total_cantidad),
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
