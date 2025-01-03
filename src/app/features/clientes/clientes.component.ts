import { Component, ViewChild } from '@angular/core';
import { finalize } from 'rxjs';

import { Table } from 'primeng/table';
import { MessageService } from 'primeng/api';

import { ClientesService } from 'src/app/core/services/clientes.service';
import { Cliente } from 'src/app/core/interface/Cliente';

@Component({
    selector: 'app-clientes',
    templateUrl: './clientes.component.html',
    providers: [MessageService],
})
export class ClientesComponent {
    clienteDialog: boolean = false;
    deleteProductDialog: boolean = false;
    deleteProductsDialog: boolean = false;

    data: any[] = [];
    cliente: any = {};
    selectedProducts: any[] = [];
    submitted: boolean = false;
    cols: any[] = [];
    statuses: any[] = [];
    seleccionado: any = {};
    item: any = {};
    rowsPerPageOptions = [5, 10, 20];
    posiciones:any[]=[];
    posicion:any={};
    jugadorModel:Cliente={};

    nombreModulo: string = 'Módulo de Clientes';



    constructor(
        private clienteService: ClientesService,
        private messageService: MessageService
    ) {}



    ngOnInit() {
        this.getDataAll();
        this.cols = [ ];
        this.statuses = [];
    }

    getDataAll() {
        this.clienteService.getAll().subscribe(
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


    openNew() {
        this.cliente = {};
        this.cliente.editar = false;
        this.submitted = false;
        this.clienteDialog = true;
        this.seleccionado = {};
        this.posicion={};
    }

    deleteSelectedProducts() {
        this.deleteProductsDialog = true;
    }

    editProduct(item: any) {
        this.cliente = { ...item };
        this.clienteDialog = true;
        this.cliente.editar = true;
    }

    bloqueoCliente(cliente: any) {
        this.deleteProductDialog = true;
        this.cliente = { ...cliente };
        this.cliente.cambio_estado = true;
        this.jugadorModel=this.mapearDatos(this.cliente, true);

    }

    confirmDelete() {
        this.deleteProductDialog = false;
        this.clienteService
            .postEstado(this.cliente.id)
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
        this.cliente = {};
        this.jugadorModel = {};
    }

    hideDialog() {
        this.clienteDialog = false;
        this.submitted = false;
    }

    saveProduct() {
        this.submitted = true;
        this.cliente.user = localStorage.getItem('user_id');
        if (this.cliente.nombre == undefined) {
            this.messageService.add({
                severity: 'warn',
                summary: 'Advertencia',
                detail: 'Debe ingresar un Nombre',
                life: 3000,
            });
            return;
        }
        if (this.cliente.numerodocumento == undefined) {
            this.messageService.add({
                severity: 'warn',
                summary: 'Advertencia',
                detail: 'Debe ingresar un Número Documento',
                life: 3000,
            });
            return;
        }

        this.jugadorModel=this.mapearDatos(this.cliente, false);

        if (this.cliente.id == undefined) {
            this.crear(this.jugadorModel);
        } else {
            this.actualizar(this.cliente.id, this.jugadorModel);
        }
        //this.clientes = [...this.clientes];
        this.clienteDialog = false;
        this.cliente = {};
        this.seleccionado = {};
        this.posicion={};
        this.clienteDialog=true;
    }

    crear(item: Cliente) {
        this.clienteService
            .postData(item)
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
    }

    actualizar(id:number, item: Cliente) {
        this.clienteService
            .putData(id, item)
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
    }

    onGlobalFilter(table: Table, event: Event) {
        table.filterGlobal(
            (event.target as HTMLInputElement).value,
            'contains'
        );
    }


    mapearDatos(jugaodr:any, estado:boolean){
        let model:Cliente={};
        model.nombre=this.cliente.nombre.toUpperCase();
        model.numerodocumento=this.cliente.numerodocumento;
        model.telefono=this.cliente.telefono;
        if(estado){
            model.estado=!this.cliente.estado;
        }
        return model
    }
}
