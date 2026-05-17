import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

const BRAND   = [249, 115, 22];   // orange-500
const DARK    = [15,  23,  42];   // slate-900
const MUTED   = [100, 116, 139];  // slate-500
const LIGHT   = [248, 250, 252];  // slate-50
const SUCCESS = [22,  163,  74];  // green-600
const WHITE   = [255, 255, 255];

const pkr = (amount) =>
  'Rs. ' + Number(amount || 0).toLocaleString('en-PK', { minimumFractionDigits: 0, maximumFractionDigits: 0 });

export function generateInvoice(order) {
  const doc = new jsPDF({ unit: 'pt', format: 'a4' });
  const W = doc.internal.pageSize.getWidth();
  const H = doc.internal.pageSize.getHeight();
  let y = 0;

  // ── Header band ──────────────────────────────────────────────────────────────
  doc.setFillColor(...BRAND);
  doc.rect(0, 0, W, 72, 'F');

  // Logo mark — hexagon-ish square
  doc.setFillColor(...WHITE);
  doc.roundedRect(36, 18, 36, 36, 6, 6, 'F');
  doc.setFontSize(18);
  doc.setTextColor(...BRAND);
  doc.setFont('helvetica', 'bold');
  doc.text('H', 45, 42);

  // Brand name
  doc.setFontSize(22);
  doc.setTextColor(...WHITE);
  doc.setFont('helvetica', 'bold');
  doc.text('HiveMarket', 82, 38);
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(255, 200, 150);
  doc.text("Pakistan's Premium Online Marketplace", 82, 53);

  // INVOICE label (right side)
  doc.setFontSize(28);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...WHITE);
  doc.text('INVOICE', W - 36, 45, { align: 'right' });

  y = 96;

  // ── Invoice meta row ─────────────────────────────────────────────────────────
  // Left: Invoice # + Date
  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...MUTED);
  doc.text('INVOICE NUMBER', 36, y);
  doc.text('DATE ISSUED', 200, y);
  doc.text('PAYMENT STATUS', 364, y);

  y += 14;
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...DARK);
  doc.text(order.orderNumber || `#${order._id?.slice(-8).toUpperCase()}`, 36, y);
  doc.text(new Date(order.createdAt).toLocaleDateString('en-PK', { dateStyle: 'long' }), 200, y);

  const paid = order.isPaid;
  doc.setTextColor(...(paid ? SUCCESS : [180, 130, 0]));
  doc.text(paid ? '✓  PAID' : 'COD — Unpaid', 364, y);
  doc.setTextColor(...DARK);

  y += 28;
  // Divider
  doc.setDrawColor(230, 230, 230);
  doc.setLineWidth(1);
  doc.line(36, y, W - 36, y);

  y += 24;

  // ── Bill To / Ship To ────────────────────────────────────────────────────────
  const addr = order.shippingAddress || {};

  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...MUTED);
  doc.text('BILLED & SHIPPED TO', 36, y);

  y += 14;
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...DARK);
  doc.text(addr.name || 'Customer', 36, y);

  y += 14;
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(...MUTED);

  const addrLines = [
    addr.street,
    [addr.city, addr.state, addr.zipCode].filter(Boolean).join(', '),
    addr.country,
    addr.phone,
  ].filter(Boolean);

  addrLines.forEach(line => {
    doc.text(line, 36, y);
    y += 14;
  });

  // Right: payment method box
  const boxTop = y - (addrLines.length * 14) - 28;
  doc.setFillColor(...LIGHT);
  doc.roundedRect(W - 200, boxTop, 164, 70, 6, 6, 'F');
  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...MUTED);
  doc.text('PAYMENT METHOD', W - 188, boxTop + 18);
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...DARK);
  const method = order.paymentMethod === 'cod' ? 'Cash on Delivery' : 'Card (Stripe)';
  doc.text(method, W - 188, boxTop + 36);
  if (paid && order.paidAt) {
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(...MUTED);
    doc.text('Paid ' + new Date(order.paidAt).toLocaleDateString(), W - 188, boxTop + 52);
  }

  y += 16;

  // ── Items table ───────────────────────────────────────────────────────────────
  const rows = order.items.map((item, i) => [
    i + 1,
    item.name + (item.variant ? `\n(${item.variant})` : ''),
    item.quantity,
    pkr(item.price),
    pkr(item.price * item.quantity),
  ]);

  autoTable(doc, {
    startY: y,
    margin: { left: 36, right: 36 },
    head: [['#', 'Product', 'Qty', 'Unit Price', 'Subtotal']],
    body: rows,
    styles: {
      fontSize: 10,
      cellPadding: { top: 8, right: 10, bottom: 8, left: 10 },
      textColor: DARK,
      lineColor: [230, 230, 230],
      lineWidth: 0.5,
    },
    headStyles: {
      fillColor: DARK,
      textColor: WHITE,
      fontStyle: 'bold',
      fontSize: 9,
      cellPadding: { top: 10, right: 10, bottom: 10, left: 10 },
    },
    alternateRowStyles: { fillColor: LIGHT },
    columnStyles: {
      0: { cellWidth: 28, halign: 'center' },
      1: { cellWidth: 'auto' },
      2: { cellWidth: 40, halign: 'center' },
      3: { cellWidth: 90, halign: 'right' },
      4: { cellWidth: 90, halign: 'right', fontStyle: 'bold' },
    },
  });

  y = doc.lastAutoTable.finalY + 20;

  // ── Totals block ──────────────────────────────────────────────────────────────
  const totalsX = W - 36 - 220;

  const addRow = (label, value, bold = false, color = DARK) => {
    doc.setFont('helvetica', bold ? 'bold' : 'normal');
    doc.setFontSize(bold ? 11 : 10);
    doc.setTextColor(...MUTED);
    doc.text(label, totalsX, y);
    doc.setTextColor(...color);
    doc.text(value, W - 36, y, { align: 'right' });
    y += bold ? 18 : 16;
  };

  doc.setDrawColor(230, 230, 230);
  doc.setLineWidth(0.5);
  doc.line(totalsX, y - 4, W - 36, y - 4);
  y += 6;

  addRow('Subtotal', pkr(order.itemsPrice));
  addRow('Shipping', order.shippingPrice === 0 ? 'Free' : pkr(order.shippingPrice));
  addRow('Tax (GST)', pkr(order.taxPrice));

  if (order.discount > 0) {
    addRow(`Discount (${order.couponCode || 'Coupon'})`, `- ${pkr(order.discount)}`, false, SUCCESS);
  }

  y += 4;
  doc.setFillColor(...BRAND);
  doc.roundedRect(totalsX - 12, y - 16, W - 36 - totalsX + 48, 34, 5, 5, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(13);
  doc.setTextColor(...WHITE);
  doc.text('Total', totalsX, y + 4);
  doc.text(pkr(order.totalPrice), W - 36, y + 4, { align: 'right' });
  y += 40;

  // ── Footer ────────────────────────────────────────────────────────────────────
  const footerY = H - 52;
  doc.setFillColor(...DARK);
  doc.rect(0, footerY, W, 52, 'F');

  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(150, 160, 175);
  doc.text('Thank you for shopping with HiveMarket!', W / 2, footerY + 18, { align: 'center' });
  doc.text('Questions? Contact support@hivemarket.pk  ·  www.hivemarket.pk  ·  Pakistan 🇵🇰', W / 2, footerY + 34, { align: 'center' });

  // ── Save ─────────────────────────────────────────────────────────────────────
  doc.save(`HiveMarket-Invoice-${order.orderNumber || order._id?.slice(-8)}.pdf`);
}
