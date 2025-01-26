import { Component, SimpleChanges, ViewChild } from '@angular/core';
import { ConfirmationService, ConfirmEventType, MessageService } from 'primeng/api';
import { finalize } from 'rxjs';
import { AperturaCajaService } from 'src/app/core/services/apertura-caja.service';


@Component({
  selector: 'app-reporte-dia',
  templateUrl: './reporte-dia.component.html',
  providers: [MessageService, ConfirmationService],
})
export class ReporteDiaComponent {

    nombreModulo:string="Reporte Día"
     today:any=""
    todayF:any=""
    fecha_cierre:any="";
    data:any={};
    filter:any={};
    historialDialog:boolean=false;
    historial:any=[];
    dataReport:any;

    ngOnInit(): void {
        this.today = this.formatDate(new Date());
        this.todayF = this.formatDate(new Date(Date.now() + 86400000)); // Sumar 1 día a la fecha actual
        this.filter.fechaInicio = this.today;
        this.filter.fechaFinal=this.todayF;
        this.getData(this.filter);
    }

    constructor(
        private service: AperturaCajaService,
        private messageService: MessageService,
        private confirmationService: ConfirmationService
    ) {}

    formatDate(date: Date): string {
        const day = String(date.getDate()).padStart(2, '0');
        const month = String(date.getMonth() + 1).padStart(2, '0'); // Los meses son 0-indexados
        const year = date.getFullYear();
        return `${year}-${month}-${day}`;
    }


    consultar(){
        if(!this.today){
            this.messageService.add({
                severity: 'warn',
                summary: 'Advertencia',
                detail:"Debe seleccionar una Fecha de Inicio",
                life: 3000,
            });
            return;
        }

        if(!this.todayF){
            this.messageService.add({
                severity: 'warn',
                summary: 'Advertencia',
                detail:"Debe seleccionar una Fecha de Final",
                life: 3000,
            });
            return;
        }



    }

    getData(item:any) {
        this.data=[];
        this.service.postDia(item).subscribe(
            (response) => {
                //console.log(response.data);
                this.data = response.data;




                if(this.data.length==0){
                    this.messageService.add({
                        severity: 'warn',
                        summary: 'Advertencia',
                        detail:"No Existen Datos",
                        life: 3000,
                    });
                    return;
                }else{
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
                        pedidos:this.data.ventas.reduce((acc:any, curr:any) => {
                            const usuario = curr.user?.nombre;
                            const exist = acc.find((item:any) => item.usuario === usuario);
                            if(exist){
                                exist.totalpedidos++;
                            }else{
                                acc.push({
                                    usuario,
                                    totalpedidos:1,
                                });
                            }
                            return acc;
                        },[]),
                        gastos: this.data.gastos.map((g:any) => {
                            return {
                                tipo:g.tipogasto?.nombre,
                                fecha:g.created_at,
                                total:g.valortotal,
                            }
                        }),
                        pagos:this.data.pagos,
                        productos:this.data.ventas.reduce((acc:any, curr:any) => {
                            curr.detalles.forEach((d:any) => {
                                const exist = acc.find((item:any) => item.producto_id === d.producto_id);
                                if(exist){
                                    exist.cantidad += d.cantidad;
                                }else{
                                    acc.push({
                                        producto_id:d.producto_id,
                                        nombre:d.producto?.nombre,
                                        cantidad:d.cantidad,
                                        stock_actual:d.producto?.stock_actual,
                                    });
                                }
                            });
                            return acc;
                        },[]),

                    };
                    console.log(this.dataReport);
                }

            },
            (error) => {
                this.messageService.add({
                    severity: 'warn',
                    summary: 'Advertencia',
                    detail:"Error al obtener datos",
                    life: 3000,
                });
            }
        );
    }

    cerrarCaja(item:any){
        if(!this.today){
            this.messageService.add({
                severity: 'warn',
                summary: 'Advertencia',
                detail:"Debe seleccionar una Fecha de Cierre de Caja",
                life: 3000,
            });
            return;
        }

        let user_id=localStorage.getItem('user_id');
        let data={
            user_id,
            fecha_cierre:this.today,
            caja_id:item.caja_id,
            monto_final:(item.base_inicial + item.totalventas)-item.totalgastos,
            totalgastos:item.totalgastos,
            totalventas:item.totalventas,
            utilidad:item.totalneto,
        }

        this.service.putData(data.caja_id, data)
        .pipe(finalize(() => this.getData(this.filter)))
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
                    severity: 'error',
                    summary: 'Advertencia',
                    detail: "Error al Enviar Datos",
                    life: 3000,
                });
            }
        );
    }

    confirm1(item:any) {

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
            }
        });
    }

    verHistorialVentas(){
        this.historialDialog=true;
        this.historial=this.data.ventas;
    }

    verHistorialGastos(){
        this.historialDialog=true;
        this.historial=this.data.gastos;
    }


    reloadPage(){
        this.getData(this.filter);
    }


}
