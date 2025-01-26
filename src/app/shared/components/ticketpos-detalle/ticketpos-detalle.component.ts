import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'app-ticketpos-detalle',
  templateUrl: './ticketpos-detalle.component.html'
})
export class TicketPosDetalleComponent implements OnInit {

  tienda: string = 'LA U DE LA SALSA';
    direccion: string = 'Dirección Tienda';
    telefono: string = '123456789';
    @Input() data: any = 0;
  constructor() { }

  ngOnInit() {
  }

  printTicket() {
    const printContent = document.getElementById('ticket-pos');
    const windowPrint = window.open('', '', 'width=600,height=800');
    if (windowPrint && printContent) {
      windowPrint.document.write(`
        <html>
        <head>
          <title>Factura</title>
          <style>
            @media print {
              body { font-size: 10px; -webkit-print-color-adjust: exact; }
              .ticket { width: 280px; margin: 0 auto; text-align: center; }
              .ticket h1 { margin: 0; font-size: 14px; }
              .ticket p { margin: 1px 0; }
              .ticket hr { border: none; border-top: 1px solid #000; margin: 3px 0; }
              .ticket .items { text-align: left; margin: 3px 0; }
              .ticket .items table { width: 100%; border-collapse: collapse; }
              .ticket .items table td { padding: 1px 0; }
              .ticket .total { text-align: right; margin-top: 3px; }
            }
          </style>
        </head>
        <body>
          ${printContent.outerHTML}
        </body>
        </html>
      `);
      windowPrint.document.close();
      windowPrint.focus();
      windowPrint.print();
      windowPrint.close();
    }
  }

}
