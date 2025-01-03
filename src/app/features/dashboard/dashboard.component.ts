import { Component, OnInit, OnDestroy } from '@angular/core';
import { MenuItem, MessageService } from 'primeng/api';
import { Subscription, finalize } from 'rxjs';
import { LayoutService } from 'src/app/layout/service/app.layout.service';
import { ProductosService } from 'src/app/core/services/productos.service';
import { AperturaCajaService } from 'src/app/core/services/apertura-caja.service';
import { Router } from '@angular/router';

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

    constructor(
        private service: AperturaCajaService,
         public layoutService: LayoutService,
         public messageService: MessageService,
         private router: Router,
         ) {

    }

    ngOnInit() {
        this.getDataAll();

    }

    getPedidosPendientes() {
        // Implementar llamada al servicio para obtener pedidos pendientes
        this.totalPedidosPendientes = 0; // Actualizar con datos reales
    }

    getPedidosEntregados() {
        // Implementar llamada al servicio para obtener pedidos entregados
        this.totalPedidosEntregados = 0; // Actualizar con datos reales
    }

    getPedidosActivos() {
        // Implementar llamada al servicio para obtener pedidos activos
        this.pedidosActivos = []; // Actualizar con datos reales
    }

    verPedido(pedidoId: number) {
        // Implementar navegación para ver detalle del pedido
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
    configuracion(){

    }

    ngOnDestroy() {

    }

    getDataAll() {
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
            fechaInicio:fechaActual,
            fechaFin:fechaSiguiente,
        };

        this.service.getEstadisticas(data).subscribe(
            (response) => {
                console.log(response.data);
                this.detalle = response.data;
                this.totalPedidosPendientes=response.data.totalPedidos;
                this.totalVentasDia=response.data.totalVentas;
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


}
