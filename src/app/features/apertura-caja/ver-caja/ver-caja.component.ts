import { Component, OnInit } from '@angular/core';
import {
    ConfirmationService,
    ConfirmEventType,
    MessageService,
} from 'primeng/api';
import { DialogService } from 'primeng/dynamicdialog';
import { finalize } from 'rxjs';
import { AperturaCajaService } from 'src/app/core/services/apertura-caja.service';

@Component({
    selector: 'app-ver-caja',
    templateUrl: './ver-caja.component.html',
    providers: [MessageService, DialogService, ConfirmationService],
})
export class VerCajaComponent implements OnInit {
    cajaAbierta: any;
    data: any;
    cajaId: any;
    dataReport: any;
    rol: any;
    loading: boolean = false;
    today: any = '';
    todayF: any = '';
    filter:any={};

    constructor(
        private cajaService: AperturaCajaService,
        private messageService: MessageService,
        private confirmationService: ConfirmationService
    ) {}

    ngOnInit() {
        this.today = this.formatDate(new Date());
        this.todayF = this.formatDate(new Date(Date.now() + 86400000)); // Sumar 1 día a la fecha actual
        this.filter.fechaInicio = this.today;
        this.filter.fechaFinal = this.todayF;
        this.rol = localStorage.getItem('rol');
        // Verificar si el usuario es cajero (rol 3) y obtener la caja abierta
        if (this.rol == '3') {
            this.loading=true;
            setTimeout(() => {
                this.getCajaAbierta();
                this.loading=false;
            }, 2000);
        }
    }

/**
 * Calcula el total neto a partir de los productos
 * @returns la suma total de los productos
 */
calcularTotalNeto(): number {
  if (!this.data || !this.data.productos || !this.data.productos.length) {
    return 0;
  }

  return this.data.productos.reduce((sum: number, producto: any) => {
    return sum + (Number(producto.total) || 0);
  }, 0);
}


    formatDate(date: Date): string {
        const day = String(date.getDate()).padStart(2, '0');
        const month = String(date.getMonth() + 1).padStart(2, '0'); // Los meses son 0-indexados
        const year = date.getFullYear();
        return `${year}-${month}-${day}`;
    }

    getCajaAbierta() {
        this.cajaService.getCajaAbierta().subscribe(
            (response: any) => {
                if (response && response.data) {
                    this.cajaAbierta = response.data;
                    this.cajaId = this.cajaAbierta.id;
                    this.getCajaPorId();
                }
            },
            (error) => {
            this.messageService.add({
                severity: 'error',
                summary: 'Error',
                detail: 'No se pudo obtener la información de la caja abierta'
            });

            }
        );
    }

    getCajaPorId() {
        if (!this.cajaId) {
            this.messageService.add({
                severity: 'warn',
                summary: 'Advertencia',
                detail: 'Debe ingresar un ID de caja válido'
            });
            return [];
        }

        this.data = [];
        return this.cajaService.getReporteCaja({ caja_id: this.cajaId }).subscribe(
            (response: any) => {
                if (response && response.data) {
                    this.data = response.data;
                    // Procesar los datos para obtener el resumen de ventas por usuario
                    if (this.data.ventas ) {
                        const ventasPorUsuario = this.data.ventas.reduce(
                            (acc: any, venta: any) => {
                                const nombreUsuario =
                                    venta.pedido?.user?.nombre ||
                                    'Usuario desconocido';
                                if (!acc[nombreUsuario]) {
                                    acc[nombreUsuario] = {
                                        nombre: nombreUsuario,
                                        total: 0,
                                        cantidad: 0,
                                    };
                                }
                                acc[nombreUsuario].total += Number(venta.total) || 0;
                                acc[nombreUsuario].cantidad += 1;
                                return acc;
                            },
                            {}
                        );

                        this.data.resumenPorUsuario =
                            Object.values(ventasPorUsuario);

                        this.dataReport = {
                                caja_id:this.data.caja_id,
                                fecha_inicio:this.data.fecha_inicio,
                                base_inicial:this.data.base_inicial,
                                totalventas:this.data.totalventas,
                                totalgastos:this.data.totalgastos,
                                totalneto:this.data.totalneto,
                                ventas: this.data.ventas.map((v:any) => {
                                    return {
                                        fecha:v.created_at,
                                        comanda:v.pedido?.comanda,
                                        total:v.total,
                                    }
                                }),
                                pedidos:Object.values(ventasPorUsuario),
                                gastos: this.data.gastos.map((g:any) => {
                                    return {
                                        tipo:g.tipogasto?.nombre,
                                        fecha:g.created_at,
                                        total:g.valortotal,
                                    }
                                }),
                                pagos:this.data.pagos,
                                productos:this.data.productos,
                                total_especiales:this.data.total_especiales,
                            };
                    }
                }
            },
            (error) => {
                console.error('Error al obtener datos de caja:', error);
            }
        );

    }

    confirm1(item: any) {
        this.confirmationService.confirm({
            message: '¿Está seguro de CERRAR la Caja ?',
            header: 'Confirmación',
            icon: 'pi pi-exclamation-triangle',
            acceptLabel: 'Aceptar', // Texto del botón Aceptar
            rejectLabel: 'Cancelar', // Texto del botón Cancelar
            accept: () => {
                this.cerrarCaja(item);
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

    cerrarCaja(item: any) {
        if (!this.today) {
            this.messageService.add({
                severity: 'warn',
                summary: 'Advertencia',
                detail: 'Debe seleccionar una Fecha de Cierre de Caja',
                life: 3000,
            });
            return;
        }

        let user_id = localStorage.getItem('user_id');
        let data = {
            user_id,
            fecha_cierre: this.today,
            caja_id: item.caja_id,
            monto_final:
                item.base_inicial + item.totalventas - item.totalgastos,
            totalgastos: item.totalgastos,
            totalventas: item.totalventas,
            utilidad: item.totalneto,
        };
        this.loading = true;
        setTimeout(() => {
            this.cajaService
                .putData(data.caja_id, data)
                .pipe(finalize(() => this.getCajaPorId()))
                .subscribe(
                    (response) => {
                        let severity = '';
                        let summary = '';
                        if (response.isSuccess == true) {
                            severity = 'success';
                            summary = 'Exitoso';

                            // Mostrar el ticket de cierre después de cerrar la caja exitosamente
                            const printTicketElement = document.createElement('div');
                            printTicketElement.innerHTML = `<app-ticket-cierre-caja [data]="dataReport"></app-ticket-cierre-caja>`;
                            document.body.appendChild(printTicketElement);
                            setTimeout(() => {
                            const ticketComponent = printTicketElement.querySelector('app-ticket-cierre-caja');
                            if (ticketComponent) {
                                (ticketComponent as any).printTicket();
                            }
                            document.body.removeChild(printTicketElement);
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
                            detail: 'Error al Enviar Datos',
                            life: 3000,
                        });
                        this.loading = false;
                    }
                );
        }, 2000);
    }
}
