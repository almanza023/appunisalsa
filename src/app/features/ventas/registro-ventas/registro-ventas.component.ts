import { Component, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ConfirmationService, ConfirmEventType, MessageService } from 'primeng/api';
import { Table } from 'primeng/table';
import { finalize } from 'rxjs';

import { PedidosService } from 'src/app/core/services/pedidos.service';
import { ProductosService } from 'src/app/core/services/productos.service';
import { VentasService } from 'src/app/core/services/ventas.service';
import { SelectorMesaComponent } from 'src/app/shared/components/selector-mesa/selector-mesa.component';

@Component({
    selector: 'app-registro-ventas',
    templateUrl: './registro-ventas.component.html',
    providers: [MessageService, ConfirmationService],
})
export class RegistroVentasComponent implements OnInit {

    detalles: any = [];
    detallesPedido: any = [];
    historial: any = [];
    mesas: any[] = [];
    infoPedido:any={};
    pedido:any={};
    pagos:any=[];


    displayDialog: boolean = false; // Variable para controlar la visibilidad del diálogo
    productos: any[] = []; // Lista de productos disponibles para agregar
    today:any=""
    todayF:any=""
    mesa_id:any;
    pedido_id:any;
    mesa:string="";
    historialDialog:boolean=false;
    clienteDialog:boolean=false;
    totalpedido:any=0;
    totalcantidad:any=0;
    pedidosCerrados:any=[];
    venta:any={};
    tipopago:any={};
    productosDetalles:any=[];
    observaciones:string="";
    ventaReport:any;
    loading:boolean=false;
    disableButton:boolean=true;
    opciones:any=[
        {id:0,nombre:"NO"},
        {id:1,nombre:"SI"},
    ];


    formatDate(date: Date): string {
        const day = String(date.getDate()).padStart(2, '0');
        const month = String(date.getMonth() + 1).padStart(2, '0'); // Los meses son 0-indexados
        const year = date.getFullYear();
        return `${year}-${month}-${day}`;
    }


    constructor(
        private productoService: ProductosService,
        private pedidosService: PedidosService,
        private ventasService: VentasService,
        private messageService: MessageService,
        private router: Router,
        private route: ActivatedRoute,
        private confirmationService: ConfirmationService
    ) {}

    @ViewChild(SelectorMesaComponent) mesaComponent: SelectorMesaComponent;

    ngOnInit() {

        this.today = this.formatDate(new Date());
        this.todayF = this.formatDate(new Date(Date.now() + 86400000)); // Sumar 1 día a la fecha actual

        this.consultar();
        this.venta.especial=0
    }

    consultar(){
        this.detallesPedido=[];
        this.pagos=[];
        this.pedidosCerrados=[];
        if(this.today==""){
            this.messageService.add({
                severity: 'warn',
                summary: 'Advertencia',
                detail: "Debe Seleccionar una Fecha de Inicio",
                life: 3000,
            });
            return;
        }

        if(this.todayF==""){
            this.messageService.add({
                severity: 'warn',
                summary: 'Advertencia',
                detail: "Debe Seleccionar una Fecha de Final",
                life: 3000,
            });
            return;
        }
        this.pedido.fecha_inicio = this.today;
        this.pedido.fecha_final=this.todayF;
        this.pedido.estadopedido_id=2; //Cerrado
        this.getPedidosCerrados(this.pedido);
    }

    getDetallePedidoMesa(data:any) {
        this.detalles=[];
        this.pedidosService.postPedidoMesa(data).subscribe(
            (response) => {
                //console.log(response.data);
                this.detalles = response.data;
                if(response.message){
                    this.messageService.add({
                        severity: 'warn',
                        summary: 'Advertencia',
                        detail: response.message,
                        life: 3000,
                    });
                }
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

    getPedidosCerrados(item:any) {
        this.pedidosCerrados=[];
        this.pedidosService.postPedidosCerrados(item).subscribe(
            (response) => {
                //console.log(response.data);
                this.pedidosCerrados = response.data;
                if(this.pedidosCerrados.length==0){
                    this.messageService.add({
                        severity: 'warn',
                        summary: 'Advertencia',
                        detail: response.message,
                        life: 3000,
                    });
                }

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

    getPedido(pedido_id:any) {
        if(pedido_id=="" || pedido_id==undefined){
            this.messageService.add({
                severity: 'warn',
                summary: 'Advertencia',
                detail: "Debe Seleccionar una Mesa",
                life: 3000,
            });
            return;
        }
        this.detallesPedido=[];
        this.infoPedido={};
        this.tipopago={};
        this.pedidosService.getById(pedido_id)
        .subscribe(
            (response) => {
                //console.log(response.data);
                //this.clienteDialog=true;
                this.detallesPedido = response.data.detalles;
                this.productosDetalles = this.detallesPedido.map(detalle => ({
                    producto_id: detalle.producto.id,
                    cantidad: detalle.total_cantidad,
                    precio: detalle.precio,
                    subtotal: detalle.total_subtotal
                }));
                this.infoPedido=response.data.pedido;

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

    getHistorialPedidoMesa(data:any) {
        this.pedidosService.postHistorialPedido(data).subscribe(
            (response) => {
                //console.log(response.data);
                this.historial = response.data;
                this.historialDialog=true;
                if(response.message){
                    this.historialDialog=false;
                    this.messageService.add({
                        severity: 'warn',
                        summary: 'Advertencia',
                        detail: response.message,
                        life: 3000,
                    });
                }
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

    crearEntrega(item:any) {
        let itemMesa={
            id:this.mesa_id,
            nombre:this.mesa
        };

        this.pedidosService.postEntregaPedido(item)
        .pipe(finalize(() => this.verPedido(this.mesa_id, this.mesa, this.pedido_id)))
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

    verHistorial(){
        let data={
            mesa_id:this.mesa_id,
            fecha:this.today,
            pedido_id:this.pedido_id,
        };
        this.getHistorialPedidoMesa(data);
    }



cancelarFinalizarPedido() {
    this.displayDialog = false; // Cerrar el diálogo de confirmación
}
confirm1() {

    if (this.pagos.reduce((acc, pago) => acc + pago.valor, 0) !== this.totalpedido) {
        this.messageService.add({
            severity: 'warn',
            summary: 'Advertencia',
            detail: 'La suma de los pagos no es igual al total del pedido.',
            life: 3000,
        });
        return;
    }

    this.confirmationService.confirm({
        message: '¿Está seguro de GENERAR la Venta ?',
        header: 'Confirmación',
        icon: 'pi pi-exclamation-triangle',
        acceptLabel: 'Aceptar', // Texto del botón Aceptar
        rejectLabel: 'Cancelar', // Texto del botón Cancelar
        accept: () => {
            this.finalizarVenta();
        },
        reject: (type) => {
            switch (type) {
                case ConfirmEventType.REJECT:
                    this.disableButton=false;
                    break;
                case ConfirmEventType.CANCEL:
                    break;
            }
        }
    });
}

verPedido(id:any, nombre:string, idpedido:any){
    this.mesa_id=id;
    this.mesa=nombre;
    this.pedido_id=idpedido;
    let data={
        mesa_id:this.mesa_id,
        pedido_id:this.pedido_id,
        estadopedido_id:2, //CERRADO
        entregado:1 //ENTREGADO
    };
    //this.getDetallePedidoMesa(data);
    this.getPedido(idpedido);
    this.disableButton=true;
    this.pagos=[];

}

entregarPedido(item:any){
    let user_id=localStorage.getItem('user_id');
    let data={
        user_id,
        detallepedido_id:item.id,
        cantidad: item.cantidad,
        tipomovimiento:item.tipo
    };
    this.crearEntrega(data);
}

calcularTotal() {
    this.totalpedido=this.detallesPedido.reduce(
        (total, detalle) => Number(total) + Number(detalle.total_subtotal),
        0
    );
    this.totalcantidad=this.detallesPedido.reduce(
        (total, detalle) => Number(total) + Number(detalle.total_cantidad),
        0
    );
    return this.totalpedido;
}

compararValor() {
    if (this.venta.valor > this.calcularTotal()) {
        this.messageService.add({
            severity: 'warn',
            summary: 'Advertencia',
            detail: 'El valor ingresado excede el total del pedido.',
            life: 3000,
        });
    }
}
agregarPago() {
    if (this.tipopago.id =="" || this.tipopago.id==undefined) {
        this.messageService.add({
            severity: 'warn',
            summary: 'Advertencia',
            detail: 'Debe Seleccionar un Tipo de Pago',
            life: 3000,
        });
        return;
    }
    if (this.venta.valor =="" || this.venta.valor==undefined) {
        this.messageService.add({
            severity: 'warn',
            summary: 'Advertencia',
            detail: 'Debe Ingresar un Valor',
            life: 3000,
        });
        return;
    }
    if (this.venta.valor <= 0) {
        this.messageService.add({
            severity: 'warn',
            summary: 'Advertencia',
            detail: 'El valor debe ser mayor que cero.',
            life: 3000,
        });
        return;
    }

    if (this.venta.valor > this.calcularTotal()) {
        this.messageService.add({
            severity: 'warn',
            summary: 'Advertencia',
            detail: 'El valor ingresado excede el total del pedido.',
            life: 3000,
        });
        return;
    }

    this.pagos.push({
        tipopago_id: this.tipopago.id, // Asumiendo que tipopago_id se establece en el componente
        tipo: this.tipopago.nombre, // Asumiendo que tipopago_id se establece en el componente
        valor: this.venta.valor
    });

    this.venta.valor = 0; // Reiniciar el valor después de agregar el pago
    this.messageService.add({
        severity: 'success',
        summary: 'Éxito',
        detail: 'Pago agregado correctamente.',
        life: 3000,
    });
}

quitarPago(pago: any) {
    this.pagos = this.pagos.filter(p => p !== pago);
    this.messageService.add({
        severity: 'success',
        summary: 'Éxito',
        detail: 'Pago eliminado correctamente.',
        life: 3000,
    });
}

finalizarVenta() {
    this.venta.user_id = localStorage.getItem('user_id');
    this.venta.cliente_id = 1;
    this.venta.fecha = this.today;
    this.venta.total = this.totalpedido;
    this.venta.cantidad = this.totalcantidad;
    this.venta.pedido_id = this.pedido_id;
    this.venta.detalles = this.productosDetalles;
    this.venta.pagos = this.pagos;
    this.venta.observaciones = this.observaciones;
    this.loading = true;
    this.disableButton = false;

    setTimeout(() => {
        this.ventasService.postData(this.venta)
            .subscribe(
                (response) => {
                    let severity = '';
                    let summary = '';
                    if (response.isSuccess == true) {
                        this.ventaReport = response.data;
                        severity = 'success';
                        summary = 'Exitoso';
                        // Imprimir ticket automáticamente
                        setTimeout(() => {
                            const ticketElement = document.getElementById('ticket-pos');
                            if (ticketElement) {
                                const printWindow = window.open('', '_blank');
                                printWindow.document.write('<html><head><title>Ticket de Venta</title>');
                                printWindow.document.write('<style>body { font-family: monospace; }</style>');
                                printWindow.document.write('</head><body>');
                                printWindow.document.write(ticketElement.innerHTML);
                                printWindow.document.write('</body></html>');
                                printWindow.document.close();
                                printWindow.print();
                            }
                            this.consultar();
                        }, 500);
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
                    this.loading = false;

                },
                (error) => {
                    this.messageService.add({
                        severity: 'error',
                        summary: 'Advertencia',
                        detail: "Error Verificar Datos",
                        life: 3000,
                    });
                    this.loading = false;
                }
            );
    }, 2000);
}

get saldo(): number {
    return this.calcularTotal() - this.pagos.reduce((acc, pago) => acc + pago.valor, 0);
}
agregarPagoTotal() {
    if (!this.tipopago.nombre) {
        this.messageService.add({
            severity: 'warn',
            summary: 'Advertencia',
            detail: 'Debe seleccionar el tipo de pago.',
            life: 3000,
        });
        return;
    }

    const totalPagos = this.pagos.reduce((acc, pago) => acc + pago.valor, 0);
    const saldoPendiente = this.calcularTotal() - totalPagos;

    if (saldoPendiente <= 0) {
        this.messageService.add({
            severity: 'warn',
            summary: 'Advertencia',
            detail: 'No hay saldo pendiente para agregar un pago total.',
            life: 3000,
        });
        return;
    }

    this.pagos.push({
        tipopago_id: this.tipopago.id, // Usar el tipo de pago seleccionado
        tipo: this.tipopago.nombre, // Usar el tipo de pago seleccionado
        valor: saldoPendiente
    });
}
calcularCambio(): number {
    const totalPagos = this.pagos.reduce((acc, pago) => acc + pago.valor, 0);
    const saldoPendiente = this.calcularTotal() - totalPagos;

    if (saldoPendiente < 0) {
        return Math.abs(saldoPendiente); // Retorna el cambio a devolver
    }
    return 0; // No hay cambio si el saldo pendiente es 0 o positivo
}


}
