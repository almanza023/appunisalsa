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
    ngOnInit(): void {
        this.today = this.formatDate(new Date());
        this.todayF = this.formatDate(new Date(Date.now() + 86400000)); // Sumar 1 día a la fecha actual
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

        this.filter.fechaInicio = this.formatDate(new Date(Date.parse(this.today) + 86400000));
        this.filter.fechaFinal=this.formatDate(new Date(Date.parse(this.todayF) + 86400000));
        this.getData(this.filter);

    }

    getData(item:any) {
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
            fecha_cierre:this.formatDate(new Date(Date.parse(this.todayF) + 86400000)),
            caja_id:item.caja_id,
            monto_final:(item.base_inicial + item.totalventas)-item.totalgastos,
            totalgastos:item.totalgastos,
            totalventas:item.totalventas,
            utilidad:item.totalneto,
        }

        this.service.putData(data.caja_id, data)
        .pipe(finalize(() => this.consultar()))
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




}
