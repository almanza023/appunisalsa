import { Component, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ConfirmationService, ConfirmEventType, MessageService } from 'primeng/api';
import { Table } from 'primeng/table';
import { finalize } from 'rxjs';
import { MesasService } from 'src/app/core/services/mesas.service';
import { PedidosService } from 'src/app/core/services/pedidos.service';
import { ProductosService } from 'src/app/core/services/productos.service';
import { SelectorMesaComponent } from 'src/app/shared/components/selector-mesa/selector-mesa.component';

@Component({
    selector: 'app-confirmar-pedidos',
    templateUrl: './confirmar-pedidos.component.html',
    providers: [MessageService, ConfirmationService],
})
export class ConfirmarPedidosComponent implements OnInit {

    detalles: any = [];
    detallesPedido: any = [];
    historial: any = [];
    mesas: any[] = [];
    infoPedido:any={};


    displayDialog: boolean = false; // Variable para controlar la visibilidad del diálogo
    productos: any[] = []; // Lista de productos disponibles para agregar
    today:any="" // Inicializa la variable today con la fecha actual
    mesa_id:any;
    pedido_id:any;
    mesa:string="";
    historialDialog:boolean=false;
    clienteDialog:boolean=false;
    totalpedido:any=0;
    totalcantidad:any=0;



    constructor(
        private productoService: ProductosService,
        private pedidosService: PedidosService,
        private mesaService: MesasService,
        private messageService: MessageService,
        private router: Router,
        private route: ActivatedRoute,
        private confirmationService: ConfirmationService
    ) {}

    @ViewChild(SelectorMesaComponent) mesaComponent: SelectorMesaComponent;

    ngOnInit() {
        this.getMesas();
        this.today = this.formatDate(new Date());
    }

    formatDate(date: Date): string {
        const day = String(date.getDate()).padStart(2, '0');
        const month = String(date.getMonth() + 1).padStart(2, '0'); // Los meses son 0-indexados
        const year = date.getFullYear();
        return `${year}-${month}-${day}`;
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

    getMesas() {
        this.mesas=[];
        this.mesaService.getMesasPedidosActivos().subscribe(
            (response) => {
                //console.log(response.data);
                this.mesas = response.data;
                if(this.mesas.length==0){
                    this.mesa_id="";
                    this.mesa="";
                    this.pedido_id="";
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

        this.pedidosService.getById(pedido_id)
        .subscribe(
            (response) => {
                //console.log(response.data);
                this.clienteDialog=true;
                this.detallesPedido = response.data.detalles;
                this.infoPedido=response.date.pedido;
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
confirm1(item: any) {
    let cantidad= item.cantidad;
    let producto= item.producto?.nombre;
    let tipo="";
    if(cantidad>0){
        tipo="ENTREGAR"
        item.tipo=2;
    }else{
        tipo="DEVOLVER";
        cantidad=(cantidad)*-1;
        item.tipo=1;
        item.cantidad=cantidad;
    }
    this.confirmationService.confirm({
        message: '¿Está seguro de '+tipo+' '+cantidad+ ' '+producto+ ' ?',
        header: 'Confirmación',
        icon: 'pi pi-exclamation-triangle',
        acceptLabel: 'Aceptar', // Texto del botón Aceptar
        rejectLabel: 'Cancelar', // Texto del botón Cancelar
        accept: () => {
            this.entregarPedido(item);
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

verPedido(id:any, nombre:string, idpedido:any){
    this.mesa_id=id;
    this.mesa=nombre;
    this.pedido_id=idpedido;
    let data={
        mesa_id:this.mesa_id,
        pedido_id:this.pedido_id,
        fecha:this.today,
        estadopedido_id:1, //CERRADO
        entregado:0 //ENTREGADO
    };
    this.getDetallePedidoMesa(data);
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

confirmTodos() {
    this.confirmationService.confirm({
        message: '¿Está seguro de entregar todos los productos para la ' + this.mesa + ' ?',
        header: 'Confirmación',
        icon: 'pi pi-exclamation-triangle',
        acceptLabel: 'Aceptar', // Texto del botón Aceptar
        rejectLabel: 'Cancelar', // Texto del botón Cancelar
        accept: () => {
            this.crearEntregaTodos();
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

crearEntregaTodos() {
    let itemMesa={
        id:this.mesa_id,
        nombre:this.mesa
    };
    let user_id=localStorage.getItem('user_id');
    let data={
        user_id,
        pedido_id:this.pedido_id,
    };

    this.pedidosService.postEntregaTodos(data)
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

}
