import { OnInit } from '@angular/core';
import { Component } from '@angular/core';
import { LayoutService } from './service/app.layout.service';
import { MenuItem } from 'primeng/api';

@Component({
    selector: 'app-menu',
    templateUrl: './app.menu.component.html'
})
export class AppMenuComponent implements OnInit {

    items: MenuItem[] = [];

    constructor(public layoutService: LayoutService) { }

    ngOnInit() {
        let rol=localStorage.getItem('rol');
        this.items = [
            {
                label: 'Inicio',
                icon: 'pi pi-fw pi-file',
                routerLink: 'dashboard',
            },
        ];

        let configuraciones= {
            label: 'Configuraciones',
            icon: 'pi pi-fw pi-pencil',
            items: [
                {
                    label: 'Categorias',
                    icon: 'pi pi-fw pi-align-justify',
                    routerLink: 'categorias',

                },
                {
                    label: 'Tipo Pagos',
                    icon: 'pi pi-fw pi-align-justify',
                    routerLink: 'tipo-pagos',

                },
                {
                    label: 'Tipo Gastos',
                    icon: 'pi pi-fw pi-align-justify',
                    routerLink: 'tipo-gastos',
                },
                {
                    label: 'Mesas',
                    icon: 'pi pi-fw pi-align-justify',
                    routerLink: 'mesas',
                },
                {
                    label: 'Proveedores',
                    icon: 'pi pi-fw pi-align-justify',
                    routerLink: 'proveedores',
                },
                {
                    label: 'Usuarios',
                    icon: 'pi pi-fw pi-align-justify',
                    routerLink: 'usuarios',
                },
            ]
        };
        let operaciones=
            {
                label: 'Operaciones',
                icon: 'pi pi-plus',
                items: [
                    {
                        label: 'Apertura de Caja',
                        icon: 'pi pi-fw pi-align-justify',
                        routerLink: 'apertura-caja',

                    },
                    {
                        label: 'Clientes',
                        icon: 'pi pi-fw pi-align-justify',
                        routerLink: 'clientes',

                    },
                    {
                        label: 'Productos',
                        icon: 'pi pi-fw pi-align-justify',
                        routerLink: 'productos',

                    },
                    {
                        label: 'Pedidos',
                        icon: 'pi pi-fw pi-align-justify',
                        routerLink: 'pedidos',
                    },
                    {
                        label: 'Entregas',
                        icon: 'pi pi-fw pi-align-justify',
                        routerLink: 'pedidos/confirmar',
                    },
                    {
                        label: 'Facturar',
                        icon: 'pi pi-fw pi-align-justify',
                        routerLink: 'ventas/registro',
                    },
                    {
                        label: 'Ventas',
                        icon: 'pi pi-fw pi-align-justify',
                        routerLink: 'ventas',
                    },
                    {
                        label: 'Gastos',
                        icon: 'pi pi-fw pi-align-justify',
                        routerLink: 'gastos',
                    },
                    {
                        label: 'Compras',
                        icon: 'pi pi-fw pi-align-justify',
                        routerLink: 'compras',
                    },
                ]
            };

            let operacionesCaja=
            {
                label: 'Operaciones',
                icon: 'pi pi-plus',
                items: [
                    {
                        label: 'Apertura de Caja',
                        icon: 'pi pi-fw pi-align-justify',
                        routerLink: 'apertura-caja',

                    },
                    {
                        label: 'Productos',
                        icon: 'pi pi-fw pi-align-justify',
                        routerLink: 'productos',

                    },
                    {
                        label: 'Pedidos',
                        icon: 'pi pi-fw pi-align-justify',
                        routerLink: 'pedidos',
                    },
                    {
                        label: 'Entregas',
                        icon: 'pi pi-fw pi-align-justify',
                        routerLink: 'pedidos/confirmar',
                    },
                    {
                        label: 'Facturar',
                        icon: 'pi pi-fw pi-align-justify',
                        routerLink: 'ventas/registro',
                    },
                    {
                        label: 'Ventas',
                        icon: 'pi pi-fw pi-align-justify',
                        routerLink: 'ventas',
                    },
                    {
                        label: 'Gastos',
                        icon: 'pi pi-fw pi-align-justify',
                        routerLink: 'gastos',
                    },

                ]
            };

            let operacionesMesa=
            {
                label: 'Operaciones',
                icon: 'pi pi-plus',
                items: [
                    {
                        label: 'Pedidos',
                        icon: 'pi pi-fw pi-align-justify',
                        routerLink: 'pedidos',
                    },
                    {
                        label: 'Nuevo Pedido',
                        icon: 'pi pi-fw pi-align-justify',
                        routerLink: 'pedidos/registro/0',
                    },
                ]
            };

            let reportes=
            {
                label: 'Reportes',
                icon: 'pi pi-chart-bar',
                items: [
                    {
                        label: 'Reporte Día',
                        icon: 'pi pi-fw pi-align-justify',
                        routerLink: 'reportes/dia',

                    },

                ]
            };



            let perfil =
            {
                label: 'Perfil',
                icon: 'pi pi-users',
                routerLink: 'cambiar-clave',
            };

            let cerrar =
                {
                    label: 'Cerrar Sesión',
                    icon: 'pi pi-sign-out',
                    routerLink: 'auth',
                };

        if(localStorage.getItem('rol') == '1') {
            this.items.push(configuraciones);
            this.items.push(operaciones);
            this.items.push(reportes);
        }else if (localStorage.getItem('rol') == '2'){
            this.items.push(operacionesMesa);
            //this.items.push(reportes);
        }
        else if (localStorage.getItem('rol') == '3'){
            this.items.push(operacionesCaja);
            this.items.push(reportes);
        }
        this.items.push(perfil);
        this.items.push(cerrar);





    }
}
