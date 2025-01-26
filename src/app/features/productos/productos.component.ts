import { Component, ViewChild } from '@angular/core';
import { finalize } from 'rxjs';

import { Table } from 'primeng/table';
import { MessageService } from 'primeng/api';

import { Proveedor } from 'src/app/core/interface/Proveedor';

import { ProductosService } from 'src/app/core/services/productos.service';
import { SelectorCategoriaComponent } from 'src/app/shared/components/selector-categoria/selector-categoria.component';


@Component({
    selector: 'app-productos',
    templateUrl: './productos.component.html',
    providers: [MessageService],
})
export class ProductosComponent {
    clienteDialog: boolean = false;
    deleteProductDialog: boolean = false;
    deleteProductsDialog: boolean = false;

    data: any[] = [];
    producto: any = {};
    selectedProducts: any[] = [];
    submitted: boolean = false;
    cols: any[] = [];
    statuses: any[] = [];
    seleccionado: any = {};
    item: any = {};
    rowsPerPageOptions = [5, 10, 20];
    posiciones:any[]=[];
    posicion:any={};
    selectedFile: File | null = null;
    movimientos:any=[];
    displayMovimientosDialog:boolean=false;
    nombreProducto:string;


    nombreModulo: string = 'Módulo de Productos';

    @ViewChild(SelectorCategoriaComponent) categoriaComponent: SelectorCategoriaComponent;

    constructor(
        private service: ProductosService,
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

    getCategoria(event){
        this.producto.categoria_id=event.id;
    }


    openNew() {
        this.producto = {};
        this.producto.editar = false;
        this.submitted = false;
        this.clienteDialog = true;
        this.seleccionado = {};
        this.posicion={};

        this.categoriaComponent.reiniciarComponente();
    }

    deleteSelectedProducts() {
        this.deleteProductsDialog = true;
    }

    editProduct(item: any) {
        this.producto = { ...item };
        this.clienteDialog = true;
        this.producto.editar = true;

        this.categoriaComponent.filtrar(this.producto.categoria_id);
    }

    bloqueoCliente(cliente: any) {
        this.deleteProductDialog = true;
        this.producto = { ...cliente };
        this.producto.cambio_estado = true;
        //this.jugadorModel=this.mapearDatos(this.proveedor, true);

    }

    confirmDelete() {
        this.deleteProductDialog = false;
        this.service
            .postEstado(this.producto.id)
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
        this.producto = {};

    }

    hideDialog() {
        this.clienteDialog = false;
        this.submitted = false;
    }

    saveProduct() {
        this.submitted = true;
        this.producto.user_id = localStorage.getItem('user_id');

        if (this.producto.categoria_id == undefined) {
            this.messageService.add({
                severity: 'warn',
                summary: 'Advertencia',
                detail: 'Debe Seleccionar una Categoria',
                life: 3000,
            });
            return;
        }


        if (this.producto.nombre == undefined) {
            this.messageService.add({
                severity: 'warn',
                summary: 'Advertencia',
                detail: 'Debe ingresar un Nombre',
                life: 3000,
            });
            return;
        }


        //this.jugadorModel=this.mapearDatos(this.proveedor, false);

        if (this.producto.id == undefined) {
            this.crear(this.producto);
        } else {
            this.actualizar(this.producto.id, this.producto);
        }
        //this.clientes = [...this.clientes];
        this.clienteDialog = false;
        //this.producto = {};
        this.seleccionado = {};
        this.posicion={};
        //this.clienteDialog=false;
    }

    crear(item: any) {
        let user_id=localStorage.getItem('user_id');
        const formData = new FormData();
        formData.append('imagen', this.selectedFile);
        formData.append('user_id', user_id);
        formData.append('categoria_id', this.producto.categoria_id);
        formData.append('nombre', this.producto.nombre);
        formData.append('descripcion', this.producto.descripcion);
        formData.append('precio', this.producto.precio);
        formData.append('stock_actual', this.producto.stock_actual);

           this.service
            .postData(formData)
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
            this.producto={};
            this.selectedFile=null;
    }

    actualizar(id:number, item: any) {

        const formData = new FormData();
        formData.append('imagen', this.selectedFile);
        formData.append('categoria_id', this.producto.categoria_id);
        formData.append('nombre', this.producto.nombre);
        formData.append('descripcion', this.producto.descripcion);

               this.service
            .putData(id, formData)
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

onImageSelected(event: any) {
    this.selectedFile = event.target.files[0];
    if (this.selectedFile) {
        const fileType = this.selectedFile.type.split('/')[0];
        const fileSize = this.selectedFile.size / 1024 / 1024; // Convertir a MB

        if (fileType !== 'image' || fileSize > 5) {
            this.messageService.add({
                severity: 'warn',
                summary: 'Advertencia',
                detail: 'Por favor, selecciona una imagen de menos de 5MB.',
                life: 3000,
            });
            return;
        }


    }
}

verHistorialMovimiento(producto_id:any, nombre:string){
    let item={
        producto_id
    };
    this.nombreProducto=nombre;

    this.service
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
