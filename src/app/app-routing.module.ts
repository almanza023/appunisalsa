
import { RouterModule } from '@angular/router';
import { NgModule } from '@angular/core';
import { NotfoundComponent } from './shared/components/notfound/notfound.component';
import { AppLayoutComponent } from "./layout/app.layout.component";
import { AuthGuard } from './core/guards/auth.guard';
import { AdminGuard } from './core/guards/admin.guard';

@NgModule({
    imports: [
        RouterModule.forRoot([
            {
                path: '', component: AppLayoutComponent,
                children: [

                    {
                        path: 'dashboard', loadChildren: () => import('./features/dashboard/dashboard.module').then(m => m.DashboardModule),
                        canActivate: [AuthGuard]
                    },
                    {
                        path: 'clientes', loadChildren: () => import('./features/clientes/clientes.module').then(m => m.ClienteModule),
                        canActivate: [AuthGuard]
                    },
                    {
                        path: 'compras', loadChildren: () => import('./features/compras/compras.module').then(m => m.ComprasModule),
                        canActivate: [AuthGuard]
                    },
                    {
                        path: 'categorias', loadChildren: () => import('./features/categorias/categorias.module').then(m => m.CategoriasModule),
                        canActivate: [AuthGuard,AdminGuard]
                    },
                    {
                        path: 'proveedores', loadChildren: () => import('./features/proveedores/proveedores.module').then(m => m.ProveedorModule),
                        canActivate: [AuthGuard]
                    },
                    {
                        path: 'pedidos', loadChildren: () => import('./features/pedidos/pedidos.module').then(m => m.PedidosModule),
                        canActivate: [AuthGuard]
                    },
                    {
                        path: 'productos', loadChildren: () => import('./features/productos/productos.module').then(m => m.ProductosModule),
                        canActivate: [AuthGuard]
                    },
                    {
                        path: 'mesas', loadChildren: () => import('./features/mesas/mesas.module').then(m => m.MesasModule),
                        canActivate: [AuthGuard,AdminGuard]
                    },
                    {
                        path: 'tipo-gastos', loadChildren: () => import('./features/tipo-gastos/tipo-gastos.module').then(m => m.TipoGastoModule),
                        canActivate: [AuthGuard,AdminGuard]
                    },
                    {
                        path: 'tipo-pagos', loadChildren: () => import('./features/tipo-pagos/tipo-pagos.module').then(m => m.TipoPagoModule),
                        canActivate: [AuthGuard]
                    },
                    {
                        path: 'apertura-caja', loadChildren: () => import('./features/apertura-caja/apertura-caja.module').then(m => m.AperturaCajaModule),
                        canActivate: [AuthGuard]
                    },
                    {
                        path: 'usuarios', loadChildren: () => import('./features/usuarios/usuarios.module').then(m => m.UsuariosModule),
                        canActivate: [AuthGuard,AdminGuard]
                    },
                    {
                        path: 'pedidos', loadChildren: () => import('./features/pedidos/pedidos.module').then(m => m.PedidosModule),
                        canActivate: [AuthGuard]
                    },
                    {
                        path: 'ventas', loadChildren: () => import('./features/ventas/ventas.module').then(m => m.VentasModule),
                        canActivate: [AuthGuard]
                    },
                    {
                        path: 'gastos', loadChildren: () => import('./features/gastos/gastos.module').then(m => m.GastosModule),
                        canActivate: [AuthGuard]
                    },
                    {
                        path: 'cambiar-clave', loadChildren: () => import('./features/cambiar-clave/cambiar-clave.module').then(m => m.CambiarClaveModule),
                        canActivate: [AuthGuard]
                    },
                    {
                        path: 'reportes', loadChildren: () => import('./features/reportes/reportes.module').then(m => m.ReportesModule),
                        canActivate: [AuthGuard]
                    },


                ]
            },
            { path: 'auth', loadChildren: () => import('./features/auth/auth.module').then(m => m.AuthModule) },
            { path: 'notfound', component: NotfoundComponent },
            { path: '**', redirectTo: '/notfound' },
        ], { scrollPositionRestoration: 'enabled', anchorScrolling: 'enabled', onSameUrlNavigation: 'reload' })
    ],
    exports: [RouterModule]
})
export class AppRoutingModule {
}
