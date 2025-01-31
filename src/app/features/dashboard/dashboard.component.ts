import { Component, OnInit, OnDestroy } from '@angular/core';
import { MenuItem, MessageService } from 'primeng/api';
import { Subscription, finalize } from 'rxjs';
import { LayoutService } from 'src/app/layout/service/app.layout.service';
import { ProductosService } from 'src/app/core/services/productos.service';
import { AperturaCajaService } from 'src/app/core/services/apertura-caja.service';
import { Router } from '@angular/router';
import { MesasService } from 'src/app/core/services/mesas.service';

@Component({
    templateUrl: './dashboard.component.html',
    providers: [MessageService],
})
export class DashboardComponent implements OnInit, OnDestroy {

    items!: MenuItem[];
    detalle:any={};
    totalPedidosPendientes: number = 0;
    totalPedidosEntregados: number = 0;
    pedidosActivos: any[] = [];
    rol = localStorage.getItem('rol');
    totalVentasDia: number = 0;
    productosBajosStock: number = 0;
    pedidos:any=[];
    productos:any=[];
    constructor(
        private service: AperturaCajaService,
         public layoutService: LayoutService,
         public messageService: MessageService,
         public productoService: ProductosService,
         private mesaService: MesasService,
         private router: Router,
         ) {

    }

    ngOnInit() {
        this.getDataAll();
        this.getProductosInventario();

    }


    nuevoPedido(){
        this.router.navigate(['/pedidos/registro/0']);
    }
    verPedidos(){
        this.router.navigate(['/pedidos']);
    }

    verReporteDia() {
        // Implementar navegación al reporte del día
        this.router.navigate(['/reportes/dia']);
    }

    gestionarProductos() {
        this.router.navigate(['/productos']);
    }

    gestionarUsuarios() {
        this.router.navigate(['/usuarios']);
    }

    getDataAll() {
        let rol = localStorage.getItem('rol');
        let user_id = localStorage.getItem('user_id');
        const hoy = new Date();
        const fechaActual = hoy.getFullYear() + '-' +
                           String(hoy.getMonth() + 1).padStart(2,'0') + '-' +
                           String(hoy.getDate()).padStart(2,'0');
        const manana = new Date(hoy);
        manana.setDate(manana.getDate() + 1);
        const fechaSiguiente = manana.getFullYear() + '-' +
                             String(manana.getMonth() + 1).padStart(2,'0') + '-' +
                             String(manana.getDate()).padStart(2,'0');
        let data={
            fecha_inicio:fechaActual,
            fecha_final:fechaSiguiente,
            rol:rol,
            user_id
        };

        this.service.getEstadisticas(data)
        .pipe(finalize(() => this.getPedidosAbiertos()))
        .subscribe(
            (response) => {
                this.detalle = response.data;
                this.totalPedidosPendientes=response.data.totalPedidos;
                this.totalVentasDia=response.data.totalVentas;
                this.totalPedidosEntregados=response.data.totalPedidosCerrados;
                this.productosBajosStock=response.data.totalProductos;
            },
            (error) => {
                this.messageService.add({
                    severity: 'error',
                    summary: 'Advertencia',
                    detail: "Error al Obtener datod",
                    life: 3000,
                });
            }
        );
    }

    getPedidosAbiertos() {
        this.mesaService.getMesasPedidosActivos().subscribe(
            (response) => {
                //console.log(response.data);
                this.pedidos = response.data;
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

    ngOnDestroy(): void {

    }

    getPedido(id:any){
        this.router.navigate(['/pedidos/registro/'+id]);
    }

    getProductosInventario() {
        this.productoService.getProductoInventario().subscribe(
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


}
