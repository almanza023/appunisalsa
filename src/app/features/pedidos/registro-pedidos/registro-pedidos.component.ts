import { Component, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import {
    ConfirmationService,
    ConfirmEventType,
    MessageService,
} from 'primeng/api';
import { Table } from 'primeng/table';
import { finalize } from 'rxjs';
import { PedidosService } from 'src/app/core/services/pedidos.service';
import { ProductosService } from 'src/app/core/services/productos.service';
import { SelectorMesaComponent } from 'src/app/shared/components/selector-mesa/selector-mesa.component';

@Component({
    selector: 'app-registro-pedidos',
    templateUrl: './registro-pedidos.component.html',
    providers: [MessageService, ConfirmationService],
})
export class RegistroPedidosComponent implements OnInit {
    pedido: any = {};
    detallepedido: any = {};
    detalles: any = [];
    productosFiltrados: any[] = [];

    displayDialog: boolean = false; // Variable para controlar la visibilidad del diálogo
    productos: any[] = []; // Lista de productos disponibles para agregar
    today: any; // Inicializa la variable today con la fecha actual
    pedido_id: string = '';

    infoPedido: any = {};
    totalpedido: number = 0;
    totalcantidad: number = 0;

    pendienteDialog: boolean = false;
    pendientes: any = [];
    id:string="";
    cambioMesa:boolean=false;

    constructor(
        private productoService: ProductosService,
        private pedidosService: PedidosService,
        private messageService: MessageService,
        private router: Router,
        private route: ActivatedRoute,
        private confirmationService: ConfirmationService
    ) {}

    @ViewChild(SelectorMesaComponent) mesaComponent: SelectorMesaComponent;

    ngOnInit() {
        this.id = this.route.snapshot.paramMap.get('id');
        this.pedido_id = this.route.snapshot.paramMap.get('id');
        this.today = this.formatDate(new Date());
        this.getProductos();
        if (this.pedido_id == '0') {
            this.pedido_id = '';
        } else {
            setTimeout(() => {
                this.getPedido(this.pedido_id);
            }, 1500);
        }
    }

    formatDate(date: Date): string {
        const day = String(date.getDate()).padStart(2, '0');
        const month = String(date.getMonth() + 1).padStart(2, '0'); // Los meses son 0-indexados
        const year = date.getFullYear();
        return `${year}-${month}-${day}`;
    }

    mostrarDialogoProductos() {
        this.pedido.fecha = this.today;
        if (this.pedido.fecha == undefined || this.pedido.fecha == '') {
            this.messageService.add({
                severity: 'warn',
                summary: 'Advertencia',
                detail: 'Debe Seleccionar una Fecha',
                life: 3000,
            });
            return;
        }
        if (this.pedido.comanda == undefined || this.pedido.comanda == '') {
            this.messageService.add({
                severity: 'warn',
                summary: 'Advertencia',
                detail: 'Debe Ingresar un N° de Comanda',
                life: 3000,
            });
            return;
        }

        if (this.pedido.mesa_id == undefined) {
            this.messageService.add({
                severity: 'warn',
                summary: 'Advertencia',
                detail: 'Debe Seleccionar una mesa',
                life: 3000,
            });
            return;
        }

        if (this.pedido_id == '' || this.pedido_id == undefined) {
            this.crear();
        } else {
            this.displayDialog = true;
        }
    }

    agregarProducto(producto: any, cantidad: number) {
        if (cantidad > 0) {
            const detalle = {
                pedido_id: this.pedido_id,
                producto_id: producto.id,
                cantidad: cantidad, // Usar la cantidad recibida desde la vista
                precio: producto.precio,
            };
            this.crearDetalle(detalle);
        }
    }

    quitarProducto(producto: any, cantidad: number) {
        if (cantidad > 0) {
            const detalle = {
                pedido_id: this.pedido_id,
                producto_id: producto.id,
                cantidad: cantidad * -1, // Usar la cantidad recibida desde la vista
                precio: producto.precio * -1,
            };
            this.crearDetalle(detalle);
        }
    }

    calcularTotal() {
        this.totalpedido = this.detalles.reduce(
            (total, detalle) => Number(total) + Number(detalle.total_subtotal),
            0
        );
        this.totalcantidad = this.detalles.reduce(
            (total, detalle) => Number(total) + Number(detalle.total_cantidad),
            0
        );
        return this.totalpedido;
    }

    getProductos() {
        this.productoService.getActive().subscribe(
            (response) => {
                //console.log(response.data);
                this.productos = response.data.filter(producto => producto.stock_actual > 0);
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

    getPedido(pedido_id: any) {
        this.pedidosService
            .getById(pedido_id)
            .pipe(finalize(() => this.mapearDatos()))
            .subscribe(
                (response) => {
                    //console.log(response.data);
                    this.infoPedido = response.data;
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

    crear() {
        this.pedido.user_id = localStorage.getItem('user_id');
        this.pedido.fecha = this.today;
        this.pedidosService
            .postData(this.pedido)
            .pipe(finalize(() => this.getPedido(this.pedido_id)))
            .subscribe(
                (response) => {
                    let severity = '';
                    let summary = '';
                    if (response.isSuccess == true) {
                        severity = 'success';
                        summary = 'Exitoso';
                        this.pedido_id = response.data.id;
                        this.displayDialog = true;
                    } else {
                        severity = 'warn';
                        summary = 'Advertencia';
                        this.pedido_id = response.data.id;
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
                        detail: "Error al obtener datos",
                        life: 3000,
                    });
                }
            );
    }

    crearDetalle(item: any) {
        this.pedidosService.postDetalles(item).subscribe(
            (response) => {
                let severity = '';
                let summary = '';
                if (response.isSuccess == true) {
                    severity = 'success';
                    summary = 'Exitoso';
                    this.detalles = response.data;
                    //this.displayDialog = false;
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

    mapearDatos() {
        this.pedido = this.infoPedido.pedido;
        this.detalles = this.infoPedido.detalles;
        this.mesaComponent.filtrar(this.infoPedido.pedido.mesa_id);
    }

    finalizarPedido() {
        this.pedido.total = this.totalpedido;
        this.pedido.cantidad = this.totalcantidad;

        this.pedidosService.putData(this.pedido_id, this.pedido).subscribe(
            (response) => {
                let severity = '';
                let summary = '';
                if (response.isSuccess) {
                    severity = 'success';
                    summary = 'Pedido finalizado con éxito';
                    this.router.navigate(['/pedidos']); // Redirigir a la lista de pedidos
                } else {
                    severity = 'warn';
                    summary = 'Advertencia';
                    this.pendientes = response.data;
                    this.pendienteDialog = true;
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

    cancelarFinalizarPedido() {
        this.displayDialog = false; // Cerrar el diálogo de confirmación
    }
    confirm1() {
        this.confirmationService.confirm({
            message: '¿Está seguro de Finalizar el Pedido?',
            header: 'Confirmación',
            icon: 'pi pi-exclamation-triangle',
            acceptLabel: 'Aceptar', // Texto del botón Aceptar
            rejectLabel: 'Cancelar', // Texto del botón Cancelar
            accept: () => {
                this.finalizarPedido();
            },
            reject: (type) => {
                switch (type) {
                    case ConfirmEventType.REJECT:
                        break;
                    case ConfirmEventType.CANCEL:
                        break;
                }
            },
        });
    }

    actualizarPedido() {
        this.router.navigateByUrl('/', {skipLocationChange:true}).then(()=>{
            this.router.navigate(['pedidos/registro/'+this.pedido_id]);
        })
    }

    cambiarMesa(){
        this.mesaComponent.disabled=false
        this.cambioMesa=true;
    }

    actualizarMesa(){
        let item={
            pedido_id: this.pedido_id,
            mesa_id: this.pedido.mesa_id
        }
        this.pedidosService.postCambioMesa(item).subscribe(
            (response) => {
                let severity = '';
                let summary = '';
                if (response.isSuccess) {
                    severity = 'success';
                    summary = 'Exitoso';
                    this.cambioMesa=false;
                    this.mesaComponent.disabled=true;
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
                    detail: "Error al Enviar Datos",
                    life: 3000,
                });
            }
        );
    }

}
