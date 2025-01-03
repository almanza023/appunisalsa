import { Component, ViewChild } from '@angular/core';
import { finalize } from 'rxjs';

import { Table } from 'primeng/table';
import { MessageService } from 'primeng/api';

import { SelectorTiPoGastoComponent } from 'src/app/shared/components/selector-tipo-gasto/selector-tipo-gasto.component';
import { GastosService } from 'src/app/core/services/gastos.service';

@Component({
    selector: 'app-gastos',
    templateUrl: './gastos.component.html',
    providers: [MessageService],
})
export class GastosComponent {
    clienteDialog: boolean = false;
    deleteProductDialog: boolean = false;
    deleteProductsDialog: boolean = false;

    data: any[] = [];
    gasto: any = {};
    selectedProducts: any[] = [];
    submitted: boolean = false;
    cols: any[] = [];
    statuses: any[] = [];
    seleccionado: any = {};
    item: any = {};
    rowsPerPageOptions = [5, 10, 20];
    posiciones: any[] = [];
    posicion: any = {};
    selectedFile: File | null = null;

    nombreModulo: string = 'Módulo de Gastos';
    @ViewChild(SelectorTiPoGastoComponent)
    tipogastoComponent: SelectorTiPoGastoComponent;
    today:any="";
    startDate:any="";
    endDate:any="";
    filter:any={};

    constructor(
        private service: GastosService,
        private messageService: MessageService
    ) {}

    ngOnInit() {

        this.cols = [];
        this.statuses = [];
        this.today = this.formatDate(new Date());
        this.startDate = this.formatDate(new Date());
        this.endDate = this.formatDate(new Date());

        this.getDataAll(this.filter);
    }

    formatDate(date: Date): string {
        const day = String(date.getDate()).padStart(2, '0');
        const month = String(date.getMonth() + 1).padStart(2, '0'); // Los meses son 0-indexados
        const year = date.getFullYear();
        return `${year}-${month}-${day}`;
    }

    getDataAll(item:any) {
        this.service.postFilter(item).subscribe(
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

    getCategoria(event) {
        this.gasto.tipogasto_id = event.id;
    }

    openNew() {
        this.gasto = {};
        this.gasto.editar = false;
        this.submitted = false;
        this.clienteDialog = true;
        this.seleccionado = {};
        this.tipogastoComponent.reiniciarComponente();
    }

    deleteSelectedProducts() {
        this.deleteProductsDialog = true;
    }

    edit(item: any) {
        this.gasto = { ...item };
        this.clienteDialog = true;
        this.gasto.editar = true;
        this.tipogastoComponent.filtrar(this.gasto.tipopago_id);
    }

    bloqueoCliente(cliente: any) {
        this.deleteProductDialog = true;
        this.gasto = { ...cliente };
        this.gasto.cambio_estado = true;
        //this.jugadorModel=this.mapearDatos(this.proveedor, true);
    }

    confirmDelete() {
        this.deleteProductDialog = false;
        this.service
            .postEstado(this.gasto.id)
            .pipe(finalize(() => this.getDataAll(this.filter)))
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
        this.gasto = {};
    }

    hideDialog() {
        this.clienteDialog = false;
        this.submitted = false;
    }

    saveProduct() {
        this.submitted = true;
        this.gasto.user_id = localStorage.getItem('user_id');
        this.gasto.fecha=this.today;
        console.log(this.gasto);
        if (this.gasto.tipogasto_id == undefined) {
            this.messageService.add({
                severity: 'warn',
                summary: 'Advertencia',
                detail: 'Debe Seleccionar una Tipo De Gasto',
                life: 3000,
            });
            return;
        }

        if (
            this.gasto.descripcion == undefined ||
            this.gasto.descripcion == ''
        ) {
            this.messageService.add({
                severity: 'warn',
                summary: 'Advertencia',
                detail: 'Debe ingresar una Descripción',
                life: 3000,
            });
            return;
        }

        if (this.gasto.fecha == undefined) {
            this.messageService.add({
                severity: 'warn',
                summary: 'Advertencia',
                detail: 'Debe Seleccionar una Fecha',
                life: 3000,
            });
            return;
        }

        if (
            this.gasto.valortotal == undefined ||
            this.gasto.valortotal == '' ||
            this.gasto.valortotal <0
        ) {
            this.messageService.add({
                severity: 'warn',
                summary: 'Advertencia',
                detail: 'Debe Ingresar un Valor Válido',
                life: 3000,
            });
            return;
        }
        //this.jugadorModel=this.mapearDatos(this.proveedor, false);

        if (this.gasto.id == undefined) {

            this.crear(this.gasto);
        } else {
            this.actualizar(this.gasto.id, this.gasto);
        }
        //this.clientes = [...this.clientes];
        this.clienteDialog = false;
        //this.producto = {};
        this.seleccionado = {};
        this.gasto = {};
        //this.clienteDialog=false;
    }

    crear(item: any) {
        this.service
            .postData(this.gasto)
            .pipe(finalize(() => this.getDataAll(this.filter)))
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

    actualizar(id: number, item: any) {
        this.service
            .putData(id, item)
            .pipe(finalize(() => this.getDataAll(this.filter)))
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

filtrarPorFecha() {

    this.filter.fechaInicio=this.startDate;
    this.filter.fechaFinal=this.endDate;



    // Formatear las fechas para que solo quede YYYY-MM-DD
    if (this.filter.fechaInicio) {
        this.filter.fechaInicio = this.formatDate(new Date(this.filter.fechaInicio));
    }
    if (this.filter.fechaFinal) {
        if(!this.filter.fechaFinal.includes('T')){
            this.filter.fechaFinal = this.formatDate(new Date(this.filter.fechaFinal));
        }
    }

    this.getDataAll(this.filter);


}



}
